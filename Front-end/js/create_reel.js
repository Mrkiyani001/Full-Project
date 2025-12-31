document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const videoInput = document.getElementById('video-file-input');
    const thumbnailInput = document.getElementById('thumbnail-file-input');
    const uploadState = document.getElementById('upload-state');
    const videoPreview = document.getElementById('video-preview');
    const videoControls = document.getElementById('video-controls');
    const changeVideoBtn = document.getElementById('change-video-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const muteBtn = document.getElementById('mute-btn');

    // Form Elements
    const captionInput = document.getElementById('caption');

    // Thumbnail Elements
    const uploadThumbBtn = document.getElementById('upload-thumb-btn');
    const selectFrameBtn = document.getElementById('select-frame-btn');
    const thumbnailImg = document.getElementById('thumbnail-img');
    const frameSelector = document.getElementById('frame-selector');
    const frameSlider = document.getElementById('frame-slider');
    const frameTime = document.getElementById('frame-time');
    const saveFrameBtn = document.getElementById('save-frame-btn');
    const canvas = document.getElementById('capture-canvas');

    // Privacy
    const privacyGroup = document.getElementById('privacy-group');
    const privacyBtns = document.querySelectorAll('.privacy-btn');

    // Action Buttons
    const postBtn = document.getElementById('post-btn');
    const discardBtn = document.getElementById('discard-btn');
    const closePageBtn = document.getElementById('close-page-btn');

    if (closePageBtn) {
        closePageBtn.addEventListener('click', () => {
            if (state.videoFile && !confirm("Discard changes?")) return;
            window.location.href = 'reels.html';
        });
    }

    // State
    let state = {
        videoFile: null,
        thumbnailFile: null,
        privacy: 'public', // Default
        isEditing: false,
        editId: null
    };

    // --- Check for Edit Mode ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlEditId = urlParams.get('edit_id');
    const editData = localStorage.getItem('edit_reel_data');
    
    // Priority: LocalStorage -> URL
    if (editData || urlEditId) {
        try {
            let reel = null;
            if(editData) {
                reel = JSON.parse(editData);
            } else if(urlEditId) {
                // If only ID in URL, we need to fetch or trust.
                // Since we can't sync fetch easily here without refactor, we assume basic edit mode 
                // but we might miss pre-filled data if not in storage.
                // However, user problem is STATE desync.
                // If we have ID, we set checking true.
                state.editId = urlEditId;
                state.isEditing = true;
                document.querySelector('h1').textContent = "Edit Reel";
                postBtn.querySelector('#post-btn-text').textContent = "Update Reel";
                // We might rely on backend to just update what we send? 
                // But we need to pre-fill. 
                // If URL used, we should fetch. 
                // For now sticking to fixing strict check.
            }

            if(reel) {
                state.isEditing = true;
                state.editId = reel.id;
                state.privacy = reel.privacy || 'public';


            // UI Updates for Edit Mode
            document.querySelector('h1').textContent = "Edit Reel";
            document.title = "Edit Reel - NexUs";
            captionInput.value = reel.caption || '';
            updatePrivacyUI(); // Sync privacy buttons

            // LOCK Video & Thumbnail ALWAYS for Edit Mode (User Request)
            uploadState.innerHTML = `
                <div class="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <span class="material-symbols-outlined text-3xl text-gray-500">lock</span>
                </div>
                <p class="text-gray-200 font-bold mb-1">Video Locked</p>
                <p class="text-gray-500 text-xs text-center px-4">Video and thumbnail cannot be changed during update.</p>
            `;
            uploadState.style.pointerEvents = 'none';
            changeVideoBtn.style.display = 'none';

            const upThumbBtn = document.getElementById('upload-thumb-btn');
            if (upThumbBtn) upThumbBtn.style.display = 'none';

            const selFrameBtn = document.getElementById('select-frame-btn');
            if (selFrameBtn) selFrameBtn.style.display = 'none';

            // Show current thumbnail preview static
            let thumb = reel.thumbnail_path;
            if (thumb && !thumb.startsWith('http')) thumb = `${window.PUBLIC_URL}/storage/${thumb}`;
            if (thumb) {
                thumbnailImg.src = thumb;
                thumbnailImg.classList.remove('hidden');
            }

            // Note: Video is not shown in preview to avoid loading larg files, or we can show it if URL is available.
            // Let's show it if available but control inputs are hidden.
            let vidUrl = reel.video_path;
            if (vidUrl && !vidUrl.startsWith('http')) vidUrl = `${window.PUBLIC_URL}/storage/${vidUrl}`;

            if (vidUrl) {
                videoPreview.src = vidUrl;
                videoPreview.classList.remove('hidden');
                uploadState.classList.add('hidden');
                // Hide Controls overlay that allows changing?
                // Actually handleVideoSelect hides uploadState.
                // Here we just show preview.
            }


            // Change Button Text
            postBtn.querySelector('#post-btn-text').textContent = "Update Reel";
            postBtn.querySelector('#post-btn-icon').textContent = "save";

            
            // Clear storage - REMOVING this to persist state on reload. 
            // We will clear it on Success instead.
            
        } } catch (e) { console.error("Edit parse error", e); }
    }

    // --- 1. Video Upload Logic ---

    // Check if token exists
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    // Trigger file input
    uploadState.addEventListener('click', () => {
        if (!state.isEditing) videoInput.click(); // Disable click in edit mode if we want strict consistency
    });
    changeVideoBtn.addEventListener('click', () => videoInput.click());

    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleVideoSelect(file);
    });

    const handleVideoSelect = (file) => {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            alert('File too large. Max size is 100MB.');
            return;
        }

        state.videoFile = file;
        const url = URL.createObjectURL(file);
        videoPreview.src = url;

        // Setup slider bounds when metadata loads
        videoPreview.onloadedmetadata = () => {
            frameSlider.max = videoPreview.duration;
        };

        // UI Updates
        uploadState.classList.add('hidden');
        videoPreview.classList.remove('hidden');
        videoControls.classList.remove('hidden');

        // Reset thumbnail if exists
        state.thumbnailFile = null;
        thumbnailImg.classList.add('hidden');
        thumbnailImg.src = '';
        frameSelector.classList.add('hidden');
    };

    // --- 2. Video Player Controls ---

    const togglePlay = () => {
        if (videoPreview.paused) {
            videoPreview.play();
            playIcon.textContent = 'pause';
            // Hide frame selector if playing
            frameSelector.classList.add('hidden');
        } else {
            videoPreview.pause();
            playIcon.textContent = 'play_arrow';
        }
    };

    playPauseBtn.addEventListener('click', togglePlay);
    videoPreview.addEventListener('click', togglePlay);

    // Update Progress
    videoPreview.addEventListener('timeupdate', () => {
        const percent = (videoPreview.currentTime / videoPreview.duration) * 100;
        progressBar.style.width = `${percent}%`;
        timeDisplay.textContent = `${formatTime(videoPreview.currentTime)} / ${formatTime(videoPreview.duration || 0)}`;
    });

    // Mute
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        videoPreview.muted = !videoPreview.muted;
        muteBtn.innerHTML = videoPreview.muted ?
            '<span class="material-symbols-outlined text-[20px]">volume_off</span>' :
            '<span class="material-symbols-outlined text-[20px]">volume_up</span>';
    });

    // Show controls on hover
    const playerContainer = document.querySelector('.group\\/player'); // Escaped selector
    if (playerContainer) {
        playerContainer.addEventListener('mouseenter', () => videoControls.style.opacity = '1');
        playerContainer.addEventListener('mouseleave', () => {
            if (!videoPreview.paused) videoControls.style.opacity = '0';
        });
    }

    // --- 3. Thumbnail Logic ---

    // Option A: Upload File
    uploadThumbBtn.addEventListener('click', () => {
        thumbnailInput.click();
        frameSelector.classList.add('hidden'); // Hide slider if upload clicked
    });

    thumbnailInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            state.thumbnailFile = file;
            const url = URL.createObjectURL(file);
            thumbnailImg.src = url;
            thumbnailImg.classList.remove('hidden');
        }
    });

    // Option B: Select Frame
    selectFrameBtn.addEventListener('click', () => {
        if (!state.videoFile && !state.isEditing) { // Allow if editing might have existing video? No, need file object for capture usually.
            alert("Please upload a video first.");
            return;
        }

        // If editing and no new file, we can't capture easily from cross-origin video (CORS).
        // Check if we have a file.
        if (state.isEditing && !state.videoFile) {
            alert("Cannot edit thumbnail of existing video. Please upload a new video to change thumbnail.");
            return;
        }

        // Pause video to make selection easier
        videoPreview.pause();
        playIcon.textContent = 'play_arrow';

        // Show/Toggle Selector
        frameSelector.classList.toggle('hidden');

        // Sync slider with current time
        frameSlider.value = videoPreview.currentTime;
        frameTime.textContent = formatTime(videoPreview.currentTime);
    });

    frameSlider.addEventListener('input', (e) => {
        const time = parseFloat(e.target.value);
        videoPreview.currentTime = time;
        frameTime.textContent = formatTime(time);
    });

    saveFrameBtn.addEventListener('click', () => {
        // Capture logic
        canvas.width = videoPreview.videoWidth;
        canvas.height = videoPreview.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                // Create File object
                const file = new File([blob], "thumbnail_frame.jpg", { type: "image/jpeg" });
                state.thumbnailFile = file;

                // Update Preview Image
                const url = URL.createObjectURL(blob);
                thumbnailImg.src = url;
                thumbnailImg.classList.remove('hidden');

                // Hide selector
                frameSelector.classList.add('hidden');
            }
        }, 'image/jpeg', 0.85); // 85% quality
    });

    // --- 4. Privacy Selection ---

    privacyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            state.privacy = value;
            updatePrivacyUI();
        });
    });

    const updatePrivacyUI = () => {
        privacyBtns.forEach(btn => {
            const val = btn.getAttribute('data-value');
            const isActive = val === state.privacy;

            if (isActive) {
                // Active Styles (Gradient)
                btn.className = "privacy-btn group relative flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/10 transition-all";
                // Add Check Icon if not exists
                if (!btn.querySelector('.check-icon')) {
                    const icon = document.createElement('div');
                    icon.className = "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#101522] check-icon";
                    btn.appendChild(icon);
                }
            } else {
                // Inactive Styles
                btn.className = "privacy-btn flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white border border-transparent";
                // Remove check icon
                const icon = btn.querySelector('.check-icon');
                if (icon) icon.remove();
            }
        });
    };

    // --- 5. Submission ---

    postBtn.addEventListener('click', async () => {
        // Robust Check: Trust UI if state failed
        const btnText = postBtn.querySelector('#post-btn-text').textContent;
        const isUpdateMode = state.isEditing || btnText.includes('Update');
        
        if (!state.videoFile && !isUpdateMode) {
            alert('Please select a video first.');
            return;
        }

        const formData = new FormData();
        // If editing, only append video if provided
        if (state.videoFile) formData.append('video', state.videoFile);

        formData.append('caption', captionInput.value);
        formData.append('privacy', state.privacy);

        // Ensure we send ID if update mode
        if (isUpdateMode) {
             formData.append('reel_id', state.editId || new URLSearchParams(window.location.search).get('edit_id'));
        }

        if (state.thumbnailFile) {
            formData.append('thumbnail', state.thumbnailFile);
        } else if (!isUpdateMode) { // Auto-thumb only on create
            // Auto-generate validation
            try {
                // Ensure video is ready
                if (videoPreview.readyState >= 2) {
                    const timeToCapture = Math.min(1.0, videoPreview.duration); // Capture at 1s or end
                    videoPreview.currentTime = timeToCapture;

                    // Wait for seek
                    await new Promise(r => {
                        const onSeek = () => {
                            videoPreview.removeEventListener('seeked', onSeek);
                            r();
                        };
                        videoPreview.addEventListener('seeked', onSeek);
                    });

                    // Capture
                    canvas.width = videoPreview.videoWidth;
                    canvas.height = videoPreview.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

                    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
                    if (blob) {
                        const file = new File([blob], "auto_thumb.jpg", { type: "image/jpeg" });
                        formData.append('thumbnail', file);
                        console.log("Auto-generated thumbnail attached");
                    }
                }
            } catch (e) {
                console.warn("Auto-thumbnail failed", e);
            }
        }

        // UI Loading State
        const originalText = btnText;
        const icon = postBtn.querySelector('#post-btn-icon');

        postBtn.disabled = true;
        postBtn.querySelector('#post-btn-text').textContent = isUpdateMode ? "Updating..." : "Uploading...";
        icon.textContent = "progress_activity";
        icon.classList.add('animate-spin');

        try {
            const endpoint = isUpdateMode ? '/update_reel' : '/create_reel';
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success
                localStorage.removeItem('edit_reel_data'); // Clear edit state
                window.location.href = 'reels.html?uploaded=true';
            } else {
                throw new Error(data.message || 'Upload failed');
            }

        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
            // Reset Button
            postBtn.disabled = false;
            postBtn.querySelector('#post-btn-text').textContent = originalText;
            icon.textContent = state.isEditing ? "save" : "send";
            icon.classList.remove('animate-spin');
        }
    });

    discardBtn.addEventListener('click', () => {
        if (confirm("Discard this reel?")) {
            window.location.href = 'reels.html';
        }
    });

    // --- Helpers ---
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
});
