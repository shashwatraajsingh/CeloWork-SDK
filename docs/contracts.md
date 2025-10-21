# Smart Contracts Documentation

## CeloWorkEscrow Contract

The `CeloWorkEscrow` contract is the core smart contract that handles milestone-based escrow payments on Celo.

### Contract Address

- **Alfajores Testnet**: (Will be populated after deployment)
- **Celo Mainnet**: (Coming soon)

### Features

- ✅ Milestone-based payments
- ✅ Secure escrow with client deposits
- ✅ Freelancer milestone submission
- ✅ Client approval/rejection workflow
- ✅ Dispute mechanism
- ✅ Cancellation and refunds
- ✅ Event emission for tracking

## Contract Architecture

### Enums

#### EscrowStatus
```solidity
enum EscrowStatus {
  Created,      // 0
  Funded,       // 1
  InProgress,   // 2
  Completed,    // 3
  Disputed,     // 4
  Cancelled,    // 5
  Refunded      // 6
}
```

#### MilestoneStatus
```solidity
enum MilestoneStatus {
  Pending,   // 0
  Submitted, // 1
  Approved,  // 2
  Rejected   // 3
}
```

### Main Functions

#### createEscrow
```solidity
function createEscrow(
  address _freelancer,
  string[] memory _milestoneDescriptions,
  uint256[] memory _milestoneAmounts
) external payable returns (uint256)
```

Creates a new escrow with milestones. Client must send CELO equal to the total milestone amounts.

**Parameters:**
- `_freelancer`: Address of the freelancer
- `_milestoneDescriptions`: Array of milestone descriptions
- `_milestoneAmounts`: Array of milestone amounts in wei

**Returns:** Escrow ID

#### submitMilestone
```solidity
function submitMilestone(uint256 _escrowId, uint256 _milestoneIndex) external
```

Freelancer submits a milestone for client review.

#### approveMilestone
```solidity
function approveMilestone(uint256 _escrowId, uint256 _milestoneIndex) external
```

Client approves a milestone and releases payment to freelancer.

#### rejectMilestone
```solidity
function rejectMilestone(uint256 _escrowId, uint256 _milestoneIndex) external
```

Client rejects a milestone. Freelancer must resubmit.

#### raiseDispute
```solidity
function raiseDispute(uint256 _escrowId) external
```

Either party can raise a dispute. Requires manual resolution.

#### cancelEscrow
```solidity
function cancelEscrow(uint256 _escrowId) external
```

Client can cancel escrow and get refund if no milestones have been approved.

### View Functions

#### getEscrow
```solidity
function getEscrow(uint256 _escrowId) external view returns (...)
```

Returns escrow details.

#### getMilestone
```solidity
function getMilestone(uint256 _escrowId, uint256 _milestoneIndex) external view returns (...)
```

Returns milestone details.

#### getClientEscrows
```solidity
function getClientEscrows(address _client) external view returns (uint256[] memory)
```

Returns all escrow IDs for a client.

#### getFreelancerEscrows
```solidity
function getFreelancerEscrows(address _freelancer) external view returns (uint256[] memory)
```

Returns all escrow IDs for a freelancer.

## Events

```solidity
event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer, uint256 totalAmount);
event EscrowFunded(uint256 indexed escrowId, uint256 amount);
event MilestoneSubmitted(uint256 indexed escrowId, uint256 milestoneIndex);
event MilestoneApproved(uint256 indexed escrowId, uint256 milestoneIndex, uint256 amount);
event MilestoneRejected(uint256 indexed escrowId, uint256 milestoneIndex);
event EscrowCompleted(uint256 indexed escrowId);
event EscrowCancelled(uint256 indexed escrowId);
event DisputeRaised(uint256 indexed escrowId);
```

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Contract ownership for future upgrades
- **Input Validation**: Comprehensive checks on all inputs
- **Safe Transfers**: Uses call with proper error handling

## Gas Optimization

- Efficient storage patterns
- Minimal external calls
- Optimized loops

## Testing

Run the test suite:

```bash
cd contracts
npm test
```

## Deployment

Deploy to Alfajores:

```bash
cd contracts
cp .env.example .env
# Add your private key to .env
npm run deploy
```

## Verification

Verify on Celoscan:

```bash
npm run verify
```

## Future Enhancements

- Multi-token support (cUSD, cEUR)
- Automated dispute resolution
- Time-based milestones
- Partial milestone payments
- Reputation integration
