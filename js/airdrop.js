// ARCx Smart Airdrop Interface - JavaScript Module
// Constitutional Intelligence Merit-Based Distribution

// Configuration
const CONFIG = {
    CHAIN_ID: 8453, // Base L2
    RPC_URL: 'https://mainnet.base.org',
    AIRDROP_CONTRACT: '0x123...abc', // Placeholder - will be updated when deployed
    ARCX_TOKEN: '0xA4093669DAFbD123E37d52e0939b3aB3C2272f44',
    // Set airdrop start time (7 days from now as example)
    AIRDROP_START_TIME: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).getTime()
};

let provider = null;
let signer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('ARCx Smart Airdrop Interface - Initializing...');
    addDebugInfo('Starting airdrop interface initialization');
    
    // Initialize background animations
    initializeBackgroundAnimations();
    
    // Set initial status
    updateSystemStatus('COMING SOON', 'Airdrop distribution will begin after auction completion');
    
    // Initialize wallet connection
    initializeWalletConnection();
    
    // Start countdown timer
    initializeCountdownTimer();
    
    // Show coming soon message by default
    document.getElementById('comingSoonMessage').style.display = 'block';
    
    // Add debug info
    addDebugInfo('Airdrop interface initialized');
    addDebugInfo('Contract verification pending');
    addDebugInfo('Eligibility checker ready');
});

function initializeBackgroundAnimations() {
    const floatingElements = document.querySelector('.floating-elements');
    
    // Create floating particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        floatingElements.appendChild(particle);
    }
}

function updateSystemStatus(status, message) {
    const statusEl = document.getElementById('systemStatus');
    const messageEl = document.getElementById('systemMessage');
    
    statusEl.textContent = status;
    statusEl.className = 'status-value status-loading';
    
    if (message) {
        messageEl.textContent = message;
    }
}

function initializeWalletConnection() {
    const connectBtn = document.getElementById('connectWallet');
    const statusDot = document.getElementById('statusDot');
    const walletStatus = document.getElementById('walletStatus');
    const walletAddress = document.getElementById('walletAddress');

    connectBtn.addEventListener('click', async function() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                addDebugInfo('Connecting to MetaMask...');
                
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (accounts.length > 0) {
                    const account = accounts[0];
                    const shortAddress = account.substring(0, 6) + '...' + account.substring(38);
                    
                    statusDot.classList.add('connected');
                    walletStatus.textContent = 'Connected';
                    walletAddress.textContent = shortAddress;
                    connectBtn.textContent = 'Connected';
                    connectBtn.disabled = true;
                    
                    addDebugInfo(`Wallet connected: ${shortAddress}`);
                    
                    // Check eligibility (placeholder)
                    setTimeout(() => checkEligibility(account), 1000);
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
                addDebugInfo(`Connection failed: ${error.message}`);
            }
        } else {
            showMessage('MetaMask is required to connect your wallet. Please install MetaMask and try again.', 'error');
            addDebugInfo('MetaMask not detected');
        }
    });
}

function checkEligibility(address) {
    addDebugInfo('Starting eligibility check...');
    
    // This would be replaced with actual eligibility checking logic
    const isEligible = Math.random() > 0.5; // Random for demo
    
    const resultsDiv = document.getElementById('eligibilityResults');
    const icon = document.getElementById('eligibilityIcon');
    const title = document.getElementById('eligibilityTitle');
    const message = document.getElementById('eligibilityMessage');
    
    resultsDiv.style.display = 'block';
    
    if (isEligible) {
        icon.textContent = '✓';
        icon.className = 'status-icon eligible';
        title.textContent = 'Eligible!';
        message.textContent = 'Your address is eligible for the ARCx airdrop. Claiming will be available after auction completion.';
        addDebugInfo('Address is eligible for airdrop');
    } else {
        icon.textContent = '✗';
        icon.className = 'status-icon not-eligible';
        title.textContent = 'Not Eligible';
        message.textContent = 'Your address does not meet the current eligibility criteria.';
        addDebugInfo('Address not eligible for airdrop');
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
    debugDiv.innerHTML += `<br>[${timestamp}] ${message}`;
}

// Countdown Timer Functions
function initializeCountdownTimer() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = CONFIG.AIRDROP_START_TIME - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Update display
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    
    const timerMessage = document.getElementById('timerMessage');
    const countdownDisplay = document.getElementById('countdownTimer');
    
    if (distance < 0) {
        // Airdrop has started
        countdownDisplay.classList.add('expired');
        timerMessage.textContent = 'Airdrop claiming is now live!';
        updateSystemStatus('LIVE', 'Airdrop claiming is now available');
        
        // Hide coming soon message and show claim interface
        document.getElementById('comingSoonMessage').style.display = 'none';
        
        addDebugInfo('Airdrop countdown expired - claiming is now live');
    } else {
        // Still counting down
        timerMessage.textContent = 'Until airdrop claiming begins';
        updateSystemStatus('COUNTDOWN ACTIVE', `Airdrop starts in ${days}d ${hours}h ${minutes}m`);
    }
}
