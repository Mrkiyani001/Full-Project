// Initialize Firebase (Config loaded from config.js)
if (!window.firebaseConfig) {
    console.error("Firebase Config not found. Make sure config.js is loaded.");
}

// Ensure firebase global exists (loaded via CDN)
if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded.");
} else {
    // Prevent duplicate initialization
    if (!firebase.apps.length) {
        firebase.initializeApp(window.firebaseConfig);
    }
}

const messaging = firebase.messaging();

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            
            // Get Token
            try {
                // Get Token (VAPID Key will be fetched from default config or can be added here if generated)
                const currentToken = await messaging.getToken({ vapidKey: window.firebaseConfig.vapidKey }); 
                
                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    sendTokenToBackend(currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } catch (err) {
                console.log('An error occurred while retrieving token. ', err);
            }
        } else {
            console.log('Unable to get permission to notify.');
        }
    } catch (error) {
        console.error("Error requesting permission", error);
    }
}

async function sendTokenToBackend(token) {
    try {
        const userDataStr = localStorage.getItem('user_data');
        if (!userDataStr) return;
        
        const user = JSON.parse(userDataStr);
        if (!user || !user.id) return;

        await fetch(`${API_BASE_URL}/update-fcm-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ fcm_token: token })
        });
        console.log('Token sent to backend');
    } catch (e) {
        console.error('Error sending token to backend', e);
    }
}

// Foreground message handler
messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // Custom toast or UI update
    if (window.showToast) {
        window.showToast(`${payload.notification.title}: ${payload.notification.body}`, 'success');
    }
});

// Auto-init if user is logged in
if (localStorage.getItem('user_data')) {
    requestNotificationPermission();
}

// Export for manual call if needed
window.requestNotificationPermission = requestNotificationPermission;
