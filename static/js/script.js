document.addEventListener('DOMContentLoaded', function() {
    let audioUnlocked = false;
    function unlockAudio() {
        if (audioUnlocked) return;
        const soundIds = ['sound-click', 'sound-levelup', 'sound-complete', 'ambient-rain', 'ambient-forest', 'ambient-cafe'];
        let unlockedCount = 0;

        soundIds.forEach(id => {
            const sound = document.getElementById(id);
            if (sound) {
                const originalVolume = sound.volume;
                const originallyMuted = sound.muted;
                
                sound.volume = 0.001; // Play very quietly
                sound.muted = false;   // Ensure not muted for the play attempt
                
                // Attempt to play and then immediately pause and reset
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                        sound.volume = originalVolume;
                        sound.muted = originallyMuted;
                        unlockedCount++;
                        if (unlockedCount === 1) {
                            console.log('[Main Interface] Audio context unlocked by user interaction for at least one sound.');
                        }
                    }).catch(error => {
                        // Restore original state even if play failed (e.g. element not ready, but interaction occurred)
                        sound.volume = originalVolume;
                        sound.muted = originallyMuted;
                        // console.warn(`[Main Interface] Failed to play/unlock sound ${id} on interaction:`, error.name, error.message);
                    });
                } else {
                    // Fallback for browsers that don't return a promise (older)
                    try {
                        sound.pause();
                        sound.currentTime = 0;
                        sound.volume = originalVolume;
                        sound.muted = originallyMuted;
                    } catch (e) { /* ignore */ }
                }
            }
        });
        audioUnlocked = true; // Set to true after the first attempt
        // console.log('[Main Interface] unlockAudio function executed.');
        // Listeners are automatically removed due to { once: true }
    }

    // Add event listeners that will run only once
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true }); // Also unlock on keydown
    document.addEventListener('touchstart', unlockAudio, { once: true }); // For touch devices

    try {
        // Initialize Particles.js for ambient effect
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                "particles": {
                    "number": {
                        "value": 50,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        "value": "#ffffff"
                    },
                    "shape": {
                        "type": "circle"
                    },
                    "opacity": {
                        "value": 0.3,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 1,
                            "opacity_min": 0.1,
                            "sync": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 2,
                            "size_min": 0.1,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": false
                    },
                    "move": {
                        "enable": true,
                        "speed": 1,
                        "direction": "top",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": false
                        },
                        "onclick": {
                            "enable": false
                        }
                    }
                },
                "retina_detect": true
            });
        } else {
            console.warn("Particles.js is not loaded");
        }

        // Verify jQuery is loaded
        if (typeof $ === 'undefined') {
            console.error("jQuery is not loaded. Event listeners will not work properly.");
            useVanillaJS();
        } else {
            console.log("jQuery loaded successfully. Version:", $.fn.jquery);
            initializeWithJQuery();
        }
    } catch (error) {
        console.error("An error occurred in script.js:", error);
        // Use the global addNotification if available, otherwise fallback to alert
        if (typeof addNotification === 'function') {
            addNotification("Application Error", "Error initializing application.", "error");
        } else {
            alert("Error initializing application. Some features may be impaired.");
        }
    }
    
    // Vanilla JS fallback if jQuery is not loaded
    function useVanillaJS() {
        const materialsYesButton = document.getElementById('materials-yes');
        if (materialsYesButton) {
            materialsYesButton.addEventListener('click', function() {
                console.log("Materials Yes button clicked (vanilla JS)");
                const modal = document.getElementById('checklist-modal');
                modal.style.display = 'none';
                const workspace = document.getElementById('workspace');
                workspace.classList.remove('hidden');
                workspace.style.display = 'block';
                console.log("Checklist completed, showing workspace (vanilla JS)");
            });
        } else {
            console.error("Materials Yes button not found in DOM (vanilla JS)");
        }
    }
    
    // jQuery initialization
    function initializeWithJQuery() {
        // Sound effect function
        function playSound(id) {
            const sound = document.getElementById(id);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.warn("Error playing sound:", e));
            }
        }
        
        // Notification system (local to script.js for main page)
        // THIS LOCAL SYSTEM IS NOW DEPRECATED in favor of the global notifications.js system.
        // Calls to showNotification below will be changed to addNotification.
        // The UI for toasts will be handled by notifications.js's showToastNotification.
        /*
        let notifications = [];
        let unreadCount = 0;

        function showNotification(title, content, type = 'info') { // THIS IS THE LOCAL ONE
            // ... implementation ... // This will be replaced by addNotification or showToastNotification
        }
        */
        // Helper to decide if a notification is purely for local toast or should be global
        function showUIMessage(title, content, type = 'info', makeGlobal = false) {
            if (makeGlobal) {
                if (typeof addNotification === 'function') {
                    addNotification(title, content, type);
                } else {
                    console.warn("addNotification (global) not available. Falling back to local toast for:", title);
                    if(typeof showToastNotification === 'function') showToastNotification(`${title}: ${content}`, type);
                    else alert(`${title}: ${content}`);
                }
            } else {
                if(typeof showToastNotification === 'function') { // From notifications.js
                    showToastNotification(`${title}: ${content}`, type);
                } else {
                    alert(`${title}: ${content}`); // Absolute fallback
                }
            }
        }

        function createToastContainer() {
            let container = document.getElementById('notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'notification-container';
                container.className = 'fixed top-24 right-4 z-50 flex flex-col space-y-2 items-end';
                document.body.appendChild(container);
            }
            return container;
        }

        function updateNotificationBadge() {
            const badge = document.getElementById('notification-badge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }

        function renderNotifications() {
            const list = document.getElementById('notification-list');
            if (!list) return;
            
            list.innerHTML = notifications.map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-header">
                        <span class="notification-title">${notification.title}</span>
                        <span class="notification-time">${formatTimestamp(notification.timestamp)}</span>
                    </div>
                    <div class="notification-content">${notification.content}</div>
                </div>
            `).join('');
             if (notifications.length === 0) {
                list.innerHTML = '<div class="notification-item"><div class="notification-content text-center text-gray-400">No notifications yet.</div></div>';
            }
        }

        function clearNotifications() {
            notifications = [];
            unreadCount = 0;
            updateNotificationBadge();
            renderNotifications();
        }

        function markAllAsRead() {
            notifications.forEach(notification => notification.read = true);
            unreadCount = 0;
            updateNotificationBadge();
            renderNotifications();
        }

        function formatTimestamp(date) {
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) { return 'Just now'; }
            else if (diff < 3600000) { const m = Math.floor(diff / 60000); return `${m}m ago`; }
            else if (diff < 86400000) { const h = Math.floor(diff / 3600000); return `${h}h ago`; }
            else { return date.toLocaleDateString(); }
        }

        // Auto grow text box function
        window.autoGrowTextBox = function(element) {
            element.style.height = "auto"; 
            element.style.height = (element.scrollHeight) + "px";
            // Cap the height
            if (parseInt(element.style.height) > 150) {
                element.style.height = "150px";
                element.style.overflowY = "auto";
            } else {
                element.style.overflowY = "hidden";
            }
        };

        // Scroll to bottom of response area
        function scrollToBottom() {
            const responseArea = document.getElementById("responseArea");
            if (responseArea) {
                responseArea.scrollTop = responseArea.scrollHeight;
            }
        }

        // Tab Navigation System
        $(".nav-tab").click(function() {
            const targetPanel = $(this).data("target");
            
            // Update active tab
            $(".nav-tab").removeClass("active");
            $(this).addClass("active");
            
            // Show target panel
            $(".content-panel").removeClass("active");
            $("#" + targetPanel).addClass("active");
            
            playSound("sound-click");
        });

        // Checklist Logic
        if (typeof $ !== 'undefined' && $("#checklist-modal").length) {
            $("#checklist-modal").show();
            console.log("Checklist modal should be visible");

            $("#social-yes").click(function() {
                console.log("Social Yes button clicked");
                $("#checklist-step-1").hide();
                $("#checklist-step-2").show();
                console.log("Proceeding to checklist step 2");
                playSound("sound-click");
            });

            $("#social-no").click(function() {
                console.log("Social No button clicked");
                // showNotification("Please turn off all social media notifications to proceed.", "warning");
                showUIMessage("Study Prep", "Please turn off all social media notifications to proceed.", "warning", true);
                playSound("sound-click");
            });

            if ($("#materials-yes").length) {
                $("#materials-yes").click(function() {
                    console.log("Materials Yes button clicked (jQuery)");
                    $("#checklist-modal").hide();
                    $("#workspace").removeClass("hidden").show();
                    console.log("Checklist completed, showing workspace (jQuery)");
                    // showNotification("Ready to study! Timer is set for 25 minutes.", "success");
                    showUIMessage("Study Prep", "Ready to study! Timer is set for 25 minutes.", "success", true);
                    playSound("sound-click");
                    // Play rain sound if selected
                    if ($("#ambient-sound-select").val() === "rain") {
                        $("#ambient-rain")[0].play().catch(e => console.warn("Error playing sound:", e));
                    }
                });
            } else {
                // If checklist modal exists but not materials-yes, show workspace anyway
                $("#workspace").removeClass("hidden").show();
            }

            $("#materials-no").click(function() {
                console.log("Materials No button clicked");
                // showNotification("Please gather your study materials and a water bottle.", "warning");
                showUIMessage("Study Prep", "Please gather your study materials and a water bottle.", "warning", true);
                playSound("sound-click");
            });
        } else {
            // If checklist modal does not exist, show workspace by default
            $("#workspace").removeClass("hidden").show();
        }

        // Rules Modal Logic with fixed position in the middle
        $("#rules-button, #rules-button-mobile").click(function() {
            $("#rules-modal").show().css({"display": "flex", "align-items": "center", "justify-content": "center"});
            playSound("sound-click");
        });

        $("#close-rules").click(function() {
            $("#rules-modal").hide();
            playSound("sound-click");
        });
        
        // Close modal when clicking outside
        $(document).on('click', '#rules-modal', function(e) {
            if ($(e.target).is('#rules-modal')) {
                $("#rules-modal").hide();
            }
        });
        
        // Focus Mode
        $("#focus-mode, #focus-mode-mobile").click(function() {
            $("body").toggleClass("focus-mode");
            const isFocusMode = $("body").hasClass("focus-mode");
            
            if (isFocusMode) {
                $("#focus-overlay").removeClass("hidden").css("display", "flex");
                $(this).html('<i class="fas fa-eye-slash"></i>');
                $(this).find(".tooltiptext").text("Exit Focus Mode");
                // showNotification("Focus mode enabled", "info");
                showUIMessage("Focus Mode", "Focus mode enabled.", "info", true);
            } else {
                $("#focus-overlay").addClass("hidden");
                $(this).html('<i class="fas fa-eye"></i>');
                $(this).find(".tooltiptext").text("Enter Focus Mode");
                // showNotification("Focus mode disabled", "info");
                showUIMessage("Focus Mode", "Focus mode disabled.", "info", true);
            }
            
            playSound("sound-click");
        });
        
        // Exit Focus Mode Button (use event delegation for robustness)
        $(document).off('click', '#exit-focus').on('click', '#exit-focus', function() {
            console.log("Exit focus mode button clicked");
            $("body").removeClass("focus-mode");
            $("#focus-overlay").css("display", "none");
            $("#focus-mode, #focus-mode-mobile").html('<i class="fas fa-eye"></i>');
            $("#focus-mode, #focus-mode-mobile").find(".tooltiptext").text("Enter Focus Mode");
            // showNotification("Focus mode disabled", "info");
            showUIMessage("Focus Mode", "Focus mode disabled.", "info", true);
            playSound("sound-click");
        });

        // Daphinix Chat Logic
        // Load previous chat history if exists
        async function loadChatHistory() {
            try {
                const response = await fetch('/api/chat_history');
                if (!response.ok) {
                    throw new Error('Failed to load chat history');
                }
                
                const messages = await response.json();
                if (messages && messages.length > 0) {
                    $("#responseArea").empty();
                    messages.forEach(msg => {
                        if (msg.role === 'user') {
                            $("#responseArea").append(`
                                <div class="message user-message">
                                    <div class="message-content">
                                        <div class="message-header">
                                            <span class="message-sender">You</span>
                                        </div>
                                        <div class="message-text">${msg.content}</div>
                                    </div>
                                </div>
                            `);
                        } else if (msg.role === 'assistant') {
                            $("#responseArea").append(`
                                <div class="message bot-message">
                                    <div class="message-content">
                                        <div class="message-header">
                                            <span class="message-sender">Daphinix</span>
                                        </div>
                                        <div class="message-text">${marked.parse(msg.content)}</div>
                                    </div>
                                </div>
                            `);
                        }
                    });
                    scrollToBottom();
                    if (window.MathJax) {
                        MathJax.typesetPromise();
                    }
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                // showNotification('Error loading chat history', 'error'); // Local toast is fine here
                showUIMessage('Chat Error', 'Error loading chat history', 'error', false);
            }
        }

        // Save chat history to Firebase
        async function saveChatHistory(messages) {
            try {
                const response = await fetch('/api/chat_history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messages)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save chat history');
                }
            } catch (error) {
                console.error('Error saving chat history:', error);
            }
        }

        // Update the sendDaphinixMessage function
        window.sendDaphinixMessage = async function() {
            const inputEl = document.getElementById("myInput");
            const inputVal = inputEl.value.trim();
            const fileInput = document.getElementById("image-upload");
            const hasImage = fileInput && fileInput.files && fileInput.files.length > 0;
            
            if (inputVal === "" && !hasImage) {
                // showNotification("Please type a question or upload an image", "warning"); // Local toast fine
                showUIMessage("Daphinix AI", "Please type a question or upload an image.", "warning", false);
                return;
            }
            
            // Add user message to the chat
            $("#responseArea").append(`
                <div class="message user-message">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">You</span>
                        </div>
                        <div class="message-text">${inputVal}</div>
                        ${hasImage ? '<div class="mt-2"><img src="' + URL.createObjectURL(fileInput.files[0]) + '" class="max-w-full rounded" style="max-height: 200px;"></div>' : ''}
                    </div>
                </div>
            `);
            
            // Get current chat history
            const response = await fetch('/api/chat_history');
            const messages = await response.json();
            messages.push({ role: 'user', content: inputVal });
            
            // Clear input
            inputEl.value = '';
            inputEl.style.height = 'auto';
            
            // Show typing indicator
            $("#responseArea").append(`
                <div class="message bot-message typing-message">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">Daphinix</span>
                        </div>
                        <div class="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `);
            
            scrollToBottom();
            
            try {
            // Send to appropriate API endpoint based on whether there's an image
            if (hasImage) {
                const formData = new FormData();
                formData.append('message', inputVal);
                formData.append('image', fileInput.files[0]);
                    formData.append('memory', JSON.stringify(messages));
                
                    const response = await fetch('/api/chat_with_image', {
                    method: 'POST',
                    body: formData
                    });
                    const data = await response.json();
                    
                    handleDaphinixResponse(data.response);
                    messages.push({ role: 'assistant', content: data.response });
                    await saveChatHistory(messages);
                    
                    // Reset file input
                    fileInput.value = '';
                    $("#image-preview-container").hide();
                    $("#image-preview").attr("src", "");
            } else {
                    const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                        body: JSON.stringify({ message: inputVal, memory: messages }),
                    });
                    const data = await response.json();
                    
                    handleDaphinixResponse(data.response);
                    messages.push({ role: 'assistant', content: data.response });
                    await saveChatHistory(messages);
                }
            } catch (error) {
                    console.error('Error:', error);
                    handleDaphinixError();
            }
        };
        
        // Handle Daphinix response
        function handleDaphinixResponse(responseText) {
            $(".typing-message").remove();
            const botMessage = document.createElement('div');
            botMessage.className = 'bot-message message';
            botMessage.innerHTML = `
                <div class="message-header">Daphinix</div>
                    <div class="message-content">
                    <div class="message-text">${marked.parse(responseText)}</div>
                        </div>
            `;
            $("#responseArea").append(botMessage);
            scrollToBottom();
            playSound("sound-click");
            // Render LaTeX
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
            $("#image-preview-container").hide();
            $("#image-preview").attr("src", "");
        }
        
        // Handle Daphinix error
        function handleDaphinixError() {
            // Remove typing indicator
            $(".typing-message").remove();
            
            // Add error message
            $("#responseArea").append(`
                <div class="message bot-message">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">Daphinix</span>
                        </div>
                        <div class="message-text">
                            <p>I'm sorry, I encountered an error processing your request. Please try again later.</p>
                        </div>
                    </div>
                </div>
            `);
            
            scrollToBottom();
            // showNotification("Error connecting to Daphinix", "error"); // Local toast fine
            showUIMessage("Daphinix AI", "Error connecting to Daphinix.", "error", false);
            $("#image-preview-container").hide();
            $("#image-preview").attr("src", "");
        }
        
        // Send message when clicking send button
        $("#send-button").click(function() {
            sendDaphinixMessage();
        });
        
        // Send message when pressing Enter (without Shift)
        $("#myInput").keydown(function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendDaphinixMessage();
            }
        });
        
        // Auto-grow text area as user types
        $("#myInput").on("input", function() {
            autoGrowTextBox(this);
        });
        
        // Update the clear chat button
        $("#clear-chat").click(async function() {
            $("#responseArea").empty();
            await saveChatHistory([]);
            // showNotification("Chat history cleared", "info"); // Local toast fine
            showUIMessage("Daphinix AI", "Chat history cleared.", "info", false);
            playSound("sound-click");
        });

        // Load chat history when the page loads
        $(document).ready(function() {
            // loadUserData(); // Now called by loadUserDataAndInitNotifications
            loadChatHistory();
        });

        // Pomodoro Timer Logic
        let isRunning = false;
        let isPaused = false;
        let isWorkSession = true;
        let timeLeft = parseInt($("#work-duration").val()) * 60;
        let totalTime = timeLeft; 
        let workDuration = parseInt($("#work-duration").val());
        let breakDuration = parseInt($("#break-duration").val());
        let timerInterval;

        function updateTimerDisplay() {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            $("#timer-display").text(timeString);
            $("#focus-timer").text(timeString);
            
            // Update document title
            document.title = `${timeString} - FocusOS`;
        }

        function startTimer() {
            if (!isRunning) {
                isRunning = true;
                isPaused = false;
                $("#start-timer").addClass("hidden");
                $("#pause-timer").removeClass("hidden");
                
                totalTime = isWorkSession ? workDuration * 60 : breakDuration * 60;
                
                if (timeLeft === totalTime) {
                    // showNotification(isWorkSession ? "Work session started" : "Break started", "info");
                    showUIMessage("Timer", isWorkSession ? "Work session started." : "Break started.", "info", true);
                } else {
                    // showNotification("Timer resumed", "info");
                    showUIMessage("Timer", "Timer resumed.", "info", true);
                }
                
                timerInterval = setInterval(function() {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateTimerDisplay();
                    } else {
                        clearInterval(timerInterval);
                        handleTimerComplete();
                    }
                }, 1000);
            }
        }
        
        function pauseTimer() {
            if (isRunning && !isPaused) {
                isRunning = false;
                isPaused = true;
                clearInterval(timerInterval);
                
                $("#pause-timer").addClass("hidden");
                $("#start-timer").removeClass("hidden");
                
                // showNotification("Timer paused", "info");
                showUIMessage("Timer", "Timer paused.", "info", true);
            }
        }
        
        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            workDuration = parseInt($("#work-duration").val());
            breakDuration = parseInt($("#break-duration").val());
            
            timeLeft = isWorkSession ? workDuration * 60 : breakDuration * 60;
            totalTime = timeLeft;
            
            $("#start-timer").removeClass("hidden");
            $("#pause-timer").addClass("hidden");
            
            updateTimerDisplay();
            // showNotification("Timer reset", "info");
            showUIMessage("Timer", "Timer reset.", "info", true);
        }
        
        function switchSession() {
            isWorkSession = !isWorkSession;
            
            if (isWorkSession) {
                $("#session-label").text("Work Session");
                timeLeft = workDuration * 60;
            } else {
                $("#session-label").text("Break");
                timeLeft = breakDuration * 60;
            }
            
            totalTime = timeLeft;
            updateTimerDisplay();
        }
        
        function handleTimerComplete() {
            playSound("sound-complete");
            
            if (isWorkSession) {
                // Work session completed
                // showNotification("Work session completed! Take a break.", "success");
                showUIMessage("Timer", "Work session completed! Take a break.", "success", true);
                
                // Update user progress
                const workMinutes = workDuration;
                const currentXP = parseInt($("#xp").text());
                const currentLevel = parseInt($("#level").text());
                const totalMinutes = parseInt($("#total-time").text()) + workMinutes;
                
                // XP points: 10 per minute worked
                const xpEarned = workMinutes * 10;
                const newXP = currentXP + xpEarned;
                
                // Check if level up (XP needed for next level = current level * 100)
                const xpForNextLevel = currentLevel * 100;
                
                if (newXP >= xpForNextLevel) {
                    // Level up!
                    const newLevel = currentLevel + 1;
                    const excessXP = newXP - xpForNextLevel;
                    
                    $("#level").text(newLevel);
                    $("#xp").text(excessXP);
                    $("#xp-needed").text(newLevel * 100);
                    
                    // Reset progress bar with new level
                    const newProgressPercentage = (excessXP / (newLevel * 100)) * 100;
                    $("#xp-progress").css("width", newProgressPercentage + "%");
                    
                    // Celebration effects
                    playSound("sound-levelup");
                    createConfetti();
                    // showNotification(`Level Up! You're now level ${newLevel}`, "success", 5000);
                    showUIMessage("Progress", `Level Up! You're now level ${newLevel}`, "success", true);
                } else {
                    // Just update XP
                    $("#xp").text(newXP);
                    const progressPercentage = (newXP / xpForNextLevel) * 100;
                    $("#xp-progress").css("width", progressPercentage + "%");
                    // showNotification(`+${xpEarned} XP earned!`, "success");
                    showUIMessage("Progress", `+${xpEarned} XP earned!`, "success", true);
                }
                
                // Update total time
                $("#total-time").text(totalMinutes);
                $("#stats-total-time").text(totalMinutes + " min");
                
                // Check for badges
                checkForBadges(totalMinutes);
                
                // Add to session history
                addSessionToHistory(workMinutes);
                
                // Update session count
                const totalSessions = parseInt($("#stats-total-sessions").text() || "0") + 1;
                $("#stats-total-sessions").text(totalSessions);
                
                // Update streak
                updateStreak();
            } else {
                // Break completed
                // showNotification("Break completed! Ready for work?", "success");
                showUIMessage("Timer", "Break completed! Ready for work?", "success", true);
            }
            
            // Switch to the other session type
            switchSession();
            
            // Auto-start next session
            startTimer();
        }
        
        function checkForBadges(totalMinutes) {
            // Badge thresholds
            const bronzeBadge = 60; // 1 hour
            const silverBadge = 300; // 5 hours
            const goldBadge = 1000; // 16+ hours
            
            let badgeEarned = null;
            
            if (totalMinutes >= goldBadge && !$("#badge-gold").length) {
                badgeEarned = {
                    id: "badge-gold",
                    name: "Master",
                    class: "gold",
                    icon: "fa-crown"
                };
            } else if (totalMinutes >= silverBadge && !$("#badge-silver").length) {
                badgeEarned = {
                    id: "badge-silver",
                    name: "Scholar",
                    class: "silver",
                    icon: "fa-award"
                };
            } else if (totalMinutes >= bronzeBadge && !$("#badge-bronze").length) {
                badgeEarned = {
                    id: "badge-bronze",
                    name: "Beginner",
                    class: "bronze",
                    icon: "fa-medal"
                };
            }
            
            if (badgeEarned) {
                const badge = $(`
                    <div id="${badgeEarned.id}" class="badge ${badgeEarned.class} tooltip">
                        <i class="fas ${badgeEarned.icon}"></i>
                        <span class="tooltiptext">${badgeEarned.name}</span>
                    </div>
                `);
                
                $("#badges-list").append(badge);
                
                // Update total badge count
                const totalBadges = $("#badges-list .badge").length;
                $("#stats-total-badges").text(totalBadges);
                
                // Celebration and notification
                playSound("sound-levelup");
                // showNotification(`New Badge: ${badgeEarned.name}!`, "success", 5000);
                showUIMessage("Progress", `New Badge: ${badgeEarned.name}!`, "success", true);
                setTimeout(createConfetti, 500);
            }
        }
        
        function addSessionToHistory(duration) {
            const date = new Date();
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create the new session entry
            const sessionEntry = $(`
                <div class="session-entry bg-gray-700 bg-opacity-50 p-2 rounded mb-2 flex justify-between items-center">
                    <div>
                        <span class="text-xs text-gray-400">${dateStr} at ${timeStr}</span>
                        <p class="text-sm">${duration} min study session</p>
                    </div>
                    <div class="text-purple-300"><i class="fas fa-check-circle"></i></div>
                </div>
            `);
            
            // Remove "no sessions" message if it exists
            $("#recent-sessions .text-center").remove();
            
            // Add new session to the top
            $("#recent-sessions").prepend(sessionEntry);
            
            // Limit to last 10 sessions
            const sessionEntries = $("#recent-sessions .session-entry");
            if (sessionEntries.length > 10) {
                sessionEntries.last().remove();
            }
        }
        
        function updateStreak() {
            // Get current streak
            const currentStreak = parseInt($("#streak").text());
            
            // Check if already studied today (to avoid multiple streak increases)
            const today = new Date().toLocaleDateString();
            const lastStudyDay = localStorage.getItem("lastStudyDay");
            
            if (lastStudyDay !== today) {
                // New study day!
                const newStreak = currentStreak + 1;
                $("#streak").text(newStreak);
                
                if (newStreak % 7 === 0) {
                    // Weekly streak milestone
                    // showNotification(`${newStreak} day streak! Keep it up!`, "success", 5000);
                    showUIMessage("Progress", `${newStreak} day streak! Keep it up!`, "success", true);
                    setTimeout(createConfetti, 500);
                }
                
                // Save today as last study day
                localStorage.setItem("lastStudyDay", today);
            }
        }
        
        // Timer control button event handlers
        $("#start-timer").click(function() {
            startTimer();
            playSound("sound-click");
        });
        
        $("#pause-timer").click(function() {
            pauseTimer();
            playSound("sound-click");
        });
        
        $("#reset-timer").click(function() {
            resetTimer();
            playSound("sound-click");
        });
        
        // Environment settings
        
        // Background selection
        $("#background-select").change(function() {
            const selection = $(this).val();
            const container = $("#background-container");
            
            container.empty();  // Clear existing content
            container.append('<div class="overlay"></div>');
            
            if (selection === "video1") {
                container.append(`
                    <video id="background-video" autoplay loop muted class="w-full h-full object-cover">
                        <source src="/static/assets/videos/forest_stream.webm" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `);
            } else if (selection === "video2") {
                // Google Drive blocks direct streaming, show a message or fallback
                container.append('<div class="w-full h-full flex items-center justify-center text-white text-xl bg-black bg-opacity-70">Rainy Window video cannot be streamed directly. Please download and place it in /static/assets/videos/rainy_window.mp4</div>');
            } else if (selection === "video3") {
                container.append(`
                    <video id="background-video" autoplay loop muted class="w-full h-full object-cover">
                        <source src="/static/assets/videos/library_ambience.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `);
                setTimeout(function() {
                    const vid = document.getElementById('background-video');
                    if (vid) vid.playbackRate = 0.5;
                }, 100);
            } else if (selection === "image1") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/starry_night.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image2") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/ocean_waves.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image3") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/cozy_cafe.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image4") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/night_city.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image5") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/minimalist_desk.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image6") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/bookshelf.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image7") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/coffee_notebook.jpg" class="w-full h-full object-cover">
                `);
            } else if (selection === "image8") {
                container.append(`
                    <img id="background-image" src="/static/assets/images/abstract_gradient.jpg" class="w-full h-full object-cover">
                `);
            }
            
            playSound("sound-click");
            // showNotification("Background updated", "info");
            showUIMessage("Environment", "Background updated.", "info", true);
        });
        
        // Ambient sound selection
        $("#ambient-sound-select").change(function() {
            const selection = $(this).val();
            
            // Stop all ambient sounds first
            $("#ambient-rain")[0].pause();
            $("#ambient-forest")[0].pause();
            $("#ambient-cafe")[0].pause();
            
            if (selection === "rain") {
                $("#ambient-rain")[0].play().catch(e => console.warn("Error playing sound:", e));
            } else if (selection === "forest") {
                $("#ambient-forest")[0].play().catch(e => console.warn("Error playing sound:", e));
            } else if (selection === "cafe") {
                $("#ambient-cafe")[0].play().catch(e => console.warn("Error playing sound:", e));
            }
            
            playSound("sound-click");
            
            if (selection !== "none") {
                // showNotification(`${$(this).find("option:selected").text()} sound enabled`, "info");
                showUIMessage("Environment", `${$(this).find("option:selected").text()} sound enabled.`, "info", true);
            } else {
                // showNotification("Ambient sound disabled", "info");
                showUIMessage("Environment", "Ambient sound disabled.", "info", true);
            }
        });
        
        // Volume control for ambient sounds
        $("#volume-slider").on("input", function() {
            const volume = $(this).val() / 100;
            $("#ambient-rain")[0].volume = volume;
            $("#ambient-forest")[0].volume = volume;
            $("#ambient-cafe")[0].volume = volume;
        });
        
        // Toggle sound on/off
        $("#sound-toggle").click(function() {
            const allAudio = $("audio");
            const isMuted = $(this).data("muted") || false;
            
            if (isMuted) {
                allAudio.prop("muted", false);
                $(this).data("muted", false);
                $(this).html('<i class="fas fa-volume-up"></i>');
                // showNotification("Sound enabled", "info");
                showUIMessage("Settings", "Sound enabled.", "info", true);
            } else {
                allAudio.prop("muted", true);
                $(this).data("muted", true);
                $(this).html('<i class="fas fa-volume-mute"></i>');
                // showNotification("Sound disabled", "info");
                showUIMessage("Settings", "Sound disabled.", "info", true);
            }
        });
        
        // Day/Night mode toggle
        $("#day-night-toggle").change(function() {
            if ($(this).is(":checked")) {
                $("body").addClass("night-mode");
                // showNotification("Night mode enabled", "info");
                showUIMessage("Settings", "Night mode enabled.", "info", true);
            } else {
                $("body").removeClass("night-mode");
                // showNotification("Day mode enabled", "info");
                showUIMessage("Settings", "Day mode enabled.", "info", true);
            }
            
            playSound("sound-click");
        });
        
        // Particles toggle
        $("#particles-toggle").change(function() {
            if ($(this).is(":checked")) {
                $("#particles-js").show();
                // showNotification("Particles enabled", "info");
                showUIMessage("Settings", "Particles enabled.", "info", true);
            } else {
                $("#particles-js").hide();
                // showNotification("Particles disabled", "info");
                showUIMessage("Settings", "Particles disabled.", "info", true);
            }
            
            playSound("sound-click");
        });
        
        // Initialize timer display
        updateTimerDisplay();
        
        // Load saved user data if available
        // loadUserData(); // We will call this after Firebase auth
        
        // Save user data every minute
        setInterval(saveUserData, 60000);
        
        async function loadUserDataAndInitNotifications() {
            try {
                console.log("[Main Interface] Waiting for Firebase Auth to be ready...");
                const firebaseUser = await window.firebaseAuthReady; // Wait for Firebase Auth
                console.log("[Main Interface] Firebase Auth ready. Firebase User:", firebaseUser ? firebaseUser.uid : "null");

                const response = await fetch('/api/user_data');
                if (!response.ok) {
                    throw new Error('Failed to load user data from API');
                }
                
                const userDataFromAPI = await response.json();
                if (userDataFromAPI.error) {
                    console.error("[Main Interface] Error fetching user data from API:", userDataFromAPI.error);
                    // showNotification("User Data Error: Could not load your user details.", "error"); // Uses local toast
                    showUIMessage("User Data", "Error: Could not load your user details.", "error", false); // Keep as local toast
                    return; // Stop if API user data fails
                }

                const apiUserId = userDataFromAPI.username; // This should be Firebase UID
                const displayUsername = userDataFromAPI.display_username || apiUserId || 'User';
                console.log(`[Main Interface] API UserID: ${apiUserId}, Display Name: ${displayUsername}`);

                // Update UI with userDataFromAPI
                if (userDataFromAPI.progress) {
                    $("#level").text(userDataFromAPI.progress.level || 1);
                    $("#xp").text(userDataFromAPI.progress.xp || 0);
                    $("#xp-needed").text((userDataFromAPI.progress.level || 1) * 100);
                    $("#total-time").text(userDataFromAPI.progress.total_time || 0);
                    $("#streak").text(userDataFromAPI.progress.streak || 0);
                    
                    $("#stats-total-time").text((userDataFromAPI.progress.total_time || 0) + " min");
                    $("#stats-total-sessions").text(userDataFromAPI.progress.sessions || 0);
                    
                    const progressPercentage = ((userDataFromAPI.progress.xp || 0) / ((userDataFromAPI.progress.level || 1) * 100)) * 100;
                    $("#xp-progress").css("width", progressPercentage + "%");
                    
                    $("#badges-list").empty();
                    if (userDataFromAPI.progress.badges) {
                        if (userDataFromAPI.progress.badges.bronze) {
                            $("#badges-list").append(`
                                <div id="badge-bronze" class="badge bronze tooltip">
                                    <i class="fas fa-medal"></i>
                                    <span class="tooltiptext">Beginner</span>
                                </div>
                            `);
                        }
                        if (userDataFromAPI.progress.badges.silver) {
                            $("#badges-list").append(`
                                <div id="badge-silver" class="badge silver tooltip">
                                    <i class="fas fa-award"></i>
                                    <span class="tooltiptext">Scholar</span>
                                </div>
                            `);
                        }
                        if (userDataFromAPI.progress.badges.gold) {
                            $("#badges-list").append(`
                                <div id="badge-gold" class="badge gold tooltip">
                                    <i class="fas fa-crown"></i>
                                    <span class="tooltiptext">Master</span>
                                </div>
                            `);
                        }
                    }
                    $("#stats-total-badges").text($("#badges-list .badge").length);
                }


                // Now initialize the global notification system
                if (firebaseUser && firebaseUser.uid === apiUserId) {
                    console.log(`[Main Interface] Firebase Auth Confirmed: UID ${firebaseUser.uid} matches API UserID ${apiUserId}. Attempting to initialize notifications...`);
                    if (typeof initializeGlobalNotificationSystem === 'function') {
                        initializeGlobalNotificationSystem(firebaseUser.uid); // Initialize with actual Firebase UID
                        console.log("[Main Interface] Called initializeGlobalNotificationSystem.");

                        // Add a welcome notification if it's the main page, for example
                         console.log("[Main Interface] Checking for 'mainPageWelcomeNotificationSent' in sessionStorage. Value:", sessionStorage.getItem('mainPageWelcomeNotificationSent'));
                         if (!sessionStorage.getItem('mainPageWelcomeNotificationSent')) {
                             console.log("[Main Interface] 'mainPageWelcomeNotificationSent' NOT found in sessionStorage. Proceeding to add Welcome Back notification.");
                             console.log("[Main Interface] Checking if typeof addNotification === 'function'. Is it?", typeof addNotification === 'function');
                             if (typeof addNotification === 'function') { // This is the global addNotification from notifications.js
                                 console.log(`[Main Interface] Attempting to call addNotification for Welcome Back. Display name: ${displayUsername}`);
                                 addNotification('Welcome Back!', `Hello ${displayUsername}, ready for a productive session?`, 'success');
                                 console.log("[Main Interface] addNotification for Welcome Back CALLED.");
                             } else {
                                 console.error("[Main Interface] addNotification function is NOT defined when trying to send Welcome Back message.");
                             }
                             sessionStorage.setItem('mainPageWelcomeNotificationSent', 'true');
                             console.log("[Main Interface] 'mainPageWelcomeNotificationSent' SET in sessionStorage.");
                         } else {
                             console.log("[Main Interface] 'mainPageWelcomeNotificationSent' IS found in sessionStorage. Skipping Welcome Back notification.");
                         }

                    } else {
                        console.error("[Main Interface] initializeGlobalNotificationSystem is not defined. CRITICAL: Ensure notifications.js is loaded.");
                        // showNotification("Notification System Error", "error"); // Uses local toast
                        showUIMessage("System Error", "Notification system error.", "error", false); // Keep as local toast
                    }
                } else {
                     if (!firebaseUser) {
                        console.warn(`[Main Interface] Firebase user is NULL when trying to set up for API UserID: ${apiUserId}. Global notifications likely disabled.`);
                        // showNotification("Client not signed into Firebase. Global notifications may not work.", "error"); // Uses local toast
                        showUIMessage("Auth Error", "Client not signed into Firebase. Global notifications may not work.", "error", false); // Keep as local toast
                    } else { // firebaseUser.uid !== apiUserId
                        console.error(`[Main Interface] CRITICAL UID MISMATCH on main page: API UserID is ${apiUserId}, but Firebase Auth UID is ${firebaseUser.uid}. Global notifications disabled.`);
                        // showNotification("User identity mismatch. Please re-login. Global notifications disabled.", "error"); // Uses local toast
                        showUIMessage("Auth Error", "User identity mismatch. Please re-login. Global notifications disabled.", "error", false); // Keep as local toast
                    }
                }

            } catch (error) {
                console.error("[Main Interface] Error in loadUserDataAndInitNotifications:", error);
                // showNotification("Error loading user data or initializing notifications.", "error"); // Uses local toast
                showUIMessage("System Error", "Error loading user data or initializing notifications.", "error", false); // Keep as local toast
            }
        }
        
        // Call the new function that handles both user data loading and notification init
        loadUserDataAndInitNotifications();
        
        async function loadUserData() {
            // This function is now effectively replaced by loadUserDataAndInitNotifications
            // but we keep a shell or parts of it if other parts of the script call it directly,
            // or refactor those calls. For now, let's assume loadUserDataAndInitNotifications is the primary.
            // The UI update part is now inside loadUserDataAndInitNotifications.
            console.warn("[Main Interface] loadUserData() was called, but logic is now in loadUserDataAndInitNotifications().");
        }
        
        async function saveUserData() {
            try {
                const userData = {
                    level: parseInt($("#level").text()),
                    xp: parseInt($("#xp").text()),
                    total_time: parseInt($("#total-time").text()),
                    streak: parseInt($("#streak").text()),
                    sessions: parseInt($("#stats-total-sessions").text()),
                    badges: {
                        bronze: $("#badge-bronze").length > 0,
                        silver: $("#badge-silver").length > 0,
                        gold: $("#badge-gold").length > 0
                    },
                    sessionHistory: []
                };
                
                const response = await fetch('/api/user_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save user data');
                }
            } catch (error) {
                console.error("Error saving user data:", error);
            }
        }

        // Set default ambient sound to rain and play it
        $("#ambient-sound-select").val("rain").trigger("change");

        function getDaphinixMemory() {
            // Returns an array of {role: 'user'|'assistant', content: '...'}
            const memory = JSON.parse(localStorage.getItem('daphinixMemory') || '[]');
            return memory;
        }

        function addToDaphinixMemory(role, content) {
            let memory = getDaphinixMemory();
            memory.push({ role, content });
            // Keep only the last 5 exchanges (10 messages)
            if (memory.length > 10) memory = memory.slice(memory.length - 10);
            localStorage.setItem('daphinixMemory', JSON.stringify(memory));
        }

        function clearDaphinixMemory() {
            localStorage.removeItem('daphinixMemory');
        }

        $(document).one('click', function() {
            if ($("#ambient-sound-select").val() === "rain") {
                $("#ambient-rain")[0].play().catch(e => {});
            }
        });

        // --- Enhanced To-Do List Feature ---
        async function loadTodoList() {
            try {
                const response = await fetch('/api/todo_list');
                if (!response.ok) {
                    throw new Error('Failed to load todo list');
                }
                
                const todos = await response.json();
                const tbody = $('#todo-table-body');
                tbody.empty();
                
                if (todos && todos.length > 0) {
                    todos.forEach(todo => {
                        const row = `
                            <tr data-task-id="${todo.timestamp}">
                                <td class="py-2 px-4">${todo.name}</td>
                                <td class="py-2 px-4">${new Date(todo.startDate).toLocaleString()}</td>
                                <td class="py-2 px-4">${new Date(todo.dueDate).toLocaleString()}</td>
                                <td class="py-2 px-4">
                                    <select class="todo-status bg-gray-800 text-white rounded px-2 py-1">
                                        <option value="Not started" ${todo.status === 'Not started' ? 'selected' : ''}>Not started</option>
                                        <option value="In progress" ${todo.status === 'In progress' ? 'selected' : ''}>In progress</option>
                                        <option value="Done" ${todo.status === 'Done' ? 'selected' : ''}>Done</option>
                                    </select>
                                    ${todo.completedAt ? `<br><small class="text-gray-400">Completed: ${new Date(todo.completedAt).toLocaleString()}</small>` : ''}
                                </td>
                                <td class="py-2 px-4">${todo.priority}</td>
                                <td class="py-2 px-4">${todo.effort}</td>
                                <td class="py-2 px-4">${todo.desc || ''}</td>
                                <td class="py-2 px-4">
                                    <button class="delete-todo text-red-500 hover:text-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        tbody.append(row);
                    });
                } else {
                    tbody.append('<tr><td colspan="8" class="text-center py-4">No tasks found</td></tr>');
                }
            } catch (error) {
                console.error('Error loading todo list:', error);
                // showNotification('Error loading tasks. Please refresh the page.', 'error'); // Local toast
                showUIMessage('To-Do Error', 'Error loading tasks. Please refresh.', 'error', false);
            }
        }

        // Modal open/close logic
        $(document).on('click', '#open-todo-modal', function() {
            $('#todo-modal').removeClass('hidden').show();
        });
        $(document).on('click', '#close-todo-modal', function() {
            $('#todo-modal').addClass('hidden').hide();
            $('#todo-form')[0].reset();
        });

        // Add task logic
        $(document).on('submit', '#todo-form', async function(e) {
            e.preventDefault();
            const name = $('#todo-input-name').val().trim();
            const startDate = $('#todo-input-start').val();
            const dueDate = $('#todo-input-due').val();
            const status = $('#todo-input-status').val();
            const priority = $('#todo-input-priority').val();
            const effort = $('#todo-input-effort').val();
            const desc = $('#todo-input-desc').val().trim();
            
            if (name && startDate && dueDate) {
                try {
                    // Get current todo list
                    const response = await fetch('/api/todo_list');
                    const todos = await response.json();
                    
                    // Add new task with UTC timestamps
                    const task = {
                        name,
                        startDate: new Date(startDate).toISOString(),
                        dueDate: new Date(dueDate).toISOString(),
                        status,
                        priority,
                        effort,
                        desc,
                        timestamp: new Date().toISOString(),
                        completedAt: status === 'Done' ? new Date().toISOString() : null
                    };
                    
                    const updatedTodos = [...(todos || []), task];
                    
                    // Save updated todo list
                    const saveResponse = await fetch('/api/todo_list', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedTodos)
                    });
                    
                    if (saveResponse.ok) {
                        await loadTodoList();
                        $('#todo-modal').addClass('hidden').hide();
                        $('#todo-form')[0].reset();
                        // showNotification('Task added!', 'success');
                        showUIMessage('To-Do', 'Task added!', 'success', true);
                    } else {
                        throw new Error('Failed to save task');
                    }
            } catch (error) {
                    console.error('Error:', error);
                    // showNotification('Error adding task. Please try again.', 'error'); // Local toast
                    showUIMessage('To-Do Error', 'Error adding task. Please try again.', 'error', false);
                }
            }
        });

        // Add status change handler
        $(document).on('change', '.todo-status', async function() {
            const taskId = $(this).closest('tr').data('task-id');
            const newStatus = $(this).val();
            
            try {
                const response = await fetch('/api/todo_list');
                const todos = await response.json();
                
                const updatedTodos = todos.map(todo => {
                    if (todo.timestamp === taskId) {
                        return {
                            ...todo,
                            status: newStatus,
                            completedAt: newStatus === 'Done' ? new Date().toISOString() : null
                        };
                    }
                    return todo;
                });
                
                const saveResponse = await fetch('/api/todo_list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTodos)
                });
                
                if (saveResponse.ok) {
                    await loadTodoList();
                    // showNotification('Task status updated!', 'success');
                    showUIMessage('To-Do', 'Task status updated!', 'success', true);
                } else {
                    throw new Error('Failed to update task status');
                }
            } catch (error) {
                console.error('Error:', error);
                // showNotification('Error updating task status. Please try again.', 'error'); // Local toast
                showUIMessage('To-Do Error', 'Error updating task status. Please try again.', 'error', false);
            }
        });

        // Delete task logic
        $(document).on('click', '.delete-todo', async function() {
            const taskId = $(this).closest('tr').data('task-id');
            
            try {
                // Get current todo list
                const response = await fetch('/api/todo_list');
                const todos = await response.json();
                
                // Filter out the deleted task
                const updatedTodos = todos.filter(todo => todo.timestamp !== taskId);
                
                // Save updated todo list
                const saveResponse = await fetch('/api/todo_list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTodos)
                });
                
                if (saveResponse.ok) {
                    await loadTodoList(); // Reload the todo list
                    // showNotification('Task deleted!', 'info');
                    showUIMessage('To-Do', 'Task deleted!', 'info', true);
                } else {
                    throw new Error('Failed to delete task');
                }
            } catch (error) {
                console.error('Error:', error);
                // showNotification('Error deleting task. Please try again.', 'error'); // Local toast
                showUIMessage('To-Do Error', 'Error deleting task. Please try again.', 'error', false);
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            loadTodoList();
            // Reminder check every minute
            setInterval(function() {
                const todoList = JSON.parse(localStorage.getItem('todoList') || '[]');
                const now = new Date();
                todoList.forEach((task, idx) => {
                    if (task.status !== 'Done' && task.dueDate) {
                        const due = new Date(task.dueDate);
                        if (now >= due && !task.reminded) {
                            // Play notification sound
                            playSound('sound-complete'); // This is a local sound, addNotification will play its own
                            // showNotification(`Task due: ${task.name}`, 'warning', 7000);
                            showUIMessage('To-Do Reminder', `Task due: ${task.name}`, 'warning', true);
                            // Mark as reminded
                            task.reminded = true;
                        }
                    }
                });
                localStorage.setItem('todoList', JSON.stringify(todoList));
            }, 60000);
        });

        // Load data when the page loads
        $(document).ready(function() {
            // loadUserData(); // Now called by loadUserDataAndInitNotifications
            loadTodoList();
            loadChatHistory();
        });

        // Save user data periodically
        setInterval(saveUserData, 30000); // Save every 30 seconds

        // Initialize notification system
            const bell = document.getElementById('notification-bell');
            const panel = document.getElementById('notification-panel');
            
            if (bell && panel) {
                bell.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent click from bubbling to document
                    panel.classList.toggle('hidden');
                    if (!panel.classList.contains('hidden')) {
                        // markAllAsRead(); // OLD: Was local script.js notifications
                        if (typeof markAllCurrentUserNotificationsAsRead === 'function') {
                            markAllCurrentUserNotificationsAsRead();
                            console.log("[Main Interface] Called global markAllCurrentUserNotificationsAsRead.");
                        } else {
                            console.error("[Main Interface] markAllCurrentUserNotificationsAsRead is not defined.");
                        }
                    }
                });
                
            // Clear notifications button specific to this panel
                const clearBtn = document.getElementById('clear-notifications');
                if (clearBtn) {
                    clearBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent click from bubbling to document
                    // clearNotifications(); // OLD: Was local script.js notifications
                    if (typeof clearAllCurrentUserNotifications === 'function') {
                        clearAllCurrentUserNotifications();
                        console.log("[Main Interface] Called global clearAllCurrentUserNotifications.");
                    } else {
                        console.error("[Main Interface] clearAllCurrentUserNotifications is not defined.");
                    }
                    });
                }
            }
            
        // Global click listener to close notification panel if open and click is outside
        document.addEventListener('click', function(e) {
            if (panel && !panel.classList.contains('hidden')) { // If panel is open
                // Check if the click was outside the panel AND outside the bell
                if (!panel.contains(e.target) && !bell.contains(e.target)) {
                    panel.classList.add('hidden');
                }
            }
        });
        
        // Add welcome notification using the local showNotification
            // showNotification('Welcome!', 'Welcome to FocusOS. Start your productive journey!', 'info'); // This is a local toast, can be kept or removed
    }
});