/**
 * Game Events Integration for Pinigėnai
 * This file provides integration between the main game and chat/statistics systems
 */

// Game event dispatcher
window.PinigenaiGameEvents = {
    // Track coins earned
    coinsEarned: function(amount, gameName = null) {
        const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        const username = userData.username || 'Žaidėjas';
        
        // Update user's coin count
        userData.coins = (userData.coins || 0) + amount;
        localStorage.setItem('pinigenai_user', JSON.stringify(userData));
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('pinigenai-game-event', {
            detail: {
                type: 'coinsEarned',
                data: {
                    amount: amount,
                    username: username,
                    game: gameName,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    },

    // Track game start
    gameStarted: function(gameName) {
        const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        const username = userData.username || 'Žaidėjas';
        
        window.dispatchEvent(new CustomEvent('pinigenai-game-event', {
            detail: {
                type: 'gameStarted',
                data: {
                    gameName: gameName,
                    username: username,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    },

    // Track game completion
    gameCompleted: function(gameName, score = null, time = null) {
        const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        const username = userData.username || 'Žaidėjas';
        
        // Update games played count
        userData.gamesPlayed = (userData.gamesPlayed || 0) + 1;
        localStorage.setItem('pinigenai_user', JSON.stringify(userData));
        
        window.dispatchEvent(new CustomEvent('pinigenai-game-event', {
            detail: {
                type: 'gameCompleted',
                data: {
                    gameName: gameName,
                    username: username,
                    score: score,
                    time: time,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    },

    // Track achievements
    achievementUnlocked: function(achievementName, description = null) {
        const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        const username = userData.username || 'Žaidėjas';
        
        // Add achievement to user data
        if (!userData.achievements) userData.achievements = [];
        userData.achievements.push({
            name: achievementName,
            description: description,
            unlockedAt: new Date().toISOString()
        });
        localStorage.setItem('pinigenai_user', JSON.stringify(userData));
        
        window.dispatchEvent(new CustomEvent('pinigenai-game-event', {
            detail: {
                type: 'achievement',
                data: {
                    achievementName: achievementName,
                    description: description,
                    username: username,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    },

    // Track level completion
    levelCompleted: function(gameName, level, score = null) {
        const userData = JSON.parse(localStorage.getItem('pinigenai_user') || '{}');
        const username = userData.username || 'Žaidėjas';
        
        window.dispatchEvent(new CustomEvent('pinigenai-game-event', {
            detail: {
                type: 'levelComplete',
                data: {
                    gameName: gameName,
                    level: level,
                    score: score,
                    username: username,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    }
};

// Auto-integrate with existing game functions if they exist
document.addEventListener('DOMContentLoaded', function() {
    // Monitor for coin changes in the UI
    const monitorCoins = () => {
        const coinElements = document.querySelectorAll('.coin-display, .money-display, #coins, #money');
        coinElements.forEach(element => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const newValue = parseInt(element.textContent.replace(/\D/g, '')) || 0;
                        const oldValue = parseInt(element.getAttribute('data-last-value')) || 0;
                        
                        if (newValue > oldValue) {
                            const earned = newValue - oldValue;
                            window.PinigenaiGameEvents.coinsEarned(earned);
                        }
                        
                        element.setAttribute('data-last-value', newValue);
                    }
                });
            });
            
            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true
            });
        });
    };

    // Start monitoring after a delay to ensure page is loaded
    setTimeout(monitorCoins, 2000);

    // Create manual trigger buttons for testing (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            const testPanel = document.createElement('div');
            testPanel.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 10px;
                font-size: 12px;
                z-index: 9999;
                display: flex;
                gap: 10px;
            `;
            testPanel.innerHTML = `
                <span>Test Events:</span>
                <button onclick="window.PinigenaiGameEvents.coinsEarned(5, 'Test')" style="padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">+5 Coins</button>
                <button onclick="window.PinigenaiGameEvents.gameCompleted('Test Game', 100, '2:30')" style="padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Game Complete</button>
                <button onclick="window.PinigenaiGameEvents.achievementUnlocked('Test Achievement', 'You tested the system!')" style="padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Achievement</button>
                <button onclick="this.parentElement.remove()" style="padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; background: red; color: white;">✕</button>
            `;
            document.body.appendChild(testPanel);
        }, 3000);
    }
});

// Export for global access
window.dispatchGameEvent = window.PinigenaiGameEvents;