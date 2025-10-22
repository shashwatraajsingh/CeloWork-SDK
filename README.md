# CeloWork SDK

A drop-in developer toolkit for building decentralized freelance and gig marketplaces on Celo.

## Features

- 🔒 **Escrow Management**: Secure milestone-based payments
- 📝 **Job Posting**: Create and manage freelance jobs
- ⭐ **Reputation Tracking**: Build trust with on-chain reputation
- 🆔 **Self Protocol Integration**: Proof-of-humanity verification
- 🌐 **Celo Native**: Built for Celo Alfajores testnet

## Project Status

**Completed Milestones:**
- ✅ Milestone 1 - Core SDK & Contract Setup
- ✅ Milestone 2 - Self Protocol Integration

**Current Status:** Ready for deployment and testing

## Installation

```bash
npm install celowork-sdk
```

## Quick Start

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

// Initialize SDK
const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-private-key'
});

// Create a job with escrow
const job = await sdk.jobs.create({
  title: 'Build a Website',
  description: 'Need a modern landing page',
  budget: '100', // in CELO
  milestones: [
    { description: 'Design mockup', amount: '30' },
    { description: 'Development', amount: '50' },
    { description: 'Deployment', amount: '20' }
  ]
});
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

## Documentation

See the [docs/](./docs/) folder for detailed documentation:
- [Getting Started](./docs/getting-started.md)
- [Smart Contracts](./docs/contracts.md)
- [SDK Reference](./docs/sdk-reference.md)

## License

MIT
