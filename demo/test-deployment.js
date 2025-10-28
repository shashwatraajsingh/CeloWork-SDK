/**
 * Test deployed contract on Celo Sepolia
 */

require('dotenv').config();
const { CeloWorkSDK } = require('celowork-sdk');

async function testDeployment() {
  console.log('🧪 Testing CeloWork SDK with deployed contract on Celo Sepolia\n');
  console.log('='.repeat(70));

  // Initialize SDK with Celo Sepolia
  const sdk = new CeloWorkSDK({
    network: 'celoSepolia',
    privateKey: process.env.CLIENT_PRIVATE_KEY || process.env.PRIVATE_KEY,
  });

  console.log('\n✅ SDK initialized successfully!');
  console.log('Network: Celo Sepolia Testnet');
  console.log('Chain ID: 11142220');

  // Get user address
  const address = await sdk.getAddress();
  console.log('\n👤 Your Address:', address);

  // Get balance
  const balance = await sdk.getBalance();
  console.log('💰 Balance:', balance, 'CELO');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Deployment Test Complete!');
  console.log('='.repeat(70));

  console.log('\n📋 Contract Information:');
  console.log('Contract Address: 0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6');
  console.log('Explorer: https://sepolia.celoscan.io/address/0x881CE3f25E8383d276D78Cdc454BFa15D34a5AF6');

  console.log('\n✨ Next Steps:');
  console.log('1. Run full demo: npm start');
  console.log('2. Run verification demo: npm run verify');
  console.log('3. Create jobs and test escrow functionality');

  console.log('\n💡 Tip: Make sure you have CELO on Celo Sepolia testnet');
  console.log('   Your current balance:', balance, 'CELO');
}

testDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
