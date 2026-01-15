/**
 * Global Configuration
 * Central source of truth for API URLs
 */

// Auto-detect Local Environment
// Environment Detection that works in both Window and Service Worker
var globalScope = typeof window !== 'undefined' ? window : self;
var hostname = globalScope.location.hostname;
var protocol = globalScope.location.protocol;

var IS_LOCAL = hostname === '127.0.0.1' || hostname === 'localhost' || protocol === 'file:';

// Dynamic API Host: Matches 'localhost' or '127.0.0.1' to prevent Cross-Site mismatches for local dev
var localApiHost = (hostname === 'localhost' || hostname === '127.0.0.1') ? hostname : '127.0.0.1';

var API_BASE_URL = IS_LOCAL
    ? `http://${localApiHost}:8000/api`
    : 'https://web.kiyanibhai.site/api';

var PUBLIC_URL = IS_LOCAL
    ? `http://${localApiHost}:8000`
    : 'https://web.kiyanibhai.site';

// Firebase Configuration (Public - Safe for Frontend)
var firebaseConfig = {
    apiKey: "AIzaSyDPkl_V6TPXm21rixhp6ZRikiXcb8n2B88",
    authDomain: "nexus-a2ec0.firebaseapp.com",
    projectId: "nexus-a2ec0",
    storageBucket: "nexus-a2ec0.firebasestorage.app",
    messagingSenderId: "505515744226",
    appId: "1:505515744226:web:b8e78901f1f43f9e60b7bb",
    measurementId: "G-40ENFMZYEH"
};

// Expose to window (for main thread) and self (for service worker)
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    window.PUBLIC_URL = PUBLIC_URL;
    window.firebaseConfig = firebaseConfig;
}
if (typeof self !== 'undefined') {
    self.API_BASE_URL = API_BASE_URL;
    self.firebaseConfig = firebaseConfig;
}

// console.log('App Config Loaded:', { API_BASE_URL, PUBLIC_URL });

/**
 * Console Security
 * Restricts console access for non-super admins.
 */
(function() {
    try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const roles = userData.roles || [];
        const isSuperAdmin = roles.some(r => r.name === 'super admin');

        if (!isSuperAdmin) {
            const noop = () => {};
            const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir'];

            // Save original console.log for the warning
            const originalLog = console.log;

            // Disable all methods
            consoleMethods.forEach(method => {
                console[method] = noop;
            });

            // Show Warning
            setTimeout(() => {
                originalLog('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold; background-color: white; padding: 10px; border-radius: 5px;');
                originalLog('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.', 'color: white; font-size: 18px; line-height: 1.5;');
                originalLog('%cAccess Denied: Ara oo Bhosdike hack kra ga baap ko.', 'color: red; font-size: 16px; font-weight: bold;');
            }, 1000);
        }
    } catch (e) {
        // Checking failed, secure by default
        console.log = function() {};
    }
})();
