/**
 * Job management module (off-chain storage placeholder)
 * In production, this would integrate with a backend API or IPFS
 */

import { Job, JobStatus, CreateJobParams } from "../types";
import { Auth } from "./auth";
import { SelfProtocolManager, VerificationLevel } from "./self-protocol";

export interface JobManagerConfig {
  requireVerification?: boolean;
  minVerificationLevel?: VerificationLevel;
}

export class JobManager {
  private auth: Auth;
  private jobs: Map<string, Job>;
  private selfProtocol?: SelfProtocolManager;
  private config: JobManagerConfig;

  constructor(auth: Auth, selfProtocol?: SelfProtocolManager, config?: JobManagerConfig) {
    this.auth = auth;
    this.jobs = new Map();
    this.selfProtocol = selfProtocol;
    this.config = config || {
      requireVerification: false,
      minVerificationLevel: VerificationLevel.Basic,
    };
  }

  /**
   * Set Self Protocol manager for verification
   */
  setSelfProtocol(selfProtocol: SelfProtocolManager): void {
    this.selfProtocol = selfProtocol;
  }

  /**
   * Configure verification requirements
   */
  setVerificationConfig(config: JobManagerConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a new job posting
   */
  async createJob(params: CreateJobParams): Promise<Job> {
    const address = await this.auth.getAddress();

    // Check verification if required
    if (this.config.requireVerification && this.selfProtocol) {
      const isVerified = await this.selfProtocol.isVerified(
        address,
        this.config.minVerificationLevel
      );

      if (!isVerified) {
        throw new Error(
          `User must be verified at ${this.config.minVerificationLevel} level to create jobs. ` +
          `Please complete verification using sdk.selfProtocol.requestVerification()`
        );
      }
    }

    const jobId = this.generateJobId();
    const now = Date.now();

    const job: Job = {
      id: jobId,
      title: params.title,
      description: params.description,
      budget: params.budget,
      client: address,
      status: JobStatus.Open,
      createdAt: now,
      updatedAt: now,
      milestones: params.milestones,
      tags: params.tags,
      category: params.category,
    };

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<Job | undefined> {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by client
   */
  async getJobsByClient(clientAddress?: string): Promise<Job[]> {
    const address = clientAddress || (await this.auth.getAddress());
    return Array.from(this.jobs.values()).filter((job) => job.client === address);
  }

  /**
   * Get jobs by freelancer
   */
  async getJobsByFreelancer(freelancerAddress?: string): Promise<Job[]> {
    const address = freelancerAddress || (await this.auth.getAddress());
    return Array.from(this.jobs.values()).filter((job) => job.freelancer === address);
  }

  /**
   * Get open jobs
   */
  async getOpenJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter((job) => job.status === JobStatus.Open);
  }

  /**
   * Assign a job to a freelancer
   */
  async assignJob(jobId: string, freelancerAddress: string): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const currentAddress = await this.auth.getAddress();
    if (job.client !== currentAddress) {
      throw new Error("Only the client can assign this job");
    }

    if (job.status !== JobStatus.Open) {
      throw new Error("Job is not open for assignment");
    }

    job.freelancer = freelancerAddress;
    job.status = JobStatus.Assigned;
    job.updatedAt = Date.now();

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    job.status = status;
    job.updatedAt = Date.now();

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Link job to escrow
   */
  async linkEscrow(jobId: string, escrowId: number): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    job.escrowId = escrowId;
    job.status = JobStatus.InProgress;
    job.updatedAt = Date.now();

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Search jobs by criteria
   */
  async searchJobs(criteria: {
    status?: JobStatus;
    category?: string;
    tags?: string[];
    minBudget?: string;
    maxBudget?: string;
  }): Promise<Job[]> {
    let results = Array.from(this.jobs.values());

    if (criteria.status) {
      results = results.filter((job) => job.status === criteria.status);
    }

    if (criteria.category) {
      results = results.filter((job) => job.category === criteria.category);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((job) =>
        job.tags?.some((tag) => criteria.tags!.includes(tag))
      );
    }

    if (criteria.minBudget) {
      results = results.filter(
        (job) => parseFloat(job.budget) >= parseFloat(criteria.minBudget!)
      );
    }

    if (criteria.maxBudget) {
      results = results.filter(
        (job) => parseFloat(job.budget) <= parseFloat(criteria.maxBudget!)
      );
    }

    return results;
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
