 ARCxToken
    Deployment
      ✔ Should set the right name and symbol
      ✔ Should set the correct max supply
      ✔ Should grant all roles to deployer
      ✔ Should record deployment timestamp
    Minting
      ✔ Should allow minter to mint tokens
      ✔ Should not allow minting beyond max supply
      ✔ Should not allow minting after finalization
      ✔ Should not allow non-minter to mint
      ✔ Should emit MintFinalized event when finalized
    Burning
      ✔ Should allow token holders to burn tokens
      ✔ Should allow burning to fuel when bridge is set
      ✔ Should not allow burning to fuel when bridge is not set
      ✔ Should not allow burning to fuel when paused
    Bridge functionality
      ✔ Should allow admin to set fuel bridge
      ✔ Should not allow setting zero address as bridge
      ✔ Should not allow setting bridge twice
      ✔ Should emit events when bridge is set and locked
      ✔ Should not allow non-admin to set bridge
    Pausable
      ✔ Should allow pauser to pause transfers
      ✔ Should allow pauser to unpause
      ✔ Should not allow non-pauser to pause
    Access Control
      ✔ Should allow admin to grant roles
      ✔ Should allow admin to revoke roles
      ✔ Should prevent operations without proper roles
      ✔ Should allow admin role transfer
      ✔ Should not allow admin role transfer to zero address
      ✔ Should not allow admin role transfer to self
      ✔ Should allow admin role renouncement
      ✔ Should allow emergency role revocation
      ✔ Should not allow emergency revocation of own roles
      ✔ Should check role status correctly
      ✔ Should detect any admin role correctly
    ERC20 Standard Compliance
      ✔ Should transfer tokens between accounts
      ✔ Should approve and transfer from
      ✔ Should fail transfer when insufficient balance


  35 passing (0.123s)
  0 pending
  0 failing