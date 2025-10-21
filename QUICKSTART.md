# CeloWork SDK - Quick Start Guide

Get started with CeloWork SDK in 5 minutes!

## 🚀 Installation

```bash
npm install celowork-sdk
```

## 📋 Prerequisites

1. **Get a Celo Wallet**
   - Create a wallet using MetaMask or any Ethereum wallet
   - Switch to Celo Alfajores Testnet

2. **Get Testnet CELO**
   - Visit: https://faucet.celo.org/alfajores
   - Enter your address and request testnet CELO

## 💻 Basic Usage

### Initialize SDK

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-private-key'
});
```

### Create a Job with Escrow

```typescript
const result = await sdk.createJobWithEscrow({
  title: 'Build a Website',
  description: 'Need a modern landing page',
  budget: '100', // in CELO
  freelancer: '0xFreelancerAddress',
  milestones: [
    { description: 'Design', amount: '30' },
    { description: 'Development', amount: '50' },
    { description: 'Testing', amount: '20' }
  ]
});

console.log('Escrow ID:', result.escrowId);
```

### Freelancer: Submit Milestone

```typescript
await sdk.escrow.submitMilestone(escrowId, 0);
```

### Client: Approve Milestone

```typescript
await sdk.escrow.approveMilestone(escrowId, 0);
// Payment automatically released to freelancer!
```

## 🎯 Common Use Cases

### 1. Create a Job Posting

```typescript
const job = await sdk.jobs.createJob({
  title: 'Logo Design',
  description: 'Need a modern logo for my startup',
  budget: '50',
  milestones: [
    { description: 'Initial concepts', amount: '20' },
    { description: 'Final design', amount: '30' }
  ],
  tags: ['design', 'branding'],
  category: 'Design'
});
```

### 2. Search for Jobs

```typescript
const openJobs = await sdk.jobs.getOpenJobs();
const webDevJobs = await sdk.jobs.searchJobs({
  category: 'Web Development',
  minBudget: '50',
  maxBudget: '500'
});
```

### 3. Check Escrow Status

```typescript
const escrow = await sdk.escrow.getEscrow(escrowId);
console.log('Status:', escrow.status);
console.log('Total:', escrow.totalAmount);
console.log('Released:', escrow.releasedAmount);
```

### 4. View Reputation

```typescript
const reputation = await sdk.reputation.getReputation(address);
console.log('Rating:', reputation.rating);
console.log('Completed Jobs:', reputation.completedJobs);
```

### 5. Add a Review

```typescript
await sdk.reputation.addReview(
  jobId,
  freelancerAddress,
  5, // rating 1-5
  'Excellent work, delivered on time!'
);
```

## 🔔 Listen to Events

```typescript
// Listen for escrow creation
sdk.escrow.onEscrowCreated((escrowId, client, freelancer, amount) => {
  console.log(`New escrow ${escrowId} created with ${amount} CELO`);
});

// Listen for milestone approvals
sdk.escrow.onMilestoneApproved((escrowId, milestoneIndex, amount) => {
  console.log(`Milestone ${milestoneIndex} approved, ${amount} CELO released`);
});

// Listen for escrow completion
sdk.escrow.onEscrowCompleted((escrowId) => {
  console.log(`Escrow ${escrowId} completed!`);
});
```

## 🌐 Browser Integration

```typescript
// Connect to MetaMask or other browser wallet
const sdk = new CeloWorkSDK({
  network: 'alfajores'
});

await sdk.auth.connectBrowserWallet();
const address = await sdk.getAddress();
```

## 🛠️ Advanced Features

### Custom RPC Provider

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://your-rpc-url');
const sdk = new CeloWorkSDK({
  network: 'alfajores',
  provider: provider
});
```

### Sign Messages

```typescript
const message = 'Verify my identity';
const signature = await sdk.auth.signMessage(message);
const signer = sdk.auth.verifyMessage(message, signature);
```

### Get All Your Escrows

```typescript
// As a client
const myClientEscrows = await sdk.escrow.getClientEscrows();

// As a freelancer
const myFreelancerEscrows = await sdk.escrow.getFreelancerEscrows();
```

## 📱 Complete Example

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

async function main() {
  // Initialize
  const sdk = new CeloWorkSDK({
    network: 'alfajores',
    privateKey: process.env.PRIVATE_KEY
  });

  // Check balance
  const balance = await sdk.getBalance();
  console.log('Balance:', balance, 'CELO');

  // Create job with escrow
  const { job, escrowId } = await sdk.createJobWithEscrow({
    title: 'Build Mobile App',
    description: 'iOS and Android app',
    budget: '500',
    freelancer: '0xFreelancerAddress',
    milestones: [
      { description: 'UI/UX Design', amount: '100' },
      { description: 'Backend API', amount: '200' },
      { description: 'Mobile Development', amount: '150' },
      { description: 'Testing & Launch', amount: '50' }
    ],
    tags: ['mobile', 'ios', 'android'],
    category: 'Mobile Development'
  });

  console.log('Job ID:', job.id);
  console.log('Escrow ID:', escrowId);

  // Get escrow details
  const escrow = await sdk.escrow.getEscrow(escrowId);
  console.log('Escrow Status:', escrow.status);
  console.log('Total Amount:', escrow.totalAmount, 'CELO');
}

main();
```

## 🔒 Security Best Practices

1. **Never hardcode private keys** - Use environment variables
2. **Use separate wallets** for testnet and mainnet
3. **Verify addresses** before creating escrows
4. **Test thoroughly** on testnet before mainnet
5. **Keep SDK updated** to latest version

## 📚 Next Steps

- [Full Documentation](./docs/getting-started.md)
- [API Reference](./docs/sdk-reference.md)
- [Smart Contracts](./docs/contracts.md)
- [Run Demo App](./demo/README.md)

## 💡 Tips

- **Gas Fees**: Keep some extra CELO for gas fees
- **Milestone Planning**: Break work into clear, measurable milestones
- **Communication**: Use job descriptions to set clear expectations
- **Disputes**: Try to resolve issues before raising disputes
- **Reviews**: Leave honest reviews to build reputation

## 🆘 Need Help?

- 📖 [Documentation](./docs/)
- 💬 [Discord Community](https://discord.gg/celowork)
- 🐛 [Report Issues](https://github.com/celowork/sdk/issues)
- 📧 Email: support@celowork.dev

## 🎉 You're Ready!

Start building decentralized freelance marketplaces on Celo with CeloWork SDK!

```typescript
const sdk = new CeloWorkSDK({ network: 'alfajores', privateKey: 'your-key' });
// Build something amazing! 🚀
```
