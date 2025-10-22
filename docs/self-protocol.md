# Self Protocol Integration

CeloWork SDK integrates Self Protocol for proof-of-humanity verification, ensuring that users are real humans before they can participate in the marketplace.

## Overview

Self Protocol provides decentralized identity verification with multiple levels of assurance. The CeloWork SDK uses this to:

- Verify clients before they can post jobs
- Verify freelancers before they can bid on jobs
- Build trust in the marketplace
- Prevent spam and fraud

## Verification Levels

### Basic
- **Humanity Score**: 70-85/100
- **Requirements**: Email verification
- **Use Case**: General marketplace access

### Advanced
- **Humanity Score**: 85-95/100
- **Requirements**: Email + Phone + Linked accounts
- **Use Case**: High-value jobs, trusted freelancers

### Premium
- **Humanity Score**: 95-100/100
- **Requirements**: Email + Phone + Government ID + Biometric + Linked accounts
- **Use Case**: Enterprise clients, critical projects

## Quick Start

### 1. Verify a User

```typescript
import { CeloWorkSDK, VerificationLevel } from 'celowork-sdk';

const sdk = new CeloWorkSDK({
  network: 'alfajores',
  privateKey: 'your-private-key'
});

// Request verification
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);

// Check verification status
const isVerified = await sdk.selfProtocol.isVerified(userAddress);
console.log('Verified:', isVerified);
```

### 2. Get Verification Details

```typescript
const verification = await sdk.selfProtocol.getVerification(userAddress);

console.log('Verified:', verification.isVerified);
console.log('Level:', verification.level);
console.log('Score:', verification.score);
console.log('Expires:', new Date(verification.expiresAt));
```

### 3. Verify Specific User

```typescript
// Verify another user's address
const result = await sdk.selfProtocol.verifyHuman(
  '0xFreelancerAddress',
  VerificationLevel.Advanced
);

if (result.isVerified) {
  console.log('User is verified!');
  console.log('Humanity Score:', result.score);
}
```

## Integration with Job Posting

### Enable Verification Requirement

```typescript
// Require verification for job creation
sdk.jobs.setVerificationConfig({
  requireVerification: true,
  minVerificationLevel: VerificationLevel.Basic
});

// Now only verified users can create jobs
try {
  const job = await sdk.jobs.createJob({
    title: 'Build a Website',
    description: 'Need a developer',
    budget: '100',
    milestones: [...]
  });
} catch (error) {
  // Error if user is not verified
  console.error(error.message);
}
```

### Disable Verification Requirement

```typescript
sdk.jobs.setVerificationConfig({
  requireVerification: false
});
```

## API Reference

### verifyHuman()

Verify if an address belongs to a human.

```typescript
async verifyHuman(
  address: string,
  level: VerificationLevel = VerificationLevel.Basic
): Promise<VerificationResult>
```

**Parameters:**
- `address` - Ethereum address to verify
- `level` - Verification level required (Basic, Advanced, Premium)

**Returns:**
```typescript
{
  isVerified: boolean;
  level: VerificationLevel;
  verifiedAt: number;
  expiresAt: number;
  score: number; // 0-100
  attributes: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasGovernmentId: boolean;
    hasBiometric: boolean;
    hasLinkedAccounts: boolean;
  };
  metadata: Record<string, any>;
}
```

### isVerified()

Check if an address is verified.

```typescript
async isVerified(
  address: string,
  minLevel: VerificationLevel = VerificationLevel.Basic
): Promise<boolean>
```

**Parameters:**
- `address` - Ethereum address to check
- `minLevel` - Minimum verification level required

**Returns:** `true` if verified at or above the minimum level

### getVerification()

Get verification details for an address.

```typescript
async getVerification(address: string): Promise<VerificationResult | undefined>
```

**Returns:** Verification result or `undefined` if not verified

### requestVerification()

Request verification for the current user.

```typescript
async requestVerification(
  level: VerificationLevel = VerificationLevel.Basic
): Promise<VerificationRequest>
```

**Returns:**
```typescript
{
  address: string;
  level: VerificationLevel;
  timestamp: number;
}
```

### getVerificationStats()

Get statistics about verifications.

```typescript
async getVerificationStats(): Promise<{
  total: number;
  active: number;
  expired: number;
  byLevel: Record<VerificationLevel, number>;
}>
```

### revokeVerification()

Revoke verification for an address (admin function).

```typescript
async revokeVerification(address: string): Promise<void>
```

## Verification Flow

### For Clients

1. **Request Verification**
   ```typescript
   await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
   ```

2. **Complete Verification Process**
   - In production: Follow Self Protocol's verification flow
   - In mock mode: Automatically verified

3. **Create Jobs**
   ```typescript
   const job = await sdk.jobs.createJob({...});
   ```

### For Freelancers

1. **Request Verification**
   ```typescript
   await sdk.selfProtocol.requestVerification(VerificationLevel.Advanced);
   ```

2. **Build Reputation**
   - Higher verification levels increase trust
   - Displayed on freelancer profile

3. **Bid on Jobs**
   - Verified freelancers get priority
   - Higher verification = higher trust

## Mock Mode vs Production

### Mock Mode (Default)

The SDK uses mock mode by default for development and testing:

```typescript
const sdk = new CeloWorkSDK({...});
// Mock mode is enabled automatically
```

**Features:**
- Instant verification
- Simulated humanity scores
- No external API calls
- Perfect for development

### Production Mode

To use real Self Protocol verification:

```typescript
sdk.selfProtocol.setMockMode(false);
```

**Note:** Production mode requires Self Protocol API integration (coming soon).

## Verification Expiration

Verifications expire after 30 days by default. Users must re-verify to maintain their status.

```typescript
const verification = await sdk.selfProtocol.getVerification(address);

if (verification.expiresAt < Date.now()) {
  console.log('Verification expired, please re-verify');
  await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
}
```

## Best Practices

### 1. Choose Appropriate Verification Levels

- **Basic**: General marketplace access
- **Advanced**: Jobs > $500
- **Premium**: Jobs > $5000 or sensitive projects

### 2. Display Verification Status

```typescript
const verification = await sdk.selfProtocol.getVerification(freelancerAddress);

if (verification) {
  console.log(`✓ Verified ${verification.level} (Score: ${verification.score}/100)`);
}
```

### 3. Handle Unverified Users Gracefully

```typescript
try {
  await sdk.jobs.createJob({...});
} catch (error) {
  if (error.message.includes('must be verified')) {
    // Show verification prompt to user
    console.log('Please verify your identity to create jobs');
    console.log('Run: sdk.selfProtocol.requestVerification()');
  }
}
```

### 4. Cache Verification Results

```typescript
// Check verification once and cache
const isVerified = await sdk.selfProtocol.isVerified(address);

// Use cached result for UI
if (isVerified) {
  // Show verified badge
}
```

## Examples

### Example 1: Verify Before Job Creation

```typescript
const sdk = new CeloWorkSDK({...});

// Enable verification requirement
sdk.jobs.setVerificationConfig({
  requireVerification: true,
  minVerificationLevel: VerificationLevel.Basic
});

// Request verification
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);

// Create job (will succeed if verified)
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

### Example 2: Check Freelancer Verification

```typescript
const freelancerAddress = '0x...';

const verification = await sdk.selfProtocol.getVerification(freelancerAddress);

if (verification && verification.isVerified) {
  console.log('Freelancer is verified!');
  console.log('Level:', verification.level);
  console.log('Score:', verification.score);
  
  if (verification.level === 'premium') {
    console.log('⭐ Premium verified freelancer!');
  }
} else {
  console.log('Freelancer is not verified');
}
```

### Example 3: Upgrade Verification Level

```typescript
// Start with basic
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);

// Later, upgrade to advanced
await sdk.selfProtocol.requestVerification(VerificationLevel.Advanced);

// Check new level
const verification = await sdk.selfProtocol.getVerification(address);
console.log('New level:', verification.level); // 'advanced'
```

## Running the Demo

```bash
cd demo
npm run verify
```

The verification demo demonstrates:
- Basic, Advanced, and Premium verification
- Job creation with verification gates
- Blocking unverified users
- Verification statistics
- Humanity score calculation

## Troubleshooting

### "User must be verified"

**Solution:** Request verification before creating jobs:
```typescript
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
```

### "Verification expired"

**Solution:** Re-verify your identity:
```typescript
await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
```

### Mock mode not working

**Solution:** Ensure mock mode is enabled:
```typescript
sdk.selfProtocol.setMockMode(true);
```

## Future Enhancements

- [ ] Real Self Protocol API integration
- [ ] On-chain verification storage
- [ ] Verification NFT badges
- [ ] Social verification (Twitter, GitHub)
- [ ] Reputation-based verification discounts
- [ ] Verification renewal reminders

## Learn More

- [Self Protocol Documentation](https://docs.selfprotocol.com)
- [CeloWork SDK Reference](./sdk-reference.md)
- [Getting Started Guide](./getting-started.md)
