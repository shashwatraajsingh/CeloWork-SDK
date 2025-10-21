/**
 * Core type definitions for CeloWork SDK
 */

export enum EscrowStatus {
  Created = 0,
  Funded = 1,
  InProgress = 2,
  Completed = 3,
  Disputed = 4,
  Cancelled = 5,
  Refunded = 6,
}

export enum MilestoneStatus {
  Pending = 0,
  Submitted = 1,
  Approved = 2,
  Rejected = 3,
}

export interface Milestone {
  description: string;
  amount: string; // Amount in CELO (as string to avoid precision issues)
  status: MilestoneStatus;
  submittedAt?: number;
}

export interface Escrow {
  id: number;
  client: string; // Ethereum address
  freelancer: string; // Ethereum address
  totalAmount: string; // Total amount in CELO
  releasedAmount: string; // Released amount in CELO
  status: EscrowStatus;
  createdAt: number; // Unix timestamp
  completedAt?: number; // Unix timestamp
  milestones: Milestone[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: string; // Budget in CELO
  client: string; // Ethereum address
  freelancer?: string; // Ethereum address (optional until assigned)
  escrowId?: number; // Associated escrow ID
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  milestones: JobMilestone[];
  tags?: string[];
  category?: string;
}

export enum JobStatus {
  Open = "open",
  Assigned = "assigned",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
  Disputed = "disputed",
}

export interface JobMilestone {
  description: string;
  amount: string; // Amount in CELO
  dueDate?: number; // Unix timestamp
}

export interface Reputation {
  address: string; // Ethereum address
  totalJobs: number;
  completedJobs: number;
  rating: number; // Average rating (0-5)
  totalEarned?: string; // Total earned in CELO (for freelancers)
  totalSpent?: string; // Total spent in CELO (for clients)
  reviews: Review[];
  badges?: Badge[];
}

export interface Review {
  id: string;
  jobId: string;
  reviewer: string; // Ethereum address
  reviewee: string; // Ethereum address
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  earnedAt: number;
}

export interface SDKConfig {
  network: "alfajores" | "celo" | "localhost";
  privateKey?: string;
  rpcUrl?: string;
  contractAddress?: string;
  provider?: any; // ethers.Provider
  signer?: any; // ethers.Signer
}

export interface CreateJobParams {
  title: string;
  description: string;
  budget: string;
  milestones: JobMilestone[];
  tags?: string[];
  category?: string;
}

export interface CreateEscrowParams {
  freelancer: string;
  milestones: Milestone[];
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  status: number;
}

export interface SelfProtocolIdentity {
  address: string;
  isVerified: boolean;
  verificationLevel?: "basic" | "advanced" | "premium";
  verifiedAt?: number;
  attributes?: Record<string, any>;
}
