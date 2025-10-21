# SDK API Reference

## CeloWorkSDK

Main SDK class that provides access to all modules.

### Constructor

```typescript
new CeloWorkSDK(config: SDKConfig)
```

**Parameters:**
- `config.network`: Network to connect to (`'alfajores'` | `'celo'` | `'localhost'`)
- `config.privateKey?`: Private key for authentication
- `config.rpcUrl?`: Custom RPC URL
- `config.contractAddress?`: Custom contract address
- `config.provider?`: Custom ethers provider
- `config.signer?`: Custom ethers signer

### Properties

- `auth: Auth` - Authentication module
- `escrow: EscrowManager` - Escrow management module
- `jobs: JobManager` - Job management module
- `reputation: ReputationManager` - Reputation tracking module

### Methods

#### getAddress()
```typescript
async getAddress(): Promise<string>
```
Returns the current user's address.

#### getBalance()
```typescript
async getBalance(): Promise<string>
```
Returns the current user's CELO balance.

#### isConnected()
```typescript
isConnected(): boolean
```
Checks if wallet is connected.

#### createJobWithEscrow()
```typescript
async createJobWithEscrow(params: {...}): Promise<{job, escrowId, receipt}>
```
Helper method to create a job and escrow in one transaction.

---

## Auth Module

Handles wallet authentication and connection.

### Methods

#### getProvider()
```typescript
getProvider(): ethers.Provider
```
Returns the current provider.

#### getSigner()
```typescript
getSigner(): ethers.Signer
```
Returns the current signer.

#### getAddress()
```typescript
async getAddress(): Promise<string>
```
Returns the signer's address.

#### getBalance()
```typescript
async getBalance(address?: string): Promise<string>
```
Returns balance for an address (defaults to current user).

#### connectBrowserWallet()
```typescript
async connectBrowserWallet(): Promise<string>
```
Connects to browser wallet (MetaMask, etc.).

#### signMessage()
```typescript
async signMessage(message: string): Promise<string>
```
Signs a message with the current signer.

#### verifyMessage()
```typescript
verifyMessage(message: string, signature: string): string
```
Verifies a signed message and returns the signer address.

---

## EscrowManager Module

Manages escrow contracts and milestone payments.

### Methods

#### createEscrow()
```typescript
async createEscrow(
  freelancer: string,
  milestones: Milestone[]
): Promise<{escrowId: number, receipt: TransactionReceipt}>
```
Creates a new escrow with milestones.

#### getEscrow()
```typescript
async getEscrow(escrowId: number): Promise<Escrow>
```
Retrieves escrow details.

#### submitMilestone()
```typescript
async submitMilestone(
  escrowId: number,
  milestoneIndex: number
): Promise<TransactionReceipt>
```
Freelancer submits a milestone for review.

#### approveMilestone()
```typescript
async approveMilestone(
  escrowId: number,
  milestoneIndex: number
): Promise<TransactionReceipt>
```
Client approves a milestone and releases payment.

#### rejectMilestone()
```typescript
async rejectMilestone(
  escrowId: number,
  milestoneIndex: number
): Promise<TransactionReceipt>
```
Client rejects a milestone.

#### raiseDispute()
```typescript
async raiseDispute(escrowId: number): Promise<TransactionReceipt>
```
Raises a dispute for an escrow.

#### cancelEscrow()
```typescript
async cancelEscrow(escrowId: number): Promise<TransactionReceipt>
```
Cancels an escrow and refunds the client.

#### getClientEscrows()
```typescript
async getClientEscrows(clientAddress?: string): Promise<number[]>
```
Returns all escrow IDs for a client.

#### getFreelancerEscrows()
```typescript
async getFreelancerEscrows(freelancerAddress?: string): Promise<number[]>
```
Returns all escrow IDs for a freelancer.

#### Event Listeners

```typescript
onEscrowCreated(callback: (escrowId, client, freelancer, amount) => void)
onMilestoneApproved(callback: (escrowId, milestoneIndex, amount) => void)
onEscrowCompleted(callback: (escrowId) => void)
```

---

## JobManager Module

Manages job postings (off-chain storage).

### Methods

#### createJob()
```typescript
async createJob(params: CreateJobParams): Promise<Job>
```
Creates a new job posting.

#### getJob()
```typescript
async getJob(jobId: string): Promise<Job | undefined>
```
Retrieves a job by ID.

#### getAllJobs()
```typescript
async getAllJobs(): Promise<Job[]>
```
Returns all jobs.

#### getJobsByClient()
```typescript
async getJobsByClient(clientAddress?: string): Promise<Job[]>
```
Returns jobs posted by a client.

#### getJobsByFreelancer()
```typescript
async getJobsByFreelancer(freelancerAddress?: string): Promise<Job[]>
```
Returns jobs assigned to a freelancer.

#### getOpenJobs()
```typescript
async getOpenJobs(): Promise<Job[]>
```
Returns all open jobs.

#### assignJob()
```typescript
async assignJob(jobId: string, freelancerAddress: string): Promise<Job>
```
Assigns a job to a freelancer.

#### updateJobStatus()
```typescript
async updateJobStatus(jobId: string, status: JobStatus): Promise<Job>
```
Updates job status.

#### linkEscrow()
```typescript
async linkEscrow(jobId: string, escrowId: number): Promise<Job>
```
Links a job to an escrow.

#### searchJobs()
```typescript
async searchJobs(criteria: {...}): Promise<Job[]>
```
Searches jobs by criteria (status, category, tags, budget).

---

## ReputationManager Module

Tracks user reputation and reviews.

### Methods

#### getReputation()
```typescript
async getReputation(address?: string): Promise<Reputation>
```
Returns reputation for an address.

#### addReview()
```typescript
async addReview(
  jobId: string,
  reviewee: string,
  rating: number,
  comment: string
): Promise<Review>
```
Adds a review for a user.

#### getReviews()
```typescript
async getReviews(address?: string): Promise<Review[]>
```
Returns all reviews for an address.

#### updateJobStats()
```typescript
async updateJobStats(address: string, completed: boolean): Promise<void>
```
Updates job completion statistics.

#### updateFinancials()
```typescript
async updateFinancials(
  address: string,
  amount: string,
  type: 'earned' | 'spent'
): Promise<void>
```
Updates earnings or spending.

#### awardBadge()
```typescript
async awardBadge(address: string, badge: Omit<Badge, 'earnedAt'>): Promise<Badge>
```
Awards a badge to a user.

#### getTopRated()
```typescript
async getTopRated(limit?: number): Promise<Reputation[]>
```
Returns top-rated users.

#### getCompletionRate()
```typescript
getCompletionRate(reputation: Reputation): number
```
Calculates completion rate percentage.

---

## Types

See [types/index.ts](../sdk/types/index.ts) for complete type definitions.

### Key Types

- `Escrow` - Escrow contract data
- `Milestone` - Milestone data
- `Job` - Job posting data
- `Reputation` - User reputation data
- `Review` - User review data
- `SDKConfig` - SDK configuration
- `TransactionReceipt` - Transaction receipt data

### Enums

- `EscrowStatus` - Escrow status values
- `MilestoneStatus` - Milestone status values
- `JobStatus` - Job status values
