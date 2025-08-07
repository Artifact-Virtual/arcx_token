// ARCx Dutch Auction Interface - JavaScript Module
// Constitutional Intelligence Token Sale System

// Configuration
const CONFIG = {
    CHAIN_ID: 8453, // Base L2
    RPC_URL: 'https://mainnet.base.org',
    AUCTION_CONTRACT: '0x5Da5F567553C8D4F12542Ba608F41626f77Aa836',
    ARCX_TOKEN: '0xA4093669DAFbD123E37d52e0939b3aB3C2272f44'
};

// Contract ABI with correct function names
const AUCTION_ABI = [
    "function getAuctionStatus() view returns (uint256 _currentPrice, uint256 _tokensSold, uint256 _tokensRemaining, uint256 _totalRaised, uint256 _timeRemaining, bool _isActive)",
    "function purchase() payable"
];

let provider = null;
let signer = null;
let auctionContract = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('ARCx Dutch Auction Interface - Initializing...');
    addDebugInfo('Starting auction interface initialization');
    
    // Initialize background animations
    initializeBackgroundAnimations();
    
    // Load ethers.js with fallback CDNs
    console.log('Starting ethers.js loading...');
    loadEthersJS().then(() => {
        console.log('Ethers.js loaded successfully, initializing Web3...');
        addDebugInfo('Ethers.js loaded successfully');
        return initializeWeb3();
    }).then(() => {
        console.log('Web3 initialized, setting up event listeners...');
        setupEventListeners();
        startDataUpdater();
    }).catch(error => {
        console.error('Initialization failed:', error);
        addDebugInfo(`Initialization failed: ${error.message}`);
        updateSystemStatus('ERROR', `Failed to initialize: ${error.message}`);
    });
});

function initializeBackgroundAnimations() {
    const floatingElements = document.querySelector('.floating-elements');
    
    // Create floating particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        floatingElements.appendChild(particle);
    }
}

async function loadEthersJS() {
    // Simple and reliable ethers.js loading
    console.log('Loading ethers.js...');
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
        script.onload = () => {
            if (typeof ethers !== 'undefined') {
                console.log('Ethers.js loaded successfully');
                addDebugInfo('Ethers.js loaded successfully');
                resolve();
            } else {
                reject(new Error('Ethers.js loaded but not available'));
            }
        };
        script.onerror = () => {
            reject(new Error('Failed to load ethers.js from CDN'));
        };
        document.head.appendChild(script);
    });
}

async function initializeWeb3() {
    try {
        addDebugInfo('Initializing Web3 provider...');
        
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            addDebugInfo('MetaMask provider initialized');
        } else {
            provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
            addDebugInfo('Fallback RPC provider initialized');
        }
        
        auctionContract = new ethers.Contract(CONFIG.AUCTION_CONTRACT, AUCTION_ABI, provider);
        addDebugInfo('Auction contract initialized');
        
        updateSystemStatus('ACTIVE', 'Dutch auction is live');
        
    } catch (error) {
        console.error('Web3 initialization failed:', error);
        addDebugInfo(`Web3 init failed: ${error.message}`);
        updateSystemStatus('ERROR', 'Failed to connect to blockchain');
    }
}

function setupEventListeners() {
    // Connect Wallet Button
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Purchase Button
    document.getElementById('purchaseBtn').addEventListener('click', purchaseTokens);
    
    // ETH Amount Input
    document.getElementById('ethAmount').addEventListener('input', updateTokenEstimate);
    
    addDebugInfo('Event listeners configured');
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showMessage('MetaMask is required to connect your wallet. Please install MetaMask and try again.', 'error');
        addDebugInfo('MetaMask not detected');
        return;
    }

    try {
        addDebugInfo('Connecting to MetaMask...');
        showMessage('Connecting to MetaMask...', 'info');

        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const account = accounts[0];
        addDebugInfo(`Connected account: ${account}`);

        // Update provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        auctionContract = new ethers.Contract(CONFIG.AUCTION_CONTRACT, AUCTION_ABI, signer);

        // Check and switch to Base network
        await ensureBaseNetwork();
        
        // Update UI
        const shortAddress = account.substring(0, 6) + '...' + account.substring(38);
        document.getElementById('statusDot').classList.add('connected');
        document.getElementById('walletStatus').textContent = 'Connected';
        document.getElementById('walletAddress').textContent = shortAddress;
        document.getElementById('connectWallet').textContent = 'Connected';
        document.getElementById('connectWallet').disabled = true;
        document.getElementById('purchaseBtn').disabled = false;
        document.getElementById('purchaseBtn').textContent = 'Purchase Tokens';

        showMessage(`Connected to ${shortAddress}`, 'success');
        addDebugInfo('Wallet connection successful');

    } catch (error) {
        console.error('Wallet connection failed:', error);
        showMessage(`Connection failed: ${error.message}`, 'error');
        addDebugInfo(`Connection failed: ${error.message}`);
    }
}

async function ensureBaseNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (parseInt(chainId, 16) !== CONFIG.CHAIN_ID) {
            addDebugInfo('Switching to Base network...');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${CONFIG.CHAIN_ID.toString(16)}` }],
                });
                addDebugInfo('Successfully switched to Base network');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    // Network not added yet, add it
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
                            chainName: 'Base',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: [CONFIG.RPC_URL],
                            blockExplorerUrls: ['https://basescan.org/']
                        }]
                    });
                    addDebugInfo('Base network added and switched');
                }
            }
        }
    } catch (error) {
        console.error('Network setup failed:', error);
        addDebugInfo(`Network setup failed: ${error.message}`);
    }
}

async function purchaseTokens() {
    const ethAmount = document.getElementById('ethAmount').value;
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
        showMessage('Please enter a valid ETH amount', 'error');
        return;
    }

    if (!signer) {
        showMessage('Please connect your wallet first', 'error');
        return;
    }

    try {
        addDebugInfo(`Starting purchase: ${ethAmount} ETH`);
        showMessage('Preparing transaction...', 'info');

        const ethValue = ethers.utils.parseEther(ethAmount);
        addDebugInfo(`ETH value in wei: ${ethValue.toString()}`);

        // Estimate gas
        const gasEstimate = await auctionContract.estimateGas.purchase({
            value: ethValue
        });
        addDebugInfo(`Gas estimate: ${gasEstimate.toString()}`);

        // Send transaction
        showMessage('Please confirm the transaction in MetaMask...', 'info');
        const tx = await auctionContract.purchase({
            value: ethValue,
            gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
        });

        addDebugInfo(`Transaction sent: ${tx.hash}`);
        showMessage(`Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`, 'info');

        // Wait for confirmation
        const receipt = await tx.wait();
        addDebugInfo(`Transaction confirmed in block: ${receipt.blockNumber}`);
        showMessage('Purchase successful! Tokens will be available after auction ends.', 'success');

        // Clear input and refresh data
        document.getElementById('ethAmount').value = '';
        document.getElementById('arcxAmount').value = '';
        refreshAuctionData();

    } catch (error) {
        console.error('Purchase failed:', error);
        let errorMessage = 'Purchase failed';
        
        if (error.code === 4001) {
            errorMessage = 'Transaction cancelled by user';
        } else if (error.reason) {
            errorMessage = error.reason;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
        addDebugInfo(`Purchase failed: ${errorMessage}`);
    }
}

async function updateTokenEstimate() {
    const ethAmount = document.getElementById('ethAmount').value;
    const arcxAmountField = document.getElementById('arcxAmount');
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
        arcxAmountField.value = '';
        return;
    }

    try {
        if (auctionContract) {
            const status = await auctionContract.getAuctionStatus();
            const currentPrice = status._currentPrice;
            const ethValue = ethers.utils.parseEther(ethAmount);
            const tokenAmount = ethValue.div(currentPrice);
            arcxAmountField.value = ethers.utils.formatEther(tokenAmount);
            addDebugInfo(`Price calculation: ${ethAmount} ETH = ${ethers.utils.formatEther(tokenAmount)} ARCx`);
        }
    } catch (error) {
        console.error('Price calculation failed:', error);
        addDebugInfo(`Price calculation failed: ${error.message}`);
    }
}

async function refreshAuctionData() {
    if (!auctionContract) return;

    try {
        addDebugInfo('Refreshing auction data...');
        
        // Get auction status
        const status = await auctionContract.getAuctionStatus();
        
        // Update current price
        const priceInEth = ethers.utils.formatEther(status._currentPrice);
        document.getElementById('currentPrice').textContent = parseFloat(priceInEth).toFixed(6);
        
        // Update stats
        document.getElementById('tokensAvailable').textContent = parseInt(ethers.utils.formatEther(status._tokensRemaining)).toLocaleString();
        document.getElementById('tokensSold').textContent = parseInt(ethers.utils.formatEther(status._tokensSold)).toLocaleString();
        
        // Calculate time remaining
        const timeLeft = status._timeRemaining.toNumber();
        
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            document.getElementById('timeRemaining').textContent = `${hours}h ${minutes}m`;
        } else {
            document.getElementById('timeRemaining').textContent = 'Ended';
        }
        
        // Update total raised
        const totalRaised = parseFloat(ethers.utils.formatEther(status._totalRaised)).toFixed(2);
        document.getElementById('totalRaised').textContent = totalRaised;
        
        addDebugInfo('Auction data refreshed');
        
    } catch (error) {
        console.error('Failed to refresh auction data:', error);
        addDebugInfo(`Data refresh failed: ${error.message}`);
    }
}

function startDataUpdater() {
    // Initial data load
    refreshAuctionData();
    
    // Update every 30 seconds
    setInterval(refreshAuctionData, 30000);
    
    addDebugInfo('Data updater started (30s interval)');
}

function updateSystemStatus(status, message) {
    const statusEl = document.getElementById('systemStatus');
    const messageEl = document.getElementById('systemMessage');
    
    statusEl.textContent = status;
    statusEl.className = `status-value ${status === 'ERROR' ? 'status-error' : status === 'ACTIVE' ? 'status-success' : 'status-loading'}`;
    
    if (message) {
        messageEl.textContent = message;
    }
}

function showMessage(message, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    messageArea.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function addDebugInfo(message) {
    const debugDiv = document.getElementById('debugInfo');
    const timestamp = new Date().toLocaleTimeString();
    // Use textContent to safely add debug info without HTML injection
    debugDiv.textContent += `[${timestamp}] ${message}\n`;
    
    // Scroll to bottom
    debugDiv.scrollTop = debugDiv.scrollHeight;
}
