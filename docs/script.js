// Core Logic for WindUI Key System

const elements = {
    hwidInput: document.getElementById('hwidInput'),
    keyOutput: document.getElementById('keyOutput'),
    generateBtn: document.getElementById('generateBtn'),
    statusMessage: document.getElementById('statusMessage'),
    keySection: document.getElementById('keySection')
};

// Configuration
// CHANGE THIS TO YOUR REPO: "username/repo-name"
const REPO_NAME = "ANHub-Script/key-sytem"; 

// On Load: Check for HWID in URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hwidFromUrl = urlParams.get('hwid');
    
    if (hwidFromUrl) {
        elements.hwidInput.value = hwidFromUrl;
        // Auto-trigger verification if HWID is present? 
        // No, let user click to be safe.
    }
});

// Simple Hashing Function (Client-Side Preview Only)
function generateHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(16).toUpperCase();
}

async function generateKey() {
    const hwid = elements.hwidInput.value.trim();

    if (!hwid) {
        showStatus('Please enter your HWID first!', 'error');
        shake(elements.hwidInput.parentElement);
        return;
    }

    if (hwid.length < 5) {
        showStatus('Invalid HWID format. Too short.', 'error');
        return;
    }

    // Simulate Processing
    setLoading(true);
    await wait(1000);

    // Generate the Client-Side Preview Key (User can use this immediately)
    // AND also open the registration page for the repo.
    
    const hash = generateHash(hwid + "WINDUI_SECRET_SALT_2025"); 
    const key = `ANHUB_${hash.substring(0, 12)}`;

    // Display Key locally
    elements.keyOutput.value = key;
    elements.keySection.classList.remove('disabled');
    
    showStatus('Key generated! Proceed to Register.', 'success');
    
    // Change Button to "Register in Database"
    const btn = elements.generateBtn;
    btn.onclick = () => registerKey(hwid);
    btn.innerHTML = `
        <span class="btn-content">
            <i class="fa-brands fa-github"></i> Register to Database
        </span>
        <div class="btn-glow"></div>
    `;
    btn.style.background = "var(--accent)";
    
    setLoading(false);
}

function registerKey(hwid) {
    // Redirect to GitHub Issue Creation
    const title = `REGISTER_KEY: ${hwid}`;
    const body = `Action: Register New Key\nHWID: ${hwid}\n\nPlease do not edit this issue. It will be processed automatically.`;
    const url = `https://github.com/${REPO_NAME}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    
    window.open(url, '_blank');
    showStatus('Opening GitHub Issue... Submit it to save key!', 'success');
}

// UI Helpers
function showStatus(msg, type) {
    elements.statusMessage.textContent = msg;
    elements.statusMessage.className = `status-message ${type}`;
    setTimeout(() => {
        elements.statusMessage.textContent = '';
        elements.statusMessage.className = 'status-message';
    }, 4000);
}

function setLoading(isLoading) {
    const btn = elements.generateBtn;
    if (isLoading) {
        btn.disabled = true;
        btn.querySelector('.btn-content').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
    } else {
        btn.disabled = false;
        // Reset happens in main logic
    }
}

function shake(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => element.style.animation = '', 500);
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clipboard Functions
async function pasteHWID() {
    try {
        const text = await navigator.clipboard.readText();
        elements.hwidInput.value = text;
    } catch (err) {
        showStatus('Failed to read clipboard. Please paste manually.', 'error');
    }
}

function copyKey() {
    const key = elements.keyOutput.value;
    if (!key) return;
    
    navigator.clipboard.writeText(key).then(() => {
        showStatus('Key copied to clipboard!', 'success');
    });
}

// Add simple shake animation style dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);