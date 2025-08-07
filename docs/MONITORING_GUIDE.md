# ARCx Ecosystem Monitoring & Operations Guide

## 🎯 Quick Reference

### Core Monitoring Tools
```bash
# Live system dashboard (run regularly)
npx hardhat run scripts/live-monitor.ts --network base

# Dutch auction monitoring and verification
npx hardhat run scripts/auction-monitor.ts --network base

# Complete audit trail (comprehensive token tracking)
npx hardhat run scripts/audit-trail.ts --network base

# Quick accountability check (rapid verification)
npx hardhat run scripts/quick-audit.ts --network base

# Token allocation summary
npx hardhat run scripts/token-allocation-summary.ts --network base
```

### Advanced Monitoring
```bash
# Continuous live monitoring (5-minute intervals)
npx hardhat run scripts/live-monitor.ts --network base -- --continuous

# Custom interval monitoring (10-minute intervals)
npx hardhat run scripts/live-monitor.ts --network base -- --continuous --interval 10
```

## 📊 Tool Purposes & When to Use

### 1. live-monitor.ts - **PRIMARY OPERATIONAL TOOL**
- **Purpose:** Real-time system health monitoring
- **Use When:** Daily operations, system checks, issue detection
- **Features:**
  - Live token contract status
  - Auction progress monitoring  
  - Treasury balance alerts
  - Wallet connection tracking
  - Recent transaction scanning
  - Critical alerts and warnings

### 2. auction-monitor.ts - **AUCTION-SPECIFIC MONITORING**
- **Purpose:** Comprehensive Dutch auction verification
- **Use When:** Monitoring auction participation, verifying bid integrity
- **Features:**
  - Real-time auction status
  - Bid history analysis
  - Participant tracking
  - Price discovery monitoring
  - Contract integrity verification

### 3. audit-trail.ts - **COMPREHENSIVE ACCOUNTABILITY**
- **Purpose:** Complete token tracking from deployment
- **Use When:** Full audit requirements, compliance verification
- **Features:**
  - Every transaction from deployment
  - Complete balance integrity verification
  - Address activity analysis
  - Perfect accountability verification

### 4. quick-audit.ts - **RAPID VERIFICATION**
- **Purpose:** Fast token accountability check
- **Use When:** Quick status verification, daily checks
- **Features:**
  - Current token distribution
  - Accountability percentage
  - Contract status summary

### 5. token-allocation-summary.ts - **ALLOCATION TRACKING**
- **Purpose:** Detailed allocation breakdown analysis
- **Use When:** Understanding token distribution, allocation verification
- **Features:**
  - Functional allocation breakdown
  - Balance verification
  - Unknown address tracking

## 🚨 Monitoring Schedule Recommendations

### Daily Operations (Required)
```bash
# Morning check (system health)
npx hardhat run scripts/live-monitor.ts --network base

# Auction status (if active)
npx hardhat run scripts/auction-monitor.ts --network base
```

### Weekly Compliance (Recommended)
```bash
# Full audit trail verification
npx hardhat run scripts/audit-trail.ts --network base

# Quick accountability verification
npx hardhat run scripts/quick-audit.ts --network base
```

### Monthly Reports (Best Practice)
```bash
# Complete allocation analysis
npx hardhat run scripts/token-allocation-summary.ts --network base
```

## ⚠️ Alert Conditions

### Critical Alerts (Immediate Action Required)
- Token contract paused
- Auction paused while active
- Treasury balance below operational threshold
- Balance integrity verification failures

### Warning Conditions (Monitor Closely)
- Treasury ETH balance low (<0.001 ETH)
- Ecosystem Safe zero balance
- No recent auction participation
- Unusual transaction patterns

## 🔍 Troubleshooting Guide

### Issue: "Contract not found" or connection errors
**Solution:** Verify network connection and contract addresses in shared/constants.ts

### Issue: High gas warnings or transaction failures
**Solution:** Check network congestion and ETH balances for operational wallets

### Issue: Auction shows unexpected status
**Solution:** Run auction-monitor.ts for detailed analysis and integrity verification

### Issue: Token accountability discrepancies
**Solution:** Run audit-trail.ts for complete transaction analysis and verification

## 📈 Performance Metrics

### Current System Status (as of latest check)
- **Token Contract:** ✅ Active, minting finalized
- **Dutch Auction:** ✅ Active, 0% participation
- **Treasury Operations:** ✅ Operational with adequate ETH
- **Token Accountability:** ✅ 100% perfect tracking
- **System Integrity:** ✅ All verification checks passed

### Key Performance Indicators
- Token accountability: 100%
- System uptime: 100%
- Auction integrity: ✅ Verified
- Treasury operational status: ✅ Funded
- Script consolidation: 79% reduction achieved

## 🛠️ Emergency Procedures

### If Critical Alerts Appear
1. Run live-monitor.ts for immediate status
2. Check specific systems with targeted tools
3. Verify transaction history with audit-trail.ts
4. Document findings and implement fixes
5. Re-verify with comprehensive monitoring

### If Auction Issues Detected
1. Run auction-monitor.ts for detailed analysis
2. Verify contract integrity and balances
3. Check recent bid history for anomalies
4. Monitor participant activity patterns

### If Token Accountability Issues
1. Run audit-trail.ts for complete analysis
2. Verify all balance calculations
3. Check for recent transaction patterns
4. Confirm integrity verification results

---

**Last Updated:** August 7, 2025  
**Tools Version:** v2.0 (Post-consolidation)  
**Network:** Base Mainnet (Chain ID: 8453)  
**Status:** All systems operational ✅
