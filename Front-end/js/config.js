
/**
 * Global Configuration
 * Central source of truth for API URLs
 */

// Toggle this for local vs production
const IS_LOCAL = false; // <--- YEH CHANGE HUA HAI (FALSE)

const API_BASE_URL = IS_LOCAL
    ? 'http://127.0.0.1:8000/api'
    : 'http://54.248.199.202/api'; // <--- YEH CHANGE HUA HAI (AWS IP)

const PUBLIC_URL = IS_LOCAL
    ? 'http://127.0.0.1:8000'
    : 'http://54.248.199.202'; // <--- YEH CHANGE HUA HAI (AWS IP)

// Expose to window for global access
window.API_BASE_URL = API_BASE_URL;
window.PUBLIC_URL = PUBLIC_URL;

console.log('App Config Loaded:', { API_BASE_URL, PUBLIC_URL });