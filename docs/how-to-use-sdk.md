# How to Use CeloWork SDK

This guide explains how other developers can integrate and use the CeloWork SDK in their applications.

---

## 📦 Installation

### Option 1: Install from npm (When Published)

```bash
npm install celowork-sdk
```

### Option 2: Install from GitHub (Current)

```bash
npm install git+https://github.com/your-username/celowork-sdk.git
```

### Option 3: Install Locally for Testing

```bash
# Clone the repository
git clone https://github.com/your-username/celowork-sdk.git
cd celowork-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# In your project, install from local path
npm install /path/to/celowork-sdk
```

---

## 🚀 Quick Start

### 1. Import the SDK

```typescript
import { CeloWorkSDK, VerificationLevel } from 'celowork-sdk';
```

Or with CommonJS:
```javascript
const { CeloWorkSDK, VerificationLevel } = require('celowork-sdk');
```

### 2. Initialize the SDK

```typescript
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',  // or 'alfajores', 'celo', 'localhost'
  privateKey: 'your-private-key-here',
  // Optional: custom contract address
  contractAddress: '0x...',
});
```

### 3. Start Using!

```typescript
// Get your address
const address = await sdk.getAddress();
console.log('Your address:', address);

// Check balance
const balance = await sdk.getBalance();
console.log('Balance:', balance, 'CELO');

// Create a job
const job = await sdk.jobs.createJob({
  title: 'Build a Website',
  description: 'Modern landing page',
  budget: '100',
  milestones: [
    { description: 'Design', amount: '40' },
    { description: 'Development', amount: '60' }
  ]
});
```

---

## 📚 Core Features

### 1. Authentication & Wallet Management

```typescript
// Initialize with private key
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: process.env.PRIVATE_KEY,
});

// Get current address
const address = await sdk.getAddress();

// Get balance
const balance = await sdk.getBalance();

// Check if connected
const isConnected = sdk.isConnected();

// Sign a message
const signature = await sdk.auth.signMessage('Hello, Celo!');
```

### 2. Job Management

```typescript
// Create a job
const job = await sdk.jobs.createJob({
  title: 'Smart Contract Development',
  description: 'Build an NFT marketplace',
  budget: '500',
  milestones: [
    { description: 'Contract Development', amount: '200' },
    { description: 'Testing & Deployment', amount: '150' },
    { description: 'Documentation', amount: '150' }
  ],
  tags: ['solidity', 'smart-contracts', 'nft'],
  category: 'Blockchain Development'
});

// Get a job
const jobDetails = await sdk.jobs.getJob(job.id);

// Search jobs
const openJobs = await sdk.jobs.searchJobs({ status: 'Open' });

// Assign job to freelancer
await sdk.jobs.assignJob(job.id, freelancerAddress);
```

### 3. Escrow Management

```typescript
// Create an escrow
const { escrowId, receipt } = await sdk.escrow.createEscrow(
  freelancerAddress,
  [
    { description: 'Milestone 1', amount: '100', status: 0 },
    { description: 'Milestone 2', amount: '150', status: 0 }
  ]
);

// Submit a milestone (freelancer)
await sdk.escrow.submitMilestone(escrowId, 0);

// Approve a milestone (client)
await sdk.escrow.approveMilestone(escrowId, 0);

// Get escrow details
const escrow = await sdk.escrow.getEscrow(escrowId);

// Get all client escrows
const clientEscrows = await sdk.escrow.getClientEscrows();

// Get all freelancer escrows
const freelancerEscrows = await sdk.escrow.getFreelancerEscrows();
```

### 4. Proof-of-Humanity Verification

```typescript
// Request verification
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);

// Check if verified
const isVerified = await sdk.selfProtocol.isVerified(address);

// Get verification details
const verification = await sdk.selfProtocol.getVerification(address);
console.log('Verified:', verification.isVerified);
console.log('Level:', verification.level);
console.log('Score:', verification.score);

// Verify another user
const result = await sdk.selfProtocol.verifyHuman(
  userAddress,
  VerificationLevel.Advanced
);

// Enable verification requirement for jobs
sdk.jobs.setVerificationConfig({
  requireVerification: true,
  minVerificationLevel: VerificationLevel.Basic
});
```

### 5. Reputation Management

```typescript
// Get user reputation
const reputation = await sdk.reputation.getReputation(address);

// Add a review
await sdk.reputation.addReview(
  freelancerAddress,
  jobId,
  5, // rating (1-5)
  'Excellent work! Delivered on time.'
);

// Update job stats
await sdk.reputation.updateJobStats(address, {
  completed: true,
  onTime: true,
  quality: 5
});

// Award a badge
await sdk.reputation.awardBadge(address, 'top-rated');
```

---

## 🎯 Complete Examples

### Example 1: Client Creates Job with Escrow

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

async function createJobWithEscrow() {
  // Initialize SDK
  const sdk = new CeloWorkSDK({
    network: 'celoSepolia',
    privateKey: process.env.CLIENT_PRIVATE_KEY,
  });

  // Create job with escrow in one call
  const result = await sdk.createJobWithEscrow({
    title: 'Build Mobile App',
    description: 'iOS and Android app for food delivery',
    budget: '1000',
    freelancer: '0xFreelancerAddress',
    milestones: [
      { description: 'UI/UX Design', amount: '200' },
      { description: 'Backend Development', amount: '400' },
      { description: 'Frontend Development', amount: '300' },
      { description: 'Testing & Deployment', amount: '100' }
    ],
    tags: ['mobile', 'react-native', 'nodejs'],
    category: 'Mobile Development'
  });

  console.log('Job created:', result.job.id);
  console.log('Escrow created:', result.escrowId);
  console.log('Transaction:', result.receipt.transactionHash);
}
```

### Example 2: Freelancer Submits Milestone

```typescript
import { CeloWorkSDK } from 'celowork-sdk';

async function submitMilestone() {
  // Initialize SDK as freelancer
  const sdk = new CeloWorkSDK({
    network: 'celoSepolia',
    privateKey: process.env.FREELANCER_PRIVATE_KEY,
  });

  const escrowId = 0; // Your escrow ID
  const milestoneIndex = 0; // First milestone

  // Submit milestone
  const receipt = await sdk.escrow.submitMilestone(escrowId, milestoneIndex);
  
  console.log('Milestone submitted!');
  console.log('Transaction:', receipt.transactionHash);
  
  // Or use the helper
  const result = await sdk.completeMilestone(escrowId, milestoneIndex);
  console.log(result.message);
}
```

### Example 3: Client Approves and Releases Payment

```typescript
async function approveMilestone() {
  const sdk = new CeloWorkSDK({
    network: 'celoSepolia',
    privateKey: process.env.CLIENT_PRIVATE_KEY,
  });

  const escrowId = 0;
  const milestoneIndex = 0;

  // Approve milestone (releases payment to freelancer)
  const receipt = await sdk.escrow.approveMilestone(escrowId, milestoneIndex);
  
  console.log('Milestone approved and payment released!');
  console.log('Transaction:', receipt.transactionHash);
}
```

### Example 4: Marketplace Application

```typescript
import { CeloWorkSDK, VerificationLevel } from 'celowork-sdk';

class FreelanceMarketplace {
  private sdk: CeloWorkSDK;

  constructor(privateKey: string) {
    this.sdk = new CeloWorkSDK({
      network: 'celoSepolia',
      privateKey,
    });

    // Require verification for all jobs
    this.sdk.jobs.setVerificationConfig({
      requireVerification: true,
      minVerificationLevel: VerificationLevel.Basic
    });
  }

  async postJob(jobData: any) {
    // Ensure user is verified
    const address = await this.sdk.getAddress();
    const isVerified = await this.sdk.selfProtocol.isVerified(address);
    
    if (!isVerified) {
      throw new Error('Please verify your identity first');
    }

    // Create job
    return await this.sdk.jobs.createJob(jobData);
  }

  async browseJobs(filters: any) {
    return await this.sdk.jobs.searchJobs(filters);
  }

  async hireFreelancer(jobId: string, freelancerAddress: string, milestones: any[]) {
    // Assign job
    await this.sdk.jobs.assignJob(jobId, freelancerAddress);

    // Create escrow
    const { escrowId } = await this.sdk.escrow.createEscrow(
      freelancerAddress,
      milestones
    );

    // Link escrow to job
    await this.sdk.jobs.linkEscrow(jobId, escrowId);

    return { jobId, escrowId };
  }
}

// Usage
const marketplace = new FreelanceMarketplace(process.env.PRIVATE_KEY);
await marketplace.postJob({
  title: 'Logo Design',
  description: 'Modern logo for tech startup',
  budget: '50',
  milestones: [{ description: 'Final Design', amount: '50' }]
});
```

---

## 🌐 Network Configuration

### Available Networks

```typescript
// Celo Sepolia Testnet (Recommended for testing)
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: 'your-key',
});

// Celo Alfajores Testnet (Legacy)
const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-key',
});

// Celo Mainnet (Production)
const sdk = new CeloWorkSDK({
  network: 'celo',
  privateKey: 'your-key',
});

// Localhost (Development)
const sdk = new CeloWorkSDK({
  network: 'localhost',
  privateKey: 'your-key',
});
```

### Custom Network

```typescript
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: 'your-key',
  contractAddress: '0xYourCustomContractAddress',
});
```

---

## 🔧 Advanced Usage

### Listen to Events

```typescript
// Listen for escrow creation
sdk.escrow.onEscrowCreated((escrowId, client, freelancer, amount) => {
  console.log('New escrow created:', escrowId);
  console.log('Client:', client);
  console.log('Freelancer:', freelancer);
  console.log('Amount:', amount);
});

// Listen for milestone approvals
sdk.escrow.onMilestoneApproved((escrowId, milestoneIndex, amount) => {
  console.log('Milestone approved:', milestoneIndex);
  console.log('Payment released:', amount);
});

// Listen for escrow completion
sdk.escrow.onEscrowCompleted((escrowId) => {
  console.log('Escrow completed:', escrowId);
});
```

### Error Handling

```typescript
try {
  const job = await sdk.jobs.createJob({...});
} catch (error) {
  if (error.message.includes('must be verified')) {
    console.log('Please verify your identity first');
    await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
  } else if (error.message.includes('insufficient funds')) {
    console.log('Insufficient balance');
  } else {
    console.error('Error:', error.message);
  }
}
```

### TypeScript Support

```typescript
import { 
  CeloWorkSDK, 
  Job, 
  Escrow, 
  Milestone,
  VerificationLevel,
  JobStatus,
  EscrowStatus 
} from 'celowork-sdk';

// Full type safety
const job: Job = await sdk.jobs.createJob({...});
const escrow: Escrow = await sdk.escrow.getEscrow(0);
const milestones: Milestone[] = escrow.milestones;
```

---

## 📱 Frontend Integration

### React Example

```typescript
import { useState, useEffect } from 'react';
import { CeloWorkSDK } from 'celowork-sdk';

function App() {
  const [sdk, setSdk] = useState<CeloWorkSDK | null>(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Initialize SDK
    const initSDK = async () => {
      const celoSDK = new CeloWorkSDK({
        network: 'celoSepolia',
        privateKey: process.env.REACT_APP_PRIVATE_KEY,
      });
      setSdk(celoSDK);

      // Load jobs
      const allJobs = await celoSDK.jobs.getAllJobs();
      setJobs(allJobs);
    };

    initSDK();
  }, []);

  const createJob = async (jobData) => {
    if (!sdk) return;
    
    const job = await sdk.jobs.createJob(jobData);
    setJobs([...jobs, job]);
  };

  return (
    <div>
      <h1>Freelance Marketplace</h1>
      {/* Your UI components */}
    </div>
  );
}
```

### Next.js API Route

```typescript
// pages/api/jobs/create.ts
import { CeloWorkSDK } from 'celowork-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sdk = new CeloWorkSDK({
      network: 'celoSepolia',
      privateKey: process.env.PRIVATE_KEY!,
    });

    const job = await sdk.jobs.createJob(req.body);
    
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🔐 Security Best Practices

### 1. Never Expose Private Keys

```typescript
// ❌ BAD - Hardcoded private key
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: '0x1234567890abcdef...',
});

// ✅ GOOD - Use environment variables
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: process.env.PRIVATE_KEY,
});
```

### 2. Use Different Keys for Different Environments

```typescript
const sdk = new CeloWorkSDK({
  network: process.env.NODE_ENV === 'production' ? 'celo' : 'celoSepolia',
  privateKey: process.env.PRIVATE_KEY,
});
```

### 3. Validate User Input

```typescript
function validateJobData(data: any) {
  if (!data.title || data.title.length < 3) {
    throw new Error('Title must be at least 3 characters');
  }
  if (!data.budget || parseFloat(data.budget) <= 0) {
    throw new Error('Budget must be positive');
  }
  // More validations...
}

const job = await sdk.jobs.createJob(validateJobData(userInput));
```

---

## 📖 API Reference

For complete API documentation, see:
- [SDK Reference](./sdk-reference.md)
- [Smart Contracts](./contracts.md)
- [Self Protocol Integration](./self-protocol.md)

---

## 🆘 Troubleshooting

### Common Issues

**1. "Contract not deployed on network"**
```typescript
// Solution: Provide custom contract address
const sdk = new CeloWorkSDK({
  network: 'celoSepolia',
  privateKey: 'your-key',
  contractAddress: '0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6',
});
```

**2. "Insufficient funds"**
- Get testnet CELO from https://faucet.celo.org
- Check your balance: `await sdk.getBalance()`

**3. "User must be verified"**
```typescript
// Request verification first
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
```

---

## 💡 Tips & Best Practices

1. **Always check balances before transactions**
   ```typescript
   const balance = await sdk.getBalance();
   if (parseFloat(balance) < requiredAmount) {
     throw new Error('Insufficient balance');
   }
   ```

2. **Use verification for trust**
   ```typescript
   sdk.jobs.setVerificationConfig({
     requireVerification: true,
     minVerificationLevel: VerificationLevel.Basic
   });
   ```

3. **Handle events for real-time updates**
   ```typescript
   sdk.escrow.onMilestoneApproved((escrowId, index, amount) => {
     // Update UI, send notifications, etc.
   });
   ```

4. **Cache data when possible**
   ```typescript
   const jobs = await sdk.jobs.getAllJobs();
   // Cache jobs locally, refresh periodically
   ```

---

## 📦 Publishing Your Own Fork

If you want to publish your own version:

```bash
# Update package.json
{
  "name": "your-celowork-sdk",
  "version": "1.0.0"
}

# Build
npm run build

# Publish to npm
npm publish
```

---

## 🤝 Contributing

To contribute to the SDK:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Resources

- **GitHub:** https://github.com/your-username/celowork-sdk
- **Documentation:** https://docs.celowork.dev
- **Celo Docs:** https://docs.celo.org
- **Contract Explorer:** https://sepolia.celoscan.io/address/0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6

---

**Happy Building! 🚀**
