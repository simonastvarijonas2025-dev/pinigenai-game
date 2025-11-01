/**
 * Pinigėnai Statistics Panel
 * Real-time game statistics display
 */

class PinigenaiStatsPanel {
    constructor() {
        this.stats = {
            totalUsers: 0,
            onlineUsers: 0,
            totalCoins: 0,
            gamesPlayed: 0,
            topPlayer: null,
            dailyActiveUsers: 0
        };
        
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.createStatsUI();
        this.loadInitialStats();
        this.startAutoUpdate();
        this.setupEventListeners();
    }

    createStatsUI() {
        const statsHTML = `
            <div id="stats-panel" class="stats-panel">
                <div class="stats-header">
                    <div class="stats-title">
                        <span class="stats-icon">📊</span>
                        <span>Pinigėnai Statistika</span>
                    </div>
                    <button id="stats-minimize" class="stats-btn">−</button>
                </div>
                
                <div class="stats-body">
                    <div class="stat-item">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-label">Registruoti vartotojai</div>
                            <div class="stat-value" id="total-users">0</div>
                        </div>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon">🟢</div>
                        <div class="stat-content">
                            <div class="stat-label">Šiuo metu žaidžia</div>
                            <div class="stat-value" id="online-users">0</div>
                        </div>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-label">Iš viso monetų</div>
                            <div class="stat-value" id="total-coins">0</div>
                        </div>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-content">
                            <div class="stat-label">Žaidimų sužaista</div>
                            <div class="stat-value" id="games-played">0</div>
                        </div>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-content">
                            <div class="stat-label">Šiandienos čempionas</div>
                            <div class="stat-value" id="top-player">Nėra</div>
                        </div>
                    </div>

                    <div class="stat-item">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-label">Aktyvūs šiandien</div>
                            <div class="stat-value" id="daily-active">0</div>
                        </div>
                    </div>

                    <div class="live-activity">
                        <div class="activity-header">
                            <span class="activity-icon">⚡</span>
                            <span>Paskutiniai įvykiai</span>
                        </div>
                        <div class="activity-feed" id="activity-feed">
                            <div class="activity-item">
                                <span class="activity-time">Šiandien</span>
                                <span class="activity-text">Pinigėnai sistema paleista! 🚀</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', statsHTML);
        this.statsContainer = document.getElementById('stats-panel');
    }

    setupEventListeners() {
        document.getElementById('stats-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Listen for game events
        window.addEventListener('pinigenai-game-event', (event) => {
            this.handleGameEvent(event.detail);
        });

        // Listen for user actions
        window.addEventListener('pinigenai-user-action', (event) => {
            this.handleUserAction(event.detail);
        });
    }

    loadInitialStats() {
        // Load stats from localStorage
        const users = JSON.parse(localStorage.getItem('pinigenai_users') || '{}');
        const currentUser = localStorage.getItem('pinigenai_current_user');
        
        this.stats.totalUsers = Object.keys(users).length;
        this.stats.onlineUsers = currentUser ? 1 : 0; // Simplified for demo
        
        // Calculate total coins from all users
        let totalCoins = 0;
        Object.values(users).forEach(user => {
            totalCoins += user.coins || 0;
        });
        
        // Also add coins from current user data
        const currentUserData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        if (currentUserData.coins) {
            totalCoins += currentUserData.coins;
        }
        
        this.stats.totalCoins = totalCoins;

        // Load other stats from localStorage
        const gameStats = JSON.parse(localStorage.getItem('pinigenai_game_stats') || '{}');
        this.stats.gamesPlayed = gameStats.totalGames || 0;
        this.stats.dailyActiveUsers = gameStats.dailyActive || (currentUser ? 1 : 0);
        this.stats.topPlayer = gameStats.topPlayer || currentUser || 'Nėra';

        // If user is returning, show welcome back activity
        if (currentUser) {
            setTimeout(() => {
                this.addActivity(`🔄 ${currentUser} grįžo žaisti!`);
            }, 1000);
        }

        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('total-users').textContent = this.formatNumber(this.stats.totalUsers);
        document.getElementById('online-users').textContent = this.formatNumber(this.stats.onlineUsers);
        document.getElementById('total-coins').textContent = this.formatNumber(this.stats.totalCoins);
        document.getElementById('games-played').textContent = this.formatNumber(this.stats.gamesPlayed);
        document.getElementById('top-player').textContent = this.stats.topPlayer;
        document.getElementById('daily-active').textContent = this.formatNumber(this.stats.dailyActiveUsers);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    handleGameEvent(eventData) {
        const { type, data } = eventData;
        
        switch(type) {
            case 'coinsEarned':
                this.stats.totalCoins += data.amount;
                this.addActivity(`💰 ${data.username || 'Žaidėjas'} uždirbo ${data.amount} monetų!`);
                break;
                
            case 'gameCompleted':
                this.stats.gamesPlayed++;
                this.addActivity(`🎯 ${data.username || 'Žaidėjas'} užbaigė "${data.gameName}"!`);
                break;
                
            case 'achievement':
                this.addActivity(`🏆 ${data.username || 'Žaidėjas'} gavo pasiekimą!`);
                break;
                
            case 'userJoined':
                this.stats.onlineUsers++;
                this.addActivity(`👋 ${data.username} prisijungė!`);
                break;
                
            case 'userLeft':
                this.stats.onlineUsers = Math.max(0, this.stats.onlineUsers - 1);
                this.addActivity(`👋 ${data.username} atsijungė!`);
                break;
        }
        
        this.updateStatsDisplay();
        this.saveStats();
    }

    handleUserAction(actionData) {
        const { type, data } = actionData;
        
        switch(type) {
            case 'register':
                this.stats.totalUsers++;
                this.stats.onlineUsers++;
                this.stats.dailyActiveUsers++;
                this.addActivity(`🎉 Naujas žaidėjas ${data.username} prisijungė!`);
                break;
                
            case 'login':
                this.stats.onlineUsers++;
                this.addActivity(`🔄 ${data.username} grįžo žaisti!`);
                break;
        }
        
        this.updateStatsDisplay();
        this.saveStats();
    }

    addActivity(text) {
        const activityFeed = document.getElementById('activity-feed');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item new-activity';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('lt-LT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        activityItem.innerHTML = `
            <span class="activity-time">${timeString}</span>
            <span class="activity-text">${text}</span>
        `;
        
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Remove old activities (keep last 10)
        const activities = activityFeed.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
        
        // Animate new activity
        setTimeout(() => {
            activityItem.classList.remove('new-activity');
        }, 500);
    }

    saveStats() {
        const gameStats = {
            totalGames: this.stats.gamesPlayed,
            dailyActive: this.stats.dailyActiveUsers,
            topPlayer: this.stats.topPlayer,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('pinigenai_game_stats', JSON.stringify(gameStats));
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.simulateRandomActivity();
            this.updateOnlineUserCount();
        }, 10000); // Update every 10 seconds
    }

    simulateRandomActivity() {
        // Simulate some random activity for demo purposes
        const activities = [
            '🎮 Sistema automatiškai tikrina žaidimų statusą...',
            '📊 Statistika atnaujinta!',
            '🔄 Serveris veikia sklandžiai!',
            '💾 Duomenys saugomi...'
        ];
        
        if (Math.random() > 0.7) { // 30% chance every 10 seconds
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            this.addActivity(randomActivity);
        }
    }

    updateOnlineUserCount() {
        // Simulate slight variations in online users (for demo)
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        this.stats.onlineUsers = Math.max(1, this.stats.onlineUsers + variation);
        this.updateStatsDisplay();
    }

    toggleMinimize() {
        this.statsContainer.classList.toggle('minimized');
        const minimizeBtn = document.getElementById('stats-minimize');
        const isMinimized = this.statsContainer.classList.contains('minimized');
        minimizeBtn.textContent = isMinimized ? '+' : '−';
    }

    // Public methods for external integration
    incrementGamesPlayed() {
        this.stats.gamesPlayed++;
        this.updateStatsDisplay();
        this.saveStats();
    }

    addCoins(amount, username = 'Žaidėjas') {
        this.stats.totalCoins += amount;
        this.addActivity(`💰 ${username} uždirbo ${amount} monetų!`);
        this.updateStatsDisplay();
        this.saveStats();
    }

    setTopPlayer(username) {
        this.stats.topPlayer = username;
        this.addActivity(`👑 ${username} tapo šiandienos čempionu!`);
        this.updateStatsDisplay();
        this.saveStats();
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.statsContainer) {
            this.statsContainer.remove();
        }
    }
}

// Initialize statistics panel when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.statsPanel = new PinigenaiStatsPanel();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinigenaiStatsPanel;
}