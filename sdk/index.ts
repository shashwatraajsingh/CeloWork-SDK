/**
 * CeloWork SDK - Main Entry Point
 * A drop-in developer toolkit for building decentralized freelance marketplaces on Celo
 */

import { Auth } from "./core/auth";
import { EscrowManager } from "./core/escrow";
import { JobManager } from "./core/jobs";
import { ReputationManager } from "./core/reputation";
import { SelfProtocolManager } from "./core/self-protocol";
import { SDKConfig } from "./types";

export * from "./types";
export * from "./config/networks";
export * from "./config/contracts";
export { VerificationLevel } from "./core/self-protocol";

export class CeloWorkSDK {
  public auth: Auth;
  public escrow: EscrowManager;
  public jobs: JobManager;
  public reputation: ReputationManager;
  public selfProtocol: SelfProtocolManager;

  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;

    // Initialize core modules
    this.auth = new Auth(config);
    this.selfProtocol = new SelfProtocolManager(this.auth, true); // Mock mode enabled by default
    this.escrow = new EscrowManager(this.auth, config.network, config.contractAddress);
    this.jobs = new JobManager(this.auth, this.selfProtocol);
    this.reputation = new ReputationManager(this.auth);
  }

  /**
   * Get SDK configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Get current network
   */
  getNetwork(): string {
    return this.config.network;
  }

  /**
   * Get current user address
   */
  async getAddress(): Promise<string> {
    return await this.auth.getAddress();
  }

  /**
   * Get current user balance
   */
  async getBalance(): Promise<string> {
    return await this.auth.getBalance();
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.auth.isConnected();
  }

  /**
   * Quick helper: Create job with escrow in one call
   */
  async createJobWithEscrow(params: {
    title: string;
    description: string;
    budget: string;
    freelancer: string;
    milestones: Array<{ description: string; amount: string }>;
    tags?: string[];
    category?: string;
  }) {
    // Create job
    const job = await this.jobs.createJob({
      title: params.title,
      description: params.description,
      budget: params.budget,
      milestones: params.milestones,
      tags: params.tags,
      category: params.category,
    });

    // Assign to freelancer
    await this.jobs.assignJob(job.id, params.freelancer);

    // Create escrow
    const { escrowId, receipt } = await this.escrow.createEscrow(
      params.freelancer,
      params.milestones.map((m) => ({ ...m, status: 0 }))
    );

    // Link escrow to job
    await this.jobs.linkEscrow(job.id, escrowId);

    return {
      job,
      escrowId,
      receipt,
    };
  }

  /**
   * Quick helper: Complete milestone workflow
   */
  async completeMilestone(escrowId: number, milestoneIndex: number) {
    // Submit milestone
    await this.escrow.submitMilestone(escrowId, milestoneIndex);

    // Note: Approval must be done by the client separately
    return {
      message: "Milestone submitted for review",
      escrowId,
      milestoneIndex,
    };
  }
}

// Default export
export default CeloWorkSDK;
