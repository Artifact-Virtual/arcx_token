# Environment Setup Guide

## Quick Start

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your actual values:
```bash
nano .env  # or your preferred editor
```

3. **NEVER commit `.env` to version control**

## Required Environment Variables

### Essential for Deployment

| Variable | Required | Description |
|----------|----------|-------------|
| `ALCHEMY_API_KEY` | Yes | API key from Alchemy for blockchain connectivity |
| `DEPLOYER_PRIVATE_KEY` | Yes | Private key for deployment wallet (64 chars, no 0x) |
| `ETHERSCAN_API_KEY` | Yes | API key for contract verification |

### Token Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TOKEN_NAME` | ARCx | Full token name |
| `TOKEN_SYMBOL` | ARCx | Token symbol |
| `TOKEN_MAX_SUPPLY` | 100000000 | Maximum token supply (without decimals) |
| `INITIAL_ADMIN_ADDRESS` | deployer | Address to receive initial admin roles |

## Network Configuration

### Supported Networks

- **Mainnet**: Ethereum mainnet
- **Sepolia**: Ethereum testnet
- **Base**: Base L2
- **Polygon**: Polygon mainnet
- **Hardhat**: Local development

### Gas Configuration

```bash
# Mainnet (higher gas for reliability)
GAS_PRICE_MAINNET=25
GAS_LIMIT=3000000

# Testnet (lower gas for testing)
GAS_PRICE_TESTNET=10
```

## Security Best Practices

### Private Key Management

1. **Use a dedicated deployment wallet**
2. **Never reuse production private keys**
3. **Fund only with necessary amount**
4. **Rotate keys after deployment**

### Example Secure Setup

```bash
# Generate new wallet for deployment
npm install -g ethereum-cryptography
node -e "
const { randomBytes } = require('crypto');
const { privateKeyToAddress } = require('ethereum-cryptography/secp256k1');
const pk = randomBytes(32);
console.log('Private Key:', pk.toString('hex'));
console.log('Address:', '0x' + privateKeyToAddress(pk).toString('hex'));
"
```

### Environment Security Checklist

- [ ] `.env` added to `.gitignore`
- [ ] Private keys are 64 characters (no 0x prefix)
- [ ] API keys are valid and active
- [ ] Deployment wallet has sufficient funds
- [ ] Network configurations are correct
- [ ] Gas settings are appropriate

## Testing Configuration

### Local Development

```bash
# Enable fork testing
FORK_ENABLED=true
FORK_BLOCK_NUMBER=latest

# Test account setup
TEST_ACCOUNT_FUNDING=100  # ETH
```

### Gas Reporting

```bash
# Enable detailed gas reports
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_cmc_api_key  # for USD gas costs
```

## Deployment Verification

After setting up your environment, verify with:

```bash
# Test compilation
npm run compile

# Test deployment (dry run)
npx hardhat run scripts/deploy_arcx.ts --network hardhat

# Verify environment
npx hardhat run scripts/verify-env.ts
```

## Environment Validation Script

Create this script to validate your setup:

```javascript
// scripts/verify-env.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

async function main() {
  dotenv.config();
  
  console.log("Environment Validation");
  console.log("========================");
  
  // Check required variables
  const required = ["ALCHEMY_API_KEY", "DEPLOYER_PRIVATE_KEY", "ETHERSCAN_API_KEY"];
  
  for (const var_name of required) {
    const value = process.env[var_name];
    if (!value) {
      console.log(`Missing: ${var_name}`);
    } else {
      console.log(`Found: ${var_name} (${value.length} chars)`);
    }
  }
  
  // Test network connectivity
  try {
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`);
    const blockNumber = await provider.getBlockNumber();
    console.log(`Network connectivity: Block ${blockNumber}`);
  } catch (error) {
    console.log(`Network connectivity failed: ${error.message}`);
  }
  
  // Validate private key format
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (privateKey && privateKey.length === 64 && /^[0-9a-fA-F]+$/.test(privateKey)) {
    console.log("Private key format valid");
  } else {
    console.log("Private key format invalid (should be 64 hex chars, no 0x)");
  }
}

main().catch(console.error);
```

## Troubleshooting

### Common Issues

1. **"Network not configured"**
   - Check your ALCHEMY_API_KEY is set
   - Verify network name in deployment command

2. **"Insufficient funds"**
   - Ensure deployment wallet has ETH for gas
   - Check gas price settings

3. **"Invalid private key"**
   - Remove 0x prefix from private key
   - Ensure key is exactly 64 characters

4. **"Contract verification failed"**
   - Check ETHERSCAN_API_KEY is valid
   - Verify network supports verification

### Getting Help

- Check [Hardhat Documentation](https://hardhat.org/docs)
- Review [OpenZeppelin Guides](https://docs.openzeppelin.com/)
- Verify [Alchemy Setup](https://docs.alchemy.com/)

## Production Deployment Checklist

Before mainnet deployment:

- [ ] All tests passing (`npm test`)
- [ ] Contract compiled successfully
- [ ] Environment variables validated
- [ ] Deployment wallet funded
- [ ] Gas price set appropriately
- [ ] Audit completed and approved
- [ ] Contract verification ready
- [ ] Emergency pause mechanism tested
- [ ] Role management tested
- [ ] Bridge configuration planned
- [ ] Documentation updated
- [ ] Team notifications configured

---

**Remember**: The security of your private keys is critical. Use hardware wallets, key management services, or secure enclaves for production deployments.
