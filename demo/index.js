/**
 * CeloWork SDK Demo Application
 * Demonstrates the complete workflow of creating a job with escrow and milestone payments
 */

require('dotenv').config();
const { CeloWorkSDK } = require('celowork-sdk');

// Configuration
const NETWORK = process.env.NETWORK || 'alfajores';
const CLIENT_PRIVATE_KEY = process.env.CLIENT_PRIVATE_KEY;
const FREELANCER_PRIVATE_KEY = process.env.FREELANCER_PRIVATE_KEY;

if (!CLIENT_PRIVATE_KEY || !FREELANCER_PRIVATE_KEY) {
  console.error('❌ Error: Please set CLIENT_PRIVATE_KEY and FREELANCER_PRIVATE_KEY in .env file');
  process.exit(1);
}

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 CeloWork SDK Demo\n');
  console.log('=' .repeat(60));

  // Initialize SDK for client
  console.log('\n📱 Initializing Client SDK...');
  const clientSDK = new CeloWorkSDK({
    network: NETWORK,
    privateKey: CLIENT_PRIVATE_KEY,
  });

  // Initialize SDK for freelancer
  console.log('📱 Initializing Freelancer SDK...');
  const freelancerSDK = new CeloWorkSDK({
    network: NETWORK,
    privateKey: FREELANCER_PRIVATE_KEY,
  });

  const clientAddress = await clientSDK.getAddress();
  const freelancerAddress = await freelancerSDK.getAddress();

  console.log('\n👤 Client Address:', clientAddress);
  console.log('👤 Freelancer Address:', freelancerAddress);

  // Check balances
  const clientBalance = await clientSDK.getBalance();
  const freelancerBalance = await freelancerSDK.getBalance();

  console.log('\n💰 Client Balance:', clientBalance, 'CELO');
  console.log('💰 Freelancer Balance:', freelancerBalance, 'CELO');

  if (parseFloat(clientBalance) < 5) {
    console.error('\n❌ Error: Client needs at least 5 CELO for this demo');
    console.log('Get testnet CELO from: https://faucet.celo.org/alfajores');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 1: Creating Job with Escrow');
  console.log('='.repeat(60));

  const jobParams = {
    title: 'Build a Modern Landing Page',
    description: 'Need a responsive landing page with modern UI/UX design',
    budget: '3',
    freelancer: freelancerAddress,
    milestones: [
      { description: 'Design mockup and wireframes', amount: '1' },
      { description: 'Frontend development', amount: '1.5' },
      { description: 'Testing and deployment', amount: '0.5' },
    ],
    tags: ['web-development', 'design', 'react'],
    category: 'Web Development',
  };

  console.log('\n📋 Job Details:');
  console.log('  Title:', jobParams.title);
  console.log('  Budget:', jobParams.budget, 'CELO');
  console.log('  Milestones:', jobParams.milestones.length);
  console.log('\n💸 Creating escrow with', jobParams.budget, 'CELO...');

  try {
    const result = await clientSDK.createJobWithEscrow(jobParams);
    
    console.log('\n✅ Job and Escrow Created Successfully!');
    console.log('  Job ID:', result.job.id);
    console.log('  Escrow ID:', result.escrowId);
    console.log('  Transaction:', result.receipt.transactionHash);

    const escrowId = result.escrowId;

    // Get escrow details
    console.log('\n📊 Escrow Details:');
    const escrow = await clientSDK.escrow.getEscrow(escrowId);
    console.log('  Status:', getEscrowStatusName(escrow.status));
    console.log('  Total Amount:', escrow.totalAmount, 'CELO');
    console.log('  Released Amount:', escrow.releasedAmount, 'CELO');
    console.log('  Milestones:', escrow.milestones.length);

    console.log('\n' + '='.repeat(60));
    console.log('🔨 STEP 2: Freelancer Submits First Milestone');
    console.log('='.repeat(60));

    await sleep(2000);

    console.log('\n📤 Submitting milestone 0...');
    const submitReceipt = await freelancerSDK.escrow.submitMilestone(escrowId, 0);
    console.log('✅ Milestone submitted!');
    console.log('  Transaction:', submitReceipt.transactionHash);

    console.log('\n' + '='.repeat(60));
    console.log('✅ STEP 3: Client Approves First Milestone');
    console.log('='.repeat(60));

    await sleep(2000);

    const freelancerBalanceBefore = await freelancerSDK.getBalance();
    console.log('\n💰 Freelancer balance before:', freelancerBalanceBefore, 'CELO');

    console.log('\n✔️  Approving milestone 0...');
    const approveReceipt = await clientSDK.escrow.approveMilestone(escrowId, 0);
    console.log('✅ Milestone approved and payment released!');
    console.log('  Transaction:', approveReceipt.transactionHash);

    await sleep(2000);

    const freelancerBalanceAfter = await freelancerSDK.getBalance();
    console.log('💰 Freelancer balance after:', freelancerBalanceAfter, 'CELO');
    
    const earned = (parseFloat(freelancerBalanceAfter) - parseFloat(freelancerBalanceBefore)).toFixed(4);
    console.log('💵 Freelancer earned:', earned, 'CELO');

    // Get updated escrow
    const updatedEscrow = await clientSDK.escrow.getEscrow(escrowId);
    console.log('\n📊 Updated Escrow:');
    console.log('  Status:', getEscrowStatusName(updatedEscrow.status));
    console.log('  Released Amount:', updatedEscrow.releasedAmount, 'CELO');
    console.log('  Remaining:', (parseFloat(updatedEscrow.totalAmount) - parseFloat(updatedEscrow.releasedAmount)).toFixed(2), 'CELO');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Demo Completed Successfully!');
    console.log('='.repeat(60));

    console.log('\n📝 Summary:');
    console.log('  ✅ Created job with 3 milestones');
    console.log('  ✅ Funded escrow with', jobParams.budget, 'CELO');
    console.log('  ✅ Freelancer submitted milestone');
    console.log('  ✅ Client approved milestone');
    console.log('  ✅ Payment released to freelancer');

    console.log('\n🔄 Next Steps:');
    console.log('  1. Freelancer can submit remaining milestones');
    console.log('  2. Client can approve/reject each milestone');
    console.log('  3. Escrow completes when all milestones approved');

    console.log('\n💡 Try these commands:');
    console.log('  - View escrow:', `sdk.escrow.getEscrow(${escrowId})`);
    console.log('  - Submit milestone:', `sdk.escrow.submitMilestone(${escrowId}, 1)`);
    console.log('  - Approve milestone:', `sdk.escrow.approveMilestone(${escrowId}, 1)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    process.exit(1);
  }
}

function getEscrowStatusName(status) {
  const statuses = ['Created', 'Funded', 'InProgress', 'Completed', 'Disputed', 'Cancelled', 'Refunded'];
  return statuses[status] || 'Unknown';
}

// Run demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
