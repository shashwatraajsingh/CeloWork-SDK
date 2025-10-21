import { expect } from "chai";
import { ethers } from "hardhat";
import { CeloWorkEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CeloWorkEscrow", function () {
  let escrow: CeloWorkEscrow;
  let client: SignerWithAddress;
  let freelancer: SignerWithAddress;
  let other: SignerWithAddress;

  const milestoneDescriptions = ["Design", "Development", "Testing"];
  const milestoneAmounts = [
    ethers.parseEther("1"),
    ethers.parseEther("2"),
    ethers.parseEther("1"),
  ];
  const totalAmount = ethers.parseEther("4");

  beforeEach(async function () {
    [client, freelancer, other] = await ethers.getSigners();

    const CeloWorkEscrow = await ethers.getContractFactory("CeloWorkEscrow");
    escrow = await CeloWorkEscrow.deploy();
    await escrow.waitForDeployment();
  });

  describe("Escrow Creation", function () {
    it("Should create an escrow with milestones", async function () {
      const tx = await escrow
        .connect(client)
        .createEscrow(freelancer.address, milestoneDescriptions, milestoneAmounts, {
          value: totalAmount,
        });

      await expect(tx)
        .to.emit(escrow, "EscrowCreated")
        .withArgs(0, client.address, freelancer.address, totalAmount);

      const escrowData = await escrow.getEscrow(0);
      expect(escrowData.client).to.equal(client.address);
      expect(escrowData.freelancer).to.equal(freelancer.address);
      expect(escrowData.totalAmount).to.equal(totalAmount);
      expect(escrowData.status).to.equal(1); // Funded
    });

    it("Should revert if value doesn't match total", async function () {
      await expect(
        escrow
          .connect(client)
          .createEscrow(freelancer.address, milestoneDescriptions, milestoneAmounts, {
            value: ethers.parseEther("3"),
          })
      ).to.be.revertedWith("Sent value must equal total milestone amounts");
    });

    it("Should revert if freelancer is zero address", async function () {
      await expect(
        escrow
          .connect(client)
          .createEscrow(ethers.ZeroAddress, milestoneDescriptions, milestoneAmounts, {
            value: totalAmount,
          })
      ).to.be.revertedWith("Invalid freelancer address");
    });
  });

  describe("Milestone Submission", function () {
    beforeEach(async function () {
      await escrow
        .connect(client)
        .createEscrow(freelancer.address, milestoneDescriptions, milestoneAmounts, {
          value: totalAmount,
        });
    });

    it("Should allow freelancer to submit milestone", async function () {
      await expect(escrow.connect(freelancer).submitMilestone(0, 0))
        .to.emit(escrow, "MilestoneSubmitted")
        .withArgs(0, 0);

      const milestone = await escrow.getMilestone(0, 0);
      expect(milestone.status).to.equal(1); // Submitted
    });

    it("Should revert if non-freelancer tries to submit", async function () {
      await expect(
        escrow.connect(other).submitMilestone(0, 0)
      ).to.be.revertedWith("Only freelancer can submit milestone");
    });
  });

  describe("Milestone Approval", function () {
    beforeEach(async function () {
      await escrow
        .connect(client)
        .createEscrow(freelancer.address, milestoneDescriptions, milestoneAmounts, {
          value: totalAmount,
        });
      await escrow.connect(freelancer).submitMilestone(0, 0);
    });

    it("Should allow client to approve milestone and release payment", async function () {
      const freelancerBalanceBefore = await ethers.provider.getBalance(
        freelancer.address
      );

      await expect(escrow.connect(client).approveMilestone(0, 0))
        .to.emit(escrow, "MilestoneApproved")
        .withArgs(0, 0, milestoneAmounts[0]);

      const freelancerBalanceAfter = await ethers.provider.getBalance(
        freelancer.address
      );
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(
        milestoneAmounts[0]
      );

      const milestone = await escrow.getMilestone(0, 0);
      expect(milestone.status).to.equal(2); // Approved
    });

    it("Should complete escrow when all milestones approved", async function () {
      await escrow.connect(client).approveMilestone(0, 0);
      await escrow.connect(freelancer).submitMilestone(0, 1);
      await escrow.connect(client).approveMilestone(0, 1);
      await escrow.connect(freelancer).submitMilestone(0, 2);

      await expect(escrow.connect(client).approveMilestone(0, 2))
        .to.emit(escrow, "EscrowCompleted")
        .withArgs(0);

      const escrowData = await escrow.getEscrow(0);
      expect(escrowData.status).to.equal(3); // Completed
    });
  });

  describe("Escrow Cancellation", function () {
    beforeEach(async function () {
      await escrow
        .connect(client)
        .createEscrow(freelancer.address, milestoneDescriptions, milestoneAmounts, {
          value: totalAmount,
        });
    });

    it("Should allow client to cancel unfunded escrow", async function () {
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      const tx = await escrow.connect(client).cancelEscrow(0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);

      expect(clientBalanceAfter).to.be.closeTo(
        clientBalanceBefore + totalAmount - gasUsed,
        ethers.parseEther("0.001")
      );
    });

    it("Should revert if trying to cancel after milestone submitted", async function () {
      await escrow.connect(freelancer).submitMilestone(0, 0);

      await expect(escrow.connect(client).cancelEscrow(0)).to.be.revertedWith(
        "Can only cancel funded escrow"
      );
    });
  });
});
