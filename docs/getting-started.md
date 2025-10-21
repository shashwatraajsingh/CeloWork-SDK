# Getting Started with CeloWork SDK

## Installation

```bash
npm install celowork-sdk
```

## Prerequisites

- Node.js v18 or higher
- A Celo wallet with testnet CELO (for Alfajores)
- Basic knowledge of TypeScript/JavaScript

## Get Testnet CELO

1. Visit the [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
2. Enter your wallet address
3. Receive free testnet CELO

## Quick Start

### 1. Initialize the SDK

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-private-key-here'
});
```

### 2. Check Your Balance

```typescript
const balance = await sdk.getBalance();
console.log(`Balance: ${balance} CELO`);
```

### 3. Create a Job with Escrow

```typescript
const result = await sdk.createJobWithEscrow({
  title: 'Build a Landing Page',
  description: 'Need a modern, responsive landing page',
  budget: '100',
  freelancer: '0xFreelancerAddress',
  milestones: [
    { description: 'Design mockup', amount: '30' },
    { description: 'Development', amount: '50' },
    { description: 'Deployment', amount: '20' }
  ],
  tags: ['web-development', 'design'],
  category: 'Web Development'
});

console.log('Job created:', result.job.id);
console.log('Escrow created:', result.escrowId);
```

### 4. Freelancer: Submit a Milestone

```typescript
await sdk.escrow.submitMilestone(escrowId, 0);
console.log('Milestone submitted for review');
```

### 5. Client: Approve a Milestone

```typescript
await sdk.escrow.approveMilestone(escrowId, 0);
console.log('Milestone approved and payment released');
```

## Configuration Options

### Network Options

- `alfajores` - Celo Alfajores Testnet (recommended for development)
- `celo` - Celo Mainnet (for production)
- `localhost` - Local Hardhat network

### Authentication Options

```typescript
// Option 1: Private Key
const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-private-key'
});

// Option 2: Custom Provider
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const signer = new ethers.Wallet('private-key', provider);

const sdk = new CeloWorkSDK({
  network: 'alfajores',
  provider: provider,
  signer: signer
});

// Option 3: Browser Wallet (MetaMask, etc.)
const sdk = new CeloWorkSDK({
  network: 'alfajores'
});

await sdk.auth.connectBrowserWallet();
```

## Next Steps

- [Smart Contracts Documentation](./contracts.md)
- [SDK API Reference](./sdk-reference.md)
- [Example Use Cases](./examples.md)
- [Self Protocol Integration](./self-protocol.md)

## Common Issues

### "Insufficient funds"
Make sure your wallet has enough CELO to cover the escrow amount plus gas fees.

### "Contract not deployed"
Ensure you're using the correct network and the contract has been deployed to that network.

### "Invalid address"
Double-check that all addresses are valid Ethereum addresses (starting with 0x).

## Support

- GitHub Issues: [github.com/celowork/sdk/issues](https://github.com/celowork/sdk/issues)
- Discord: [discord.gg/celowork](https://discord.gg/celowork)
- Documentation: [docs.celowork.dev](https://docs.celowork.dev)
