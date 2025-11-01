/**
 * Pinigėnai Chat System
 * Real-time messaging for connected players
 * Built with safety and moderation for children
 */

class PinigenaiChatSystem {
    constructor() {
        this.isEnabled = true; // Always enabled now
        this.currentUser = null;
        this.messages = [];
        this.onlineUsers = new Map();
        this.bannedWords = [
            // Lithuanian inappropriate words filter
            'kvailys', 'durnius', 'idiotas', 'kvaila', 'durna'
        ];
        this.maxMessageLength = 100;
        this.chatContainer = null;
        this.isMinimized = false;
        this.gameEventListeners = [];
        
        this.init();
    }

    init() {
        this.createChatUI();
        this.setupEventListeners();
        this.loadUserSession();
        this.setupGameEventListeners();
        
        // Simulate WebSocket connection (in real app would be actual WebSocket)
        this.simulateConnection();
    }

    createChatUI() {
        // Create chat container
        const chatHTML = `
            <div id="chat-system" class="chat-container ${this.isMinimized ? 'minimized' : ''}">
                <div class="chat-header">
                    <div class="chat-title">
                        <span class="chat-icon">💬</span>
                        <span>Pinigėnai Chat</span>
                        <span class="online-count" id="online-count">0 online</span>
                    </div>
                    <div class="chat-controls">
                        <button id="chat-minimize" class="chat-btn">−</button>
                        <button id="chat-close" class="chat-btn">×</button>
                    </div>
                </div>
                
                <div class="chat-body">
                    <div class="online-users" id="online-users">
                        <div class="online-users-header">
                            <span class="users-icon">👥</span>
                            <span>Žaidėjai online</span>
                        </div>
                        <div class="users-list" id="users-list"></div>
                    </div>
                    
                    <div class="chat-messages" id="chat-messages">
                        <div class="welcome-message">
                            <div class="system-message">
                                🌟 Sveiki atvykę į Pinigėnai pokalbių kambarį!<br>
                                📝 Prisijunkite, kad galėtumėte rašyti žinutes!<br>
                                💬 Stebėkite žaidimo naujienas ir kitų žaidėjų veiklą!
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <div class="input-container">
                        <input type="text" 
                               id="chat-input" 
                               placeholder="Rašykite žinutę..." 
                               maxlength="${this.maxMessageLength}"
                               autocomplete="off">
                        <button id="send-message" class="send-btn">📤</button>
                    </div>
                    <div class="quick-messages">
                        <button class="quick-msg-btn" data-msg="Labas! 👋">Labas!</button>
                        <button class="quick-msg-btn" data-msg="Ačiū! 😊">Ačiū!</button>
                        <button class="quick-msg-btn" data-msg="Pagalbos! 🤔">Pagalba?</button>
                        <button class="quick-msg-btn" data-msg="Gerai žaidžiate! 🌟">Gerai!</button>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.chatContainer = document.getElementById('chat-system');
    }

    setupEventListeners() {
        // Chat controls
        document.getElementById('chat-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        document.getElementById('chat-close').addEventListener('click', () => {
            this.toggleChat();
        });

        // Message sending
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Quick messages
        document.querySelectorAll('.quick-msg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-msg');
                this.sendQuickMessage(message);
            });
        });

        // Character counter
        chatInput.addEventListener('input', () => {
            const remaining = this.maxMessageLength - chatInput.value.length;
            // Could add character counter display here
        });
    }

    loadUserSession() {
        const currentUser = localStorage.getItem('pinigenai_current_user');
        const users = JSON.parse(localStorage.getItem('pinigenai_users') || '{}');
        
        if (currentUser && users[currentUser]) {
            // Load user data from pinigenai_user or create from users data
            let userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
            
            // If pinigenai_user doesn't exist or is incomplete, recreate it
            if (!userData.username || userData.username !== currentUser) {
                userData = {
                    username: currentUser,
                    email: users[currentUser].email || '',
                    avatar: userData.avatar || '👤',
                    level: userData.level || 1,
                    coins: userData.coins || 0,
                    gamesPlayed: userData.gamesPlayed || 0,
                    achievements: userData.achievements || [],
                    loginTime: new Date().toISOString(),
                    created: users[currentUser].created || new Date().toISOString()
                };
                localStorage.setItem('pinigenai_user', JSON.stringify(userData));
            }
            
            this.currentUser = userData;
            this.isEnabled = true;
            this.joinChat();
        } else {
            // Show guest mode
            this.currentUser = {
                username: 'Svečias',
                avatar: '👤',
                level: 0
            };
            this.isEnabled = true;
            this.joinChat();
        }
    }

    joinChat() {
        if (!this.currentUser) return;

        // Add user to online list
        this.onlineUsers.set(this.currentUser.username, {
            username: this.currentUser.username,
            avatar: this.currentUser.avatar || '👤',
            joinTime: new Date(),
            level: this.currentUser.level || 1
        });

        this.updateOnlineUsers();
        this.addSystemMessage(`${this.currentUser.username} prisijungė prie pokalbio! 👋`);
        
        // Simulate other users joining
        this.simulateOtherUsers();
    }

    simulateOtherUsers() {
        // Add some demo users for testing
        const demoUsers = [
            { username: 'Linas_123', avatar: '🧑', level: 3 },
            { username: 'Maja_Cool', avatar: '👩', level: 2 },
            { username: 'Tomas_Pro', avatar: '🧒', level: 5 },
            { username: 'Ema_Star', avatar: '👧', level: 4 }
        ];

        demoUsers.forEach((user, index) => {
            setTimeout(() => {
                this.onlineUsers.set(user.username, {
                    ...user,
                    joinTime: new Date()
                });
                this.updateOnlineUsers();
                
                // Simulate some chat messages
                if (index === 0) {
                    setTimeout(() => {
                        this.receiveMessage(user.username, 'Labas visiems! Kas žaidžia fermą? 🚜');
                    }, 2000);
                } else if (index === 1) {
                    setTimeout(() => {
                        this.receiveMessage(user.username, 'Aš jau surinkau 50 monetų! 💰');
                    }, 4000);
                }
            }, index * 1000);
        });
    }

    updateOnlineUsers() {
        const usersList = document.getElementById('users-list');
        const onlineCount = document.getElementById('online-count');
        
        usersList.innerHTML = '';
        
        this.onlineUsers.forEach((user, username) => {
            const userElement = document.createElement('div');
            userElement.className = 'online-user';
            userElement.innerHTML = `
                <span class="user-avatar">${user.avatar}</span>
                <span class="user-name">${username}</span>
                <span class="user-level">Lvl ${user.level}</span>
            `;
            usersList.appendChild(userElement);
        });

        onlineCount.textContent = `${this.onlineUsers.size} online`;
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;
        
        if (!this.currentUser || this.currentUser.username === 'Svečias') {
            this.addSystemMessage('⚠️ Prisijunkite, kad galėtumėte rašyti žinutes!');
            input.value = '';
            return;
        }

        if (this.isMessageAppropriate(message)) {
            this.addMessage(this.currentUser.username, message, 'own');
            input.value = '';
            
            // Simulate message being sent to server
            this.broadcastMessage(this.currentUser.username, message);
        } else {
            this.showModerationWarning();
        }
    }

    sendQuickMessage(message) {
        if (!this.currentUser || this.currentUser.username === 'Svečias') {
            this.addSystemMessage('⚠️ Prisijunkite, kad galėtumėte rašyti žinutes!');
            return;
        }
        
        this.addMessage(this.currentUser.username, message, 'own');
        this.broadcastMessage(this.currentUser.username, message);
    }

    receiveMessage(username, message) {
        this.addMessage(username, message, 'other');
    }

    addMessage(username, message, type = 'other') {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        const timestamp = new Date().toLocaleTimeString('lt-LT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const user = this.onlineUsers.get(username);
        const avatar = user ? user.avatar : '👤';

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-avatar">${avatar}</span>
                <span class="message-username">${username}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Limit message history
        const messages = messagesContainer.querySelectorAll('.chat-message');
        if (messages.length > 100) {
            messages[0].remove();
        }
    }

    addSystemMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.innerHTML = `🤖 ${message}`;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    isMessageAppropriate(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for banned words
        for (const word of this.bannedWords) {
            if (lowerMessage.includes(word.toLowerCase())) {
                return false;
            }
        }

        // Check for excessive caps
        const capsCount = (message.match(/[A-ZĄČĘĖĮŠŲŪŽ]/g) || []).length;
        if (capsCount > message.length * 0.7 && message.length > 10) {
            return false;
        }

        // Check for spam (repeated characters)
        const repeatedPattern = /(.)\1{4,}/;
        if (repeatedPattern.test(message)) {
            return false;
        }

        return true;
    }

    showModerationWarning() {
        this.addSystemMessage('⚠️ Jūsų žinutė neatitinka bendruomenės taisyklių. Būkite mandagūs!');
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.chatContainer.classList.toggle('minimized', this.isMinimized);
        
        const minimizeBtn = document.getElementById('chat-minimize');
        minimizeBtn.textContent = this.isMinimized ? '+' : '−';
    }

    toggleChat() {
        this.isEnabled = !this.isEnabled;
        this.chatContainer.style.display = this.isEnabled ? 'flex' : 'none';
        
        // Could add a chat toggle button to the main UI
        this.updateChatToggleButton();
    }

    updateChatToggleButton() {
        // This would update a button in the main game UI
        const toggleBtn = document.getElementById('chat-toggle-btn');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.isEnabled ? '💬 Paslėpti chat' : '💬 Rodyti chat';
        }
    }

    simulateConnection() {
        // Simulate WebSocket connection status
        setTimeout(() => {
            if (this.isEnabled) {
                this.addSystemMessage('✅ Prisijungta prie chat serverio');
            }
        }, 1000);
    }

    broadcastMessage(username, message) {
        // In real implementation, this would send to WebSocket server
        // For now, just simulate some responses
        setTimeout(() => {
            if (Math.random() > 0.7) {
                const responses = [
                    'Puiku! 😊',
                    'Sutinku! 👍',
                    'Taip, ir aš taip manau! 🤔',
                    'Ačiū už patarimą! 🙏'
                ];
                const randomUser = Array.from(this.onlineUsers.keys())[
                    Math.floor(Math.random() * this.onlineUsers.size)
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                if (randomUser !== this.currentUser?.username) {
                    this.receiveMessage(randomUser, randomResponse);
                }
            }
        }, Math.random() * 3000 + 1000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for game integration
    sendGameNotification(event, data) {
        switch(event) {
            case 'levelComplete':
                this.addSystemMessage(`🎉 ${this.currentUser?.username} užbaigė ${data.gameName} lygį!`);
                break;
            case 'achievement':
                this.addSystemMessage(`🏆 ${this.currentUser?.username} gavo pasiekimą: ${data.achievementName}!`);
                break;
            case 'coinsEarned':
                this.addSystemMessage(`💰 ${this.currentUser?.username} uždirbo ${data.amount} monetų ${data.game ? 'žaidime ' + data.game : ''}!`);
                break;
            case 'gameStarted':
                this.addSystemMessage(`🎮 ${this.currentUser?.username} pradėjo žaidimą "${data.gameName}"!`);
                break;
            case 'gameCompleted':
                this.addSystemMessage(`✅ ${this.currentUser?.username} sėkmingai užbaigė žaidimą "${data.gameName}" už ${data.time || 'nežinomą'} laiką!`);
                break;
        }
    }

    setupGameEventListeners() {
        // Listen for global game events
        window.addEventListener('pinigenai-game-event', (event) => {
            const { type, data } = event.detail;
            this.sendGameNotification(type, data);
        });

        // Monitor localStorage changes for coin updates
        let lastCoinCount = 0;
        setInterval(() => {
            if (this.currentUser) {
                const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
                const currentCoins = userData.coins || 0;
                
                if (currentCoins > lastCoinCount && lastCoinCount > 0) {
                    const earned = currentCoins - lastCoinCount;
                    this.sendGameNotification('coinsEarned', { amount: earned });
                }
                lastCoinCount = currentCoins;
            }
        }, 2000);
    }

    destroy() {
        if (this.chatContainer) {
            this.chatContainer.remove();
        }
    }
}

// Initialize chat system when page loads (always visible)
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new PinigenaiChatSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinigenaiChatSystem;
}