/**
 * Escrow management module
 */

import { ethers } from "ethers";
import { Auth } from "./auth";
import { Escrow, Milestone, EscrowStatus, MilestoneStatus, TransactionReceipt } from "../types";
import { ESCROW_ABI, getContractAddress } from "../config/contracts";

export class EscrowManager {
  private auth: Auth;
  private contract?: ethers.Contract;
  private network: string;
  private contractAddress?: string;

  constructor(auth: Auth, network: string, contractAddress?: string) {
    this.auth = auth;
    this.network = network;
    this.contractAddress = contractAddress;

    // Only initialize contract if address is provided
    if (contractAddress) {
      this.contract = new ethers.Contract(contractAddress, ESCROW_ABI, auth.getSigner());
    } else {
      // Try to get default address, but don't throw if not available
      try {
        const address = getContractAddress(network);
        this.contract = new ethers.Contract(address, ESCROW_ABI, auth.getSigner());
      } catch (error) {
        // Contract not deployed yet, will be initialized later
        this.contract = undefined;
      }
    }
  }

  /**
   * Check if contract is initialized
   */
  private ensureContract(): void {
    if (!this.contract) {
      throw new Error(
        'Escrow contract not initialized. Please deploy the contract or provide a contract address.'
      );
    }
  }

  /**
   * Create a new escrow with milestones
   */
  async createEscrow(
    freelancer: string,
    milestones: Milestone[]
  ): Promise<{ escrowId: number; receipt: TransactionReceipt }> {
    this.ensureContract();
    
    if (!ethers.isAddress(freelancer)) {
      throw new Error("Invalid freelancer address");
    }

    if (milestones.length === 0) {
      throw new Error("At least one milestone is required");
    }

    const descriptions = milestones.map((m) => m.description);
    const amounts = milestones.map((m) => ethers.parseEther(m.amount));
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);

    const tx = await this.contract!.createEscrow(descriptions, amounts, {
      value: totalAmount,
    });

    const receipt = await tx.wait();

    // Extract escrow ID from event
    const event = receipt.logs.find(
      (log: any) => log.fragment && log.fragment.name === "EscrowCreated"
    );
    const escrowId = event ? Number(event.args[0]) : 0;

    return {
      escrowId,
      receipt: {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      },
    };
  }

  /**
   * Get escrow details by ID
   */
  async getEscrow(escrowId: number): Promise<Escrow> {
    this.ensureContract();
    const escrowData = await this.contract!.getEscrow(escrowId);
    const milestoneCount = await this.contract!.getMilestoneCount(escrowId);

    const milestones: Milestone[] = [];
    for (let i = 0; i < Number(milestoneCount); i++) {
      const milestoneData = await this.contract!.getMilestone(escrowId, i);
      milestones.push({
        description: milestoneData.description,
        amount: ethers.formatEther(milestoneData.amount),
        status: milestoneData.status as MilestoneStatus,
        submittedAt: milestoneData.submittedAt > 0 ? Number(milestoneData.submittedAt) : undefined,
      });
    }

    return {
      id: Number(escrowData.id),
      client: escrowData.client,
      freelancer: escrowData.freelancer,
      totalAmount: ethers.formatEther(escrowData.totalAmount),
      releasedAmount: ethers.formatEther(escrowData.releasedAmount),
      status: escrowData.status as EscrowStatus,
      createdAt: Number(escrowData.createdAt),
      completedAt: escrowData.completedAt > 0 ? Number(escrowData.completedAt) : undefined,
      milestones,
    };
  }

  /**
   * Submit a milestone for review (freelancer only)
   */
  async submitMilestone(
    escrowId: number,
    milestoneIndex: number
  ): Promise<TransactionReceipt> {
    this.ensureContract();
    const tx = await this.contract!.submitMilestone(escrowId, milestoneIndex);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    };
  }

  /**
   * Approve a milestone and release payment (client only)
   */
  async approveMilestone(
    escrowId: number,
    milestoneIndex: number
  ): Promise<TransactionReceipt> {
    this.ensureContract();
    const tx = await this.contract!.approveMilestone(escrowId, milestoneIndex);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    };
  }

  /**
   * Reject a milestone (client only)
   */
  async rejectMilestone(
    escrowId: number,
    milestoneIndex: number
  ): Promise<TransactionReceipt> {
    this.ensureContract();
    const tx = await this.contract!.rejectMilestone(escrowId, milestoneIndex);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    };
  }

  /**
   * Raise a dispute for an escrow
   */
  async raiseDispute(escrowId: number): Promise<TransactionReceipt> {
    this.ensureContract();
    const tx = await this.contract!.raiseDispute(escrowId);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    };
  }

  /**
   * Cancel an escrow and refund client
   */
  async cancelEscrow(escrowId: number): Promise<TransactionReceipt> {
    this.ensureContract();
    const tx = await this.contract!.cancelEscrow(escrowId);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    };
  }

  /**
   * Get all escrows for a client
   */
  async getClientEscrows(clientAddress?: string): Promise<number[]> {
    this.ensureContract();
    const address = clientAddress || (await this.auth.getAddress());
    const escrowIds = await this.contract!.getClientEscrows(address);
    return escrowIds.map((id: bigint) => Number(id));
  }

  /**
   * Get all escrows for a freelancer
   */
  async getFreelancerEscrows(freelancerAddress?: string): Promise<number[]> {
    this.ensureContract();
    const address = freelancerAddress || (await this.auth.getAddress());
    const escrowIds = await this.contract!.getFreelancerEscrows(address);
    return escrowIds.map((id: bigint) => Number(id));
  }

  /**
   * Listen to escrow events
   */
  onEscrowCreated(callback: (escrowId: number, client: string, freelancer: string, amount: string) => void) {
    this.ensureContract();
    this.contract!.on("EscrowCreated", (escrowId, client, freelancer, amount) => {
      callback(Number(escrowId), client, freelancer, ethers.formatEther(amount));
    });
  }

  onMilestoneApproved(callback: (escrowId: number, milestoneIndex: number, amount: string) => void) {
    this.ensureContract();
    this.contract!.on("MilestoneApproved", (escrowId, milestoneIndex, amount) => {
      callback(Number(escrowId), Number(milestoneIndex), ethers.formatEther(amount));
    });
  }

  onEscrowCompleted(callback: (escrowId: number) => void) {
    this.ensureContract();
    this.contract!.on("EscrowCompleted", (escrowId) => {
      callback(Number(escrowId));
    });
  }
}
