// Core Logic for WindUI Key System

const elements = {
    hwidInput: document.getElementById('hwidInput'),
    keyOutput: document.getElementById('keyOutput'),
    generateBtn: document.getElementById('generateBtn'),
    statusMessage: document.getElementById('statusMessage'),
    keySection: document.getElementById('keySection')
};

// Configuration
const REPO_NAME = "ANHub-Script/key-sytem"; 

// On Load: Check for HWID in URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hwidFromUrl = urlParams.get('hwid');
    
    if (hwidFromUrl) {
        elements.hwidInput.value = hwidFromUrl;
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

    const hash = generateHash(hwid + "WINDUI_SECRET_SALT_2025"); 
    const key = `ANHUB_${hash.substring(0, 12)}`;

    // Display Key locally
    elements.keyOutput.value = key;
    elements.keySection.classList.remove('disabled');
    
    showStatus('Key generated! Registering...', 'success');
    
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
    
    // Auto-Click Register for convenience? 
    // No, browser might block popups. Let user click.
    
    setLoading(false);
}

function registerKey(hwid) {
    // Redirect to GitHub Issue Creation
    const title = `REGISTER_KEY: ${hwid}`;
    const body = `Action: Register New Key\nHWID: ${hwid}\n\nPlease do not edit this issue. It will be processed automatically.`;
    const url = `https://github.com/${REPO_NAME}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    
    window.open(url, '_blank');
    showStatus('Checking activation status...', 'success');
    
    // Start Polling
    startPolling(hwid);
}

let pollInterval;
function startPolling(hwid) {
    const btn = elements.generateBtn;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-content"><i class="fa-solid fa-circle-notch fa-spin"></i> Waiting for Activation...</span>`;
    
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5s interval)
    
    pollInterval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            showStatus('Activation timed out. Please check GitHub Issues.', 'error');
            btn.disabled = false;
            btn.innerHTML = `<span class="btn-content"><i class="fa-solid fa-rotate-right"></i> Check Again</span>`;
            btn.onclick = () => startPolling(hwid); // Retry
            return;
        }

        try {
            // Fetch raw keys.txt
            // Using timestamp to bypass cache
            const response = await fetch(`https://raw.githubusercontent.com/${REPO_NAME}/main/docs/keys.txt?t=${Date.now()}`);
            const text = await response.text();
            
            if (text.includes(hwid)) {
                clearInterval(pollInterval);
                showStatus('SUCCESS! Key Activated.', 'success');
                btn.style.background = "var(--success)";
                btn.innerHTML = `<span class="btn-content"><i class="fa-solid fa-check"></i> Database Updated</span>`;
                
                // Celebration Animation
                triggerConfetti();
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 5000);
}

function triggerConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
    
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(particle);
        
        let x = 0;
        let y = 0;
        let opacity = 1;
        
        const animate = () => {
            x += vx;
            y += vy + 0.1; // gravity
            opacity -= 0.01;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// UI Helpers
function showStatus(msg, type) {
    elements.statusMessage.textContent = msg;
    elements.statusMessage.className = `status-message ${type}`;
}

function setLoading(isLoading) {
    const btn = elements.generateBtn;
    if (isLoading) {
        btn.disabled = true;
        btn.querySelector('.btn-content').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
    } else {
        btn.disabled = false;
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
        setTimeout(() => showStatus('', ''), 2000);
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