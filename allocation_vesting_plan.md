# ARCx Allocation & Vesting Plan

**Tokenomics:** 1,000,000 ARCx tokens

| Category               | Percentage | ARCx Amount | Vesting / Lock Details                                   |
|------------------------|------------|-------------|----------------------------------------------------------|
| Core Team & Developers | 20%        | 200,000     | 6–12 month cliff, 18–36 month linear vesting             |
| Ecosystem Fund         | 25%        | 250,000     | 25% unlocked at launch, 75% vests linearly over 1 year   |
| Community & Airdrop    | 15%        | 150,000     | Immediate claim or 3 month vesting option                |
| Strategic Partners     | 10%        | 100,000     | 6 month cliff, then linear vesting over 12 months        |
| Public Sale            | 20%        | 200,000     | Fully unlocked at sale event, no vesting                 |
| Treasury Reserve       | 10%        | 100,000     | Locked for 2 years, protocol use only                    |

---

## Vesting Mechanics

- **Cliff Period:** No tokens are released until the specified cliff duration elapses. This ensures initial commitment and retention.
- **Linear Vesting:** After the cliff, tokens are released in equal monthly increments over the vesting period. This smooths out distribution and aligns incentives.
- **Immediate Unlock:** Tokens are available for use or transfer as soon as they are distributed or claimed.

---

## Implementation Steps

1. **Wallet Setup:** Mint allocations to dedicated smart contracts or multisignature wallets for each category. Use transparent, auditable addresses.
2. **Unlock Logic:** Public sale and airdrop allocations should be set as unlocked unless a phased release is required.
3. **Transparency:** Publish the vesting schedule and wallet addresses for each allocation. Update regularly.
4. **Automation:** Use vesting automation tools (e.g., Sablier, Hedgey) or custom smart contracts to enforce vesting logic.
5. **Reporting:** Maintain a dashboard and documentation with live allocation and vesting status, including contract addresses and schedules.

---

## ARCx Allocation: Wallet and Vesting Templates

### 1. Wallet Creation

Establish a dedicated wallet for each allocation category. For team, treasury, and partners, use multisignature wallets (e.g., Safe) to enhance security and accountability.

| Category             | Wallet Type / Example Address | Recommended Tool / Method         |
|----------------------|------------------------------|-----------------------------------|
| Core Team & Developers | Multisig: `0xTeamSafe...`    | Safe multisig wallet              |
| Ecosystem Fund         | Multisig: `0xEcoSafe...`     | Safe or 2-of-3 multisig           |
| Community & Airdrop    | Single wallet: `0xAirdrop...`| Sablier vesting, or externally owned account (EOA) |
| Strategic Partners     | Multisig: `0xPartnerSafe...` | Safe multisig wallet              |
| Public Sale            | Sale contract: `0xSale...`   | Hedgey vesting or custom contract |
| Treasury Reserve       | Multisig: `0xTreasury...`    | Safe multisig wallet              |

---

### 2. Vesting Smart Contracts

Choose a vesting solution based on requirements and technical resources:

#### A. Sablier

- Deposit ARCx tokens into Sablier streams.
- Configure cliff and linear vesting parameters for each beneficiary.
- Share stream links for public verification.

#### B. Hedgey

- Create locked or vesting tokens with on-chain timelocks and schedules.
- Manage allocations and vesting visually via the Hedgey dashboard.

#### C. Custom Solidity Contracts

- Use OpenZeppelin’s Vesting Wallet contract template.
- Deploy individual contracts per beneficiary or a master contract with multiple schedules.
- Ensure contracts are open-source and auditable.

---

### 3. Public Allocation and Vesting Disclosure

Maintain a public table with allocation details, wallet addresses, and vesting timelines. Update as allocations are minted and vesting progresses.

| Category            | Wallet Address      | Vesting Start Date | Cliff Duration | Vesting End Date |
|---------------------|--------------------|--------------------|---------------|------------------|
| Core Team & Developers | `0xTeamSafe...`    | 2025-08-01         | 12 months     | 2027-08-01       |
| Ecosystem Fund         | `0xEcoSafe...`     | 2025-08-01         | None          | 2026-08-01       |
| Community & Airdrop    | `0xAirdrop...`     | 2025-08-01         | None          | 2025-11-01       |
| Strategic Partners     | `0xPartnerSafe...` | 2025-08-01         | 6 months      | 2026-08-01       |
| Public Sale            | `0xSale...`        | 2025-09-01         | None          | 2025-09-01       |
| Treasury Reserve       | `0xTreasury...`    | 2025-08-01         | 24 months     | 2027-08-01       |

---

### 4. Vesting Automation and Reporting

- Use Sablier or Hedgey dashboards for real-time public tracking of vesting streams and allocations.
- Add a transparency section to your website with allocation tables, vesting schedules, and contract addresses.
- Regularly update documentation and dashboards to reflect current vesting status and any changes.

---

## Next Steps

1. Create and label wallets for each allocation category using multisig where appropriate.
2. Mint or transfer ARCx tokens to each wallet according to the allocation table.
3. Set up vesting contracts or streams for each category, ensuring parameters match the published schedule.
4. Publish all relevant information—wallet addresses, vesting contracts, schedules, and live status—on public documentation and dashboards.

