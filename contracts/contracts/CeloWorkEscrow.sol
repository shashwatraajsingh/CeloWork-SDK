// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CeloWorkEscrow
 * @dev Escrow contract for milestone-based freelance payments on Celo
 */
contract CeloWorkEscrow is ReentrancyGuard, Ownable {
    
    enum EscrowStatus { Created, Funded, InProgress, Completed, Disputed, Cancelled, Refunded }
    enum MilestoneStatus { Pending, Submitted, Approved, Rejected }
    
    struct Milestone {
        string description;
        uint256 amount;
        MilestoneStatus status;
        uint256 submittedAt;
    }
    
    struct Escrow {
        uint256 id;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 completedAt;
        Milestone[] milestones;
    }
    
    // State variables
    uint256 private escrowCounter;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public freelancerEscrows;
    
    // Events
    event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event MilestoneSubmitted(uint256 indexed escrowId, uint256 milestoneIndex);
    event MilestoneApproved(uint256 indexed escrowId, uint256 milestoneIndex, uint256 amount);
    event MilestoneRejected(uint256 indexed escrowId, uint256 milestoneIndex);
    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowCancelled(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    event DisputeRaised(uint256 indexed escrowId);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new escrow with milestones
     * @param _freelancer Address of the freelancer
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _milestoneAmounts Array of milestone amounts in wei
     */
    function createEscrow(
        address _freelancer,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external payable returns (uint256) {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Client and freelancer cannot be the same");
        require(_milestoneDescriptions.length > 0, "At least one milestone required");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be greater than 0");
            totalAmount += _milestoneAmounts[i];
        }
        
        require(msg.value == totalAmount, "Sent value must equal total milestone amounts");
        
        uint256 escrowId = escrowCounter++;
        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.id = escrowId;
        newEscrow.client = msg.sender;
        newEscrow.freelancer = _freelancer;
        newEscrow.totalAmount = totalAmount;
        newEscrow.releasedAmount = 0;
        newEscrow.status = EscrowStatus.Funded;
        newEscrow.createdAt = block.timestamp;
        
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newEscrow.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                status: MilestoneStatus.Pending,
                submittedAt: 0
            }));
        }
        
        clientEscrows[msg.sender].push(escrowId);
        freelancerEscrows[_freelancer].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, _freelancer, totalAmount);
        emit EscrowFunded(escrowId, totalAmount);
        
        return escrowId;
    }
    
    /**
     * @dev Freelancer submits a milestone for review
     * @param _escrowId ID of the escrow
     * @param _milestoneIndex Index of the milestone to submit
     */
    function submitMilestone(uint256 _escrowId, uint256 _milestoneIndex) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.freelancer, "Only freelancer can submit milestone");
        require(escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.InProgress, "Invalid escrow status");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(escrow.milestones[_milestoneIndex].status == MilestoneStatus.Pending, "Milestone already submitted");
        
        escrow.milestones[_milestoneIndex].status = MilestoneStatus.Submitted;
        escrow.milestones[_milestoneIndex].submittedAt = block.timestamp;
        
        if (escrow.status == EscrowStatus.Funded) {
            escrow.status = EscrowStatus.InProgress;
        }
        
        emit MilestoneSubmitted(_escrowId, _milestoneIndex);
    }
    
    /**
     * @dev Client approves a milestone and releases payment
     * @param _escrowId ID of the escrow
     * @param _milestoneIndex Index of the milestone to approve
     */
    function approveMilestone(uint256 _escrowId, uint256 _milestoneIndex) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.client, "Only client can approve milestone");
        require(escrow.status == EscrowStatus.InProgress, "Invalid escrow status");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(escrow.milestones[_milestoneIndex].status == MilestoneStatus.Submitted, "Milestone not submitted");
        
        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        milestone.status = MilestoneStatus.Approved;
        
        uint256 amount = milestone.amount;
        escrow.releasedAmount += amount;
        
        // Transfer funds to freelancer
        (bool success, ) = escrow.freelancer.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit MilestoneApproved(_escrowId, _milestoneIndex, amount);
        
        // Check if all milestones are approved
        bool allApproved = true;
        for (uint256 i = 0; i < escrow.milestones.length; i++) {
            if (escrow.milestones[i].status != MilestoneStatus.Approved) {
                allApproved = false;
                break;
            }
        }
        
        if (allApproved) {
            escrow.status = EscrowStatus.Completed;
            escrow.completedAt = block.timestamp;
            emit EscrowCompleted(_escrowId);
        }
    }
    
    /**
     * @dev Client rejects a milestone
     * @param _escrowId ID of the escrow
     * @param _milestoneIndex Index of the milestone to reject
     */
    function rejectMilestone(uint256 _escrowId, uint256 _milestoneIndex) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.client, "Only client can reject milestone");
        require(escrow.status == EscrowStatus.InProgress, "Invalid escrow status");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(escrow.milestones[_milestoneIndex].status == MilestoneStatus.Submitted, "Milestone not submitted");
        
        escrow.milestones[_milestoneIndex].status = MilestoneStatus.Rejected;
        
        emit MilestoneRejected(_escrowId, _milestoneIndex);
    }
    
    /**
     * @dev Raise a dispute for an escrow
     * @param _escrowId ID of the escrow
     */
    function raiseDispute(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.client || msg.sender == escrow.freelancer, "Only parties can raise dispute");
        require(escrow.status == EscrowStatus.InProgress, "Invalid escrow status");
        
        escrow.status = EscrowStatus.Disputed;
        emit DisputeRaised(_escrowId);
    }
    
    /**
     * @dev Cancel escrow and refund client (only if no milestones approved)
     * @param _escrowId ID of the escrow
     */
    function cancelEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.client, "Only client can cancel");
        require(escrow.status == EscrowStatus.Funded, "Can only cancel funded escrow");
        require(escrow.releasedAmount == 0, "Cannot cancel after payments released");
        
        escrow.status = EscrowStatus.Cancelled;
        
        uint256 refundAmount = escrow.totalAmount;
        
        // Refund client
        (bool success, ) = escrow.client.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit EscrowCancelled(_escrowId);
        emit EscrowRefunded(_escrowId, refundAmount);
    }
    
    /**
     * @dev Get escrow details
     * @param _escrowId ID of the escrow
     */
    function getEscrow(uint256 _escrowId) external view returns (
        uint256 id,
        address client,
        address freelancer,
        uint256 totalAmount,
        uint256 releasedAmount,
        EscrowStatus status,
        uint256 createdAt,
        uint256 completedAt
    ) {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.id,
            escrow.client,
            escrow.freelancer,
            escrow.totalAmount,
            escrow.releasedAmount,
            escrow.status,
            escrow.createdAt,
            escrow.completedAt
        );
    }
    
    /**
     * @dev Get milestone details
     * @param _escrowId ID of the escrow
     * @param _milestoneIndex Index of the milestone
     */
    function getMilestone(uint256 _escrowId, uint256 _milestoneIndex) external view returns (
        string memory description,
        uint256 amount,
        MilestoneStatus status,
        uint256 submittedAt
    ) {
        require(_milestoneIndex < escrows[_escrowId].milestones.length, "Invalid milestone index");
        Milestone storage milestone = escrows[_escrowId].milestones[_milestoneIndex];
        return (milestone.description, milestone.amount, milestone.status, milestone.submittedAt);
    }
    
    /**
     * @dev Get number of milestones for an escrow
     * @param _escrowId ID of the escrow
     */
    function getMilestoneCount(uint256 _escrowId) external view returns (uint256) {
        return escrows[_escrowId].milestones.length;
    }
    
    /**
     * @dev Get all escrow IDs for a client
     * @param _client Address of the client
     */
    function getClientEscrows(address _client) external view returns (uint256[] memory) {
        return clientEscrows[_client];
    }
    
    /**
     * @dev Get all escrow IDs for a freelancer
     * @param _freelancer Address of the freelancer
     */
    function getFreelancerEscrows(address _freelancer) external view returns (uint256[] memory) {
        return freelancerEscrows[_freelancer];
    }
}
