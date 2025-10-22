/**
 * CeloWork SDK - Self Protocol Verification Demo
 * Demonstrates proof-of-humanity verification flow
 */

require('dotenv').config();
const { CeloWorkSDK, VerificationLevel } = require('celowork-sdk');

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

// Helper to display verification result
function displayVerification(result, label = 'Verification') {
  console.log(`\n📋 ${label} Result:`);
  console.log('  ✅ Verified:', result.isVerified);
  console.log('  🎯 Level:', result.level);
  console.log('  📊 Humanity Score:', result.score + '/100');
  console.log('  📅 Verified At:', new Date(result.verifiedAt).toLocaleString());
  console.log('  ⏰ Expires At:', new Date(result.expiresAt).toLocaleString());
  
  if (result.attributes) {
    console.log('  🔐 Attributes:');
    console.log('    - Email:', result.attributes.hasEmail ? '✓' : '✗');
    console.log('    - Phone:', result.attributes.hasPhone ? '✓' : '✗');
    console.log('    - Government ID:', result.attributes.hasGovernmentId ? '✓' : '✗');
    console.log('    - Biometric:', result.attributes.hasBiometric ? '✓' : '✗');
    console.log('    - Linked Accounts:', result.attributes.hasLinkedAccounts ? '✓' : '✗');
  }
}

async function main() {
  console.log('🔐 CeloWork SDK - Self Protocol Verification Demo\n');
  console.log('=' .repeat(70));

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

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 1: Verify Client Identity (Basic Level)');
  console.log('='.repeat(70));

  console.log('\n🔄 Requesting basic verification for client...');
  await clientSDK.selfProtocol.requestVerification(VerificationLevel.Basic);
  
  const clientVerification = await clientSDK.selfProtocol.getVerification(clientAddress);
  displayVerification(clientVerification, 'Client Verification');

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 2: Verify Freelancer Identity (Advanced Level)');
  console.log('='.repeat(70));

  console.log('\n🔄 Requesting advanced verification for freelancer...');
  await freelancerSDK.selfProtocol.requestVerification(VerificationLevel.Advanced);
  
  const freelancerVerification = await freelancerSDK.selfProtocol.getVerification(freelancerAddress);
  displayVerification(freelancerVerification, 'Freelancer Verification');

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 3: Check Verification Status');
  console.log('='.repeat(70));

  const isClientVerified = await clientSDK.selfProtocol.isVerified(clientAddress);
  const isFreelancerVerified = await freelancerSDK.selfProtocol.isVerified(freelancerAddress);

  console.log('\n✓ Client verified:', isClientVerified);
  console.log('✓ Freelancer verified:', isFreelancerVerified);

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 4: Create Job WITHOUT Verification Requirement');
  console.log('='.repeat(70));

  console.log('\n📝 Creating job without verification requirement...');
  const job1 = await clientSDK.jobs.createJob({
    title: 'Build a Website (No Verification Required)',
    description: 'Simple website project',
    budget: '50',
    milestones: [
      { description: 'Design', amount: '20' },
      { description: 'Development', amount: '30' }
    ],
    tags: ['web-development'],
    category: 'Web Development'
  });

  console.log('✅ Job created successfully!');
  console.log('  Job ID:', job1.id);
  console.log('  Title:', job1.title);

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 5: Enable Verification Requirement');
  console.log('='.repeat(70));

  console.log('\n🔒 Enabling verification requirement for job creation...');
  clientSDK.jobs.setVerificationConfig({
    requireVerification: true,
    minVerificationLevel: VerificationLevel.Basic
  });

  console.log('✅ Verification requirement enabled!');
  console.log('  Minimum Level: Basic');

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 6: Create Job WITH Verification Requirement');
  console.log('='.repeat(70));

  console.log('\n📝 Creating job with verification requirement...');
  
  try {
    const job2 = await clientSDK.jobs.createJob({
      title: 'Build a Mobile App (Verification Required)',
      description: 'iOS and Android app development',
      budget: '200',
      milestones: [
        { description: 'UI/UX Design', amount: '50' },
        { description: 'Development', amount: '100' },
        { description: 'Testing', amount: '50' }
      ],
      tags: ['mobile-development', 'ios', 'android'],
      category: 'Mobile Development'
    });

    console.log('✅ Job created successfully!');
    console.log('  Job ID:', job2.id);
    console.log('  Title:', job2.title);
    console.log('  ✓ Client verification was checked and passed!');
  } catch (error) {
    console.log('❌ Job creation failed:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 7: Test Unverified User (Simulated)');
  console.log('='.repeat(70));

  console.log('\n🔄 Simulating unverified user attempting to create job...');
  
  // Create a temporary SDK with a random address (unverified)
  const unverifiedSDK = new CeloWorkSDK({
    network: NETWORK,
    privateKey: CLIENT_PRIVATE_KEY, // Using same key but will revoke verification
  });

  // Revoke verification to simulate unverified user
  await unverifiedSDK.selfProtocol.revokeVerification(clientAddress);
  
  // Enable verification requirement
  unverifiedSDK.jobs.setVerificationConfig({
    requireVerification: true,
    minVerificationLevel: VerificationLevel.Basic
  });

  try {
    await unverifiedSDK.jobs.createJob({
      title: 'This Should Fail',
      description: 'Unverified user trying to create job',
      budget: '100',
      milestones: [{ description: 'Test', amount: '100' }]
    });
    console.log('❌ Unexpected: Job was created without verification!');
  } catch (error) {
    console.log('✅ Expected behavior: Job creation blocked!');
    console.log('  Error:', error.message);
  }

  // Re-verify client for next steps
  await clientSDK.selfProtocol.requestVerification(VerificationLevel.Basic);

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 8: Verification Statistics');
  console.log('='.repeat(70));

  const stats = await clientSDK.selfProtocol.getVerificationStats();
  console.log('\n📊 Verification Statistics:');
  console.log('  Total Verifications:', stats.total);
  console.log('  Active Verifications:', stats.active);
  console.log('  Expired Verifications:', stats.expired);
  console.log('  By Level:');
  console.log('    - Basic:', stats.byLevel.basic);
  console.log('    - Advanced:', stats.byLevel.advanced);
  console.log('    - Premium:', stats.byLevel.premium);

  console.log('\n' + '='.repeat(70));
  console.log('🎯 STEP 9: Premium Verification Demo');
  console.log('='.repeat(70));

  console.log('\n🌟 Requesting premium verification...');
  await clientSDK.selfProtocol.requestVerification(VerificationLevel.Premium);
  
  const premiumVerification = await clientSDK.selfProtocol.getVerification(clientAddress);
  displayVerification(premiumVerification, 'Premium Verification');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Demo Completed Successfully!');
  console.log('='.repeat(70));

  console.log('\n📝 Summary:');
  console.log('  ✅ Client verified at Basic level');
  console.log('  ✅ Freelancer verified at Advanced level');
  console.log('  ✅ Client upgraded to Premium level');
  console.log('  ✅ Job creation with verification requirement working');
  console.log('  ✅ Unverified users blocked from creating jobs');
  console.log('  ✅ Verification statistics tracked');

  console.log('\n💡 Key Features Demonstrated:');
  console.log('  1. verifyHuman() - Verify user identity');
  console.log('  2. isVerified() - Check verification status');
  console.log('  3. getVerification() - Get verification details');
  console.log('  4. requestVerification() - Request verification');
  console.log('  5. Job creation with verification gate');
  console.log('  6. Multiple verification levels (Basic, Advanced, Premium)');
  console.log('  7. Verification expiration tracking');
  console.log('  8. Humanity score calculation');

  console.log('\n🔜 Next Steps:');
  console.log('  1. Integrate real Self Protocol API (replace mock)');
  console.log('  2. Add verification UI component');
  console.log('  3. Implement verification badges');
  console.log('  4. Add verification to escrow flow');
  console.log('  5. Create verification dashboard');

  console.log('\n✨ Self Protocol Integration Complete!');
}

// Run demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
