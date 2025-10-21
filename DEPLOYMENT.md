# Deployment Guide

This guide walks you through deploying the CeloWork SDK smart contracts to Celo Alfajores testnet.

## Prerequisites

- Node.js v18 or higher
- A Celo wallet with private key
- Testnet CELO for gas fees (get from [Celo Faucet](https://faucet.celo.org/alfajores))

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

## Step 2: Configure Environment

```bash
cd contracts
cp .env.example .env
```

Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
CELOSCAN_API_KEY=your_celoscan_api_key_optional
```

**⚠️ Security Warning:** Never commit your `.env` file or share your private key!

## Step 3: Get Testnet CELO

1. Visit https://faucet.celo.org/alfajores
2. Enter your wallet address
3. Request testnet CELO
4. Wait for confirmation (usually takes a few seconds)

Verify your balance:
```bash
# You can check on Celoscan
https://alfajores.celoscan.io/address/YOUR_ADDRESS
```

## Step 4: Compile Contracts

```bash
cd contracts
npm run compile
```

This will:
- Compile the Solidity contracts
- Generate TypeScript types
- Create artifacts in `artifacts/` directory

## Step 5: Run Tests (Optional but Recommended)

```bash
npm test
```

This ensures all contract functions work correctly before deployment.

## Step 6: Deploy to Alfajores

```bash
npm run deploy
```

Expected output:
```
🚀 Deploying CeloWork Escrow Contract to Celo Alfajores...

Deploying with account: 0xYourAddress
Account balance: 5.0 CELO

Deploying CeloWorkEscrow...
✅ CeloWorkEscrow deployed to: 0xContractAddress

📝 Deployment info saved to: deployments/alfajores.json

🔗 View on Celoscan:
https://alfajores.celoscan.io/address/0xContractAddress

✨ Deployment complete!
```

## Step 7: Update SDK Configuration

After deployment, update the contract address in the SDK:

1. Open `sdk/config/contracts.ts`
2. Update the `CONTRACT_ADDRESSES` object:

```typescript
export const CONTRACT_ADDRESSES: Record<string, string> = {
  alfajores: "0xYourDeployedContractAddress", // Add the deployed address here
  celo: "",
  localhost: "",
};
```

## Step 8: Verify Contract (Optional)

Get a Celoscan API key from https://celoscan.io/myapikey

Add it to `.env`:
```env
CELOSCAN_API_KEY=your_api_key
```

Verify the contract:
```bash
npm run verify
```

## Step 9: Build SDK

```bash
cd ..
npm run build
```

This compiles the TypeScript SDK to JavaScript in the `dist/` directory.

## Step 10: Test with Demo

```bash
cd demo
cp .env.example .env
```

Edit `demo/.env`:
```env
CLIENT_PRIVATE_KEY=client_wallet_private_key
FREELANCER_PRIVATE_KEY=freelancer_wallet_private_key
NETWORK=alfajores
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Install demo dependencies and run:
```bash
npm install
npm start
```

## Deployment Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] Private key added to `contracts/.env`
- [ ] Testnet CELO in wallet (at least 1 CELO)
- [ ] Contracts compiled successfully
- [ ] Tests passing (optional)
- [ ] Contract deployed to Alfajores
- [ ] Contract address updated in SDK config
- [ ] SDK built successfully
- [ ] Demo tested and working

## Troubleshooting

### "Insufficient funds for gas"
- Get more testnet CELO from the faucet
- Ensure you have at least 1 CELO for deployment

### "Invalid private key"
- Make sure private key is in `.env` file
- Don't include the `0x` prefix
- Check for extra spaces or newlines

### "Network connection failed"
- Check your internet connection
- Try a different RPC endpoint in `hardhat.config.ts`

### "Contract verification failed"
- Ensure you have a valid Celoscan API key
- Wait a few minutes after deployment before verifying
- Check that the contract address is correct

## Next Steps

1. **Publish to npm** (optional):
   ```bash
   npm publish
   ```

2. **Create GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CeloWork SDK MVP"
   git remote add origin https://github.com/yourusername/celowork-sdk.git
   git push -u origin main
   ```

3. **Deploy to mainnet** (when ready):
   - Update `.env` with mainnet private key
   - Ensure sufficient CELO for gas
   - Run: `npm run deploy -- --network celo`

## Support

If you encounter issues:
- Check the [documentation](./docs/)
- Review contract tests for examples
- Open an issue on GitHub

## Security Notes

- Never share your private keys
- Use a separate wallet for testnet
- Audit contracts before mainnet deployment
- Consider using a hardware wallet for mainnet
- Set up proper access controls for production
