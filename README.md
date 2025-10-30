# CeloWork SDK

A drop-in developer toolkit for building decentralized freelance and gig marketplaces on Celo.

## 🌟 Features

- 🔒 **Escrow Management**: Secure milestone-based payments
- 📝 **Job Posting**: Create and manage freelance jobs
- ⭐ **Reputation Tracking**: Build trust with on-chain reputation
- 🆔 **Self Protocol Integration**: Proof-of-humanity verification
- 🌐 **Celo Native**: Deployed on Celo Sepolia testnet
- 🔐 **Secure**: ReentrancyGuard protection and access controls
- 📦 **TypeScript**: Full type safety and IntelliSense support

## 🚀 Project Status

**Completed Milestones:**
- ✅ Milestone 1 - Core SDK & Contract Setup
- ✅ Milestone 2 - Self Protocol Integration
- ✅ **Deployed on Celo Sepolia Testnet**

**Contract Address:** `0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6`  
**Explorer:** https://sepolia.celoscan.io/address/0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6

## 📦 Installation

### Option 1: From npm (When Published)

```bash
npm install celowork-sdk
```

### Option 2: From GitHub

```bash
npm install git+https://github.com/shashwatraajsingh/celowork-sdk.git
```

### Option 3: Local Installation

```bash
# Clone the repository
git clone https://github.com/shashwatraajsingh/celowork-sdk.git
cd celowork-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# In your project
npm install /path/to/celowork-sdk
```

## ⚡ Quick Start

### Basic Usage

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

// Initialize SDK
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',  // Use Celo Sepolia testnet
  privateKey: process.env.PRIVATE_KEY,
});

// Get your address and balance
const address = await sdk.getAddress();
const balance = await sdk.getBalance();
console.log(`Address: ${address}, Balance: ${balance} CELO`);

// Create a job
const job = await sdk.jobs.createJob({
  title: 'Build a Website',
  description: 'Modern landing page with React',
  budget: '100',
  milestones: [
    { description: 'Design mockup', amount: '30' },
    { description: 'Development', amount: '50' },
    { description: 'Deployment', amount: '20' }
  ],
  tags: ['react', 'web-development'],
  category: 'Web Development'
});

// Create escrow for the job
const { escrowId } = await sdk.escrow.createEscrow(
  freelancerAddress,
  job.milestones.map(m => ({ ...m, status: 0 }))
);

console.log(`Job created: ${job.id}, Escrow: ${escrowId}`);
```

### Complete Workflow Example

```typescript
// 1. Client creates job with escrow
const result = await sdk.createJobWithEscrow({
  title: 'Mobile App Development',
  description: 'iOS and Android app',
  budget: '500',
  freelancer: '0xFreelancerAddress',
  milestones: [
    { description: 'UI Design', amount: '100' },
    { description: 'Development', amount: '300' },
    { description: 'Testing', amount: '100' }
  ]
});

// 2. Freelancer submits milestone
await sdk.escrow.submitMilestone(result.escrowId, 0);

// 3. Client approves and releases payment
await sdk.escrow.approveMilestone(result.escrowId, 0);
```

### With Proof-of-Humanity Verification

```typescript
import { CeloWorkSDK, VerificationLevel } from 'celowork-sdk';

const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: process.env.PRIVATE_KEY,
});

// Request verification
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);

// Enable verification requirement for jobs
sdk.jobs.setVerificationConfig({
  requireVerification: true,
  minVerificationLevel: VerificationLevel.Basic
});

// Now only verified users can create jobs
const job = await sdk.jobs.createJob({...});
```

## Project Structure

```
celowork-sdk/
├── contracts/       # Solidity smart contracts
├── sdk/            # TypeScript SDK source
├── demo/           # Demo application
├── docs/           # Documentation
└── dist/           # Compiled SDK output
```

## Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Build SDK
npm run build

# Deploy to Alfajores
npm run deploy

# Run demo
npm run demo
```

## 📚 Documentation

Comprehensive guides and API references:

- **[How to Use SDK](./docs/how-to-use-sdk.md)** - Complete integration guide
- **[Getting Started](./docs/getting-started.md)** - Step-by-step tutorial
- **[Smart Contracts](./docs/contracts.md)** - Contract documentation
- **[SDK Reference](./docs/sdk-reference.md)** - Full API reference
- **[Self Protocol](./docs/self-protocol.md)** - Verification guide
- **[Deployment Guide](./DEPLOYMENT-SUCCESS.md)** - Deployment details

## 🎯 Use Cases

Build powerful decentralized applications:

- **Freelance Marketplaces** - Like Upwork/Fiverr on blockchain
- **Gig Economy Platforms** - Task-based work with escrow
- **Service Marketplaces** - Professional services with payments
- **DAO Bounties** - Community-driven task management
- **Remote Work Platforms** - Global hiring with crypto payments

## 🔗 Links

- **Contract Explorer:** https://sepolia.celoscan.io/address/0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6
- **Celo Sepolia Faucet:** https://faucet.celo.org
- **Celo Documentation:** https://docs.celo.org

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built on [Celo](https://celo.org) blockchain
- Uses [OpenZeppelin](https://openzeppelin.com) contracts
- Integrated with [Self Protocol](https://selfprotocol.com) for verification

---

**Built with ❤️ for the Celo ecosystem**
