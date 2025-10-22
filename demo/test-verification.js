/**
 * Quick test script for Self Protocol verification
 */

require('dotenv').config();
const { CeloWorkSDK, VerificationLevel } = require('celowork-sdk');

async function quickTest() {
  console.log('🧪 Quick Verification Test\n');

  // Initialize SDK
  const sdk = new CeloWorkSDK({
    network: 'alfajores',
    privateKey: process.env.CLIENT_PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234'
  });

  const address = await sdk.getAddress();
  console.log('Testing with address:', address);

  // Test 1: Verify human
  console.log('\n✓ Test 1: verifyHuman()');
  const result = await sdk.selfProtocol.verifyHuman(address, VerificationLevel.Basic);
  console.log('  Result:', result.isVerified ? '✅ PASS' : '❌ FAIL');
  console.log('  Score:', result.score);

  // Test 2: Check verification
  console.log('\n✓ Test 2: isVerified()');
  const isVerified = await sdk.selfProtocol.isVerified(address);
  console.log('  Result:', isVerified ? '✅ PASS' : '❌ FAIL');

  // Test 3: Get verification details
  console.log('\n✓ Test 3: getVerification()');
  const verification = await sdk.selfProtocol.getVerification(address);
  console.log('  Result:', verification ? '✅ PASS' : '❌ FAIL');
  console.log('  Level:', verification?.level);

  // Test 4: Request verification
  console.log('\n✓ Test 4: requestVerification()');
  const request = await sdk.selfProtocol.requestVerification(VerificationLevel.Advanced);
  console.log('  Result:', request ? '✅ PASS' : '❌ FAIL');

  // Test 5: Job creation without verification
  console.log('\n✓ Test 5: Job creation (no verification required)');
  try {
    const job1 = await sdk.jobs.createJob({
      title: 'Test Job',
      description: 'Test',
      budget: '10',
      milestones: [{ description: 'Test', amount: '10' }]
    });
    console.log('  Result: ✅ PASS');
  } catch (error) {
    console.log('  Result: ❌ FAIL -', error.message);
  }

  // Test 6: Job creation with verification
  console.log('\n✓ Test 6: Job creation (verification required)');
  sdk.jobs.setVerificationConfig({
    requireVerification: true,
    minVerificationLevel: VerificationLevel.Basic
  });
  
  try {
    const job2 = await sdk.jobs.createJob({
      title: 'Test Job 2',
      description: 'Test',
      budget: '20',
      milestones: [{ description: 'Test', amount: '20' }]
    });
    console.log('  Result: ✅ PASS');
  } catch (error) {
    console.log('  Result: ❌ FAIL -', error.message);
  }

  // Test 7: Block unverified user
  console.log('\n✓ Test 7: Block unverified user');
  await sdk.selfProtocol.revokeVerification(address);
  
  try {
    await sdk.jobs.createJob({
      title: 'Should Fail',
      description: 'Test',
      budget: '30',
      milestones: [{ description: 'Test', amount: '30' }]
    });
    console.log('  Result: ❌ FAIL - Should have blocked');
  } catch (error) {
    console.log('  Result: ✅ PASS - Correctly blocked');
  }

  // Test 8: Statistics
  console.log('\n✓ Test 8: getVerificationStats()');
  await sdk.selfProtocol.requestVerification(VerificationLevel.Basic);
  const stats = await sdk.selfProtocol.getVerificationStats();
  console.log('  Result:', stats ? '✅ PASS' : '❌ FAIL');
  console.log('  Active:', stats.active);

  console.log('\n🎉 All tests completed!\n');
}

quickTest().catch(console.error);
