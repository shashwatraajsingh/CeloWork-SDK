# CeloWork SDK Demo

This demo application showcases the complete workflow of the CeloWork SDK, including:

1. Creating a job with escrow
2. Freelancer submitting milestones
3. Client approving milestones
4. Payment release to freelancer

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Add your private keys to `.env`:**
   - `CLIENT_PRIVATE_KEY`: Private key for the client wallet
   - `FREELANCER_PRIVATE_KEY`: Private key for the freelancer wallet

4. **Get testnet CELO:**
   - Visit https://faucet.celo.org/alfajores
   - Request CELO for both client and freelancer addresses
   - You'll need at least 5 CELO for the client

## Running the Demo

```bash
npm start
```

## What the Demo Does

### Step 1: Job Creation with Escrow
- Client creates a job with 3 milestones
- Total budget: 3 CELO
- Escrow is funded with the full amount

### Step 2: Milestone Submission
- Freelancer submits the first milestone for review

### Step 3: Milestone Approval
- Client approves the first milestone
- Payment (1 CELO) is released to freelancer
- Escrow updates to show released amount

## Demo Output

The demo will show:
- Wallet addresses and balances
- Job and escrow creation details
- Transaction hashes for all operations
- Balance changes after payment
- Summary of completed actions

## Next Steps

After running the demo, you can:

1. **Complete remaining milestones:**
   - Submit milestone 1: `freelancerSDK.escrow.submitMilestone(escrowId, 1)`
   - Approve milestone 1: `clientSDK.escrow.approveMilestone(escrowId, 1)`
   - Repeat for milestone 2

2. **Explore other features:**
   - View all client escrows: `clientSDK.escrow.getClientEscrows()`
   - View all freelancer escrows: `freelancerSDK.escrow.getFreelancerEscrows()`
   - Check job details: `clientSDK.jobs.getJob(jobId)`

3. **Test error scenarios:**
   - Try rejecting a milestone
   - Try raising a dispute
   - Try canceling an escrow

## Troubleshooting

### "Insufficient funds"
Make sure your client wallet has at least 5 CELO from the faucet.

### "Contract not deployed"
The contract must be deployed to Alfajores first. Run:
```bash
cd ../contracts
npm run deploy
```

### "Invalid private key"
Ensure your private keys in `.env` are valid and don't include the `0x` prefix.

## Learn More

- [Getting Started Guide](../docs/getting-started.md)
- [SDK API Reference](../docs/sdk-reference.md)
- [Smart Contracts Documentation](../docs/contracts.md)
