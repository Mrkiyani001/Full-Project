/**
 * Site Branding Script
 * Fetches site settings from API and updates the UI (Title, Logo, etc.)
 * Uses localStorage for instant loading.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const PUBLIC_URL = 'http://127.0.0.1:8000'; // Define public URL for assets

    // Function to apply settings to UI
    const applySettings = (settings) => {
        if (!settings) return;

        const siteName = settings.site_name || 'Social Network';

        // 1. Update Title
        if (document.title.includes('-')) {
            const prefix = document.title.split('-')[0].trim();
            document.title = `${prefix} - ${siteName}`;
        } else {
            document.title = `${document.title} - ${siteName}`;
        }

        // 2. Update Logo Text
        const logoTextElements = document.querySelectorAll('#site-logo-text'); // Use querySelectorAll for multiple instances if any
        logoTextElements.forEach(el => el.textContent = siteName);

        // 3. Update Logo Image
        const logoPath = settings.logo ? `${PUBLIC_URL}/storage/${settings.logo}` : `${PUBLIC_URL}/storage/logo.png`;

        const logoImgElements = document.querySelectorAll('#site-logo-img');
        logoImgElements.forEach(img => {
            // Determine if it's an <img> tag or a div with background
            if (img.tagName === 'IMG') {
                img.src = logoPath;
                img.style.display = 'block'; // Ensure it's visible
            } else {
                // If it's a div (like in some dashboards), set background
                img.style.backgroundImage = `url('${logoPath}')`;
                img.textContent = '';
            }
        });

        // 4. Update Footer Text
        const footerText = document.getElementById('site-footer-text');
        if (footerText) {
            footerText.textContent = `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
        }

        // 5. Update Support Email Links
        if (settings.support_email) {
            const supportLinks = document.querySelectorAll('.support-link, #support-link');
            supportLinks.forEach(link => {
                link.href = `mailto:${settings.support_email}`;
            });
        }

        // 6. Update Site Description (Slogan)
        const descriptionElement = document.getElementById('site-description');
        if (descriptionElement && settings.site_description) {
            descriptionElement.textContent = settings.site_description;
        }

        // 7. Update Favicon
        let favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = logoPath;
    };

    // Expose function globally so it can be called after dynamic content loading (e.g. admin sidebar)
    window.refreshSiteBranding = async () => {
        // Cached default
        const cachedSettings = localStorage.getItem('site_settings');
        if (cachedSettings) {
             try { applySettings(JSON.parse(cachedSettings)); } catch(e){}
        }
        
        // Fetch fresh
        try {
            const response = await fetch(`${PUBLIC_URL}/api/settings`, {
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    let settings = data.data;
                    if (Array.isArray(settings)) settings = settings[0];
                    localStorage.setItem('site_settings', JSON.stringify(settings));
                    applySettings(settings);
                }
            }
        } catch (error) {
            console.error("Failed to fetch fresh site settings:", error);
        }
    };

    // Initial call
    window.refreshSiteBranding();
});
