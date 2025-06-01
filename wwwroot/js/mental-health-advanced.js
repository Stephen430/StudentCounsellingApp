// Advanced Mental Health Page JavaScript
class MentalHealthApp {
    constructor() {
        this.currentMood = null;
        this.breathingTimer = null;
        this.isBreathing = false;
        this.progressData = {
            dailyMeditation: 0,
            weeklyExercise: 0,
            sleepQuality: 0,
            stressLevel: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTabs();
        this.setupMoodTracker();
        this.initializeProgressTracking();
        this.setupSearch();
        this.loadUserProgress();
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Mood tracking
        document.querySelectorAll('.mood-option').forEach(mood => {
            mood.addEventListener('click', (e) => this.selectMood(e.target));
        });

        // Breathing exercise
        const breathingBtn = document.getElementById('startBreathing');
        if (breathingBtn) {
            breathingBtn.addEventListener('click', () => this.toggleBreathingExercise());
        }

        // Video players
        document.querySelectorAll('.video-player').forEach(player => {
            player.addEventListener('click', (e) => this.playVideo(e.target));
        });

        // Emergency contacts
        document.querySelectorAll('.emergency-contact').forEach(contact => {
            contact.addEventListener('click', (e) => this.handleEmergencyContact(e.target));
        });

        // Article tracking
        document.querySelectorAll('.article-link').forEach(link => {
            link.addEventListener('click', (e) => this.trackArticleView(e.target));
        });

        // Progress updates
        document.querySelectorAll('.progress-update').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateProgress(e.target));
        });
    }

    switchTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab content
        const selectedContent = document.getElementById(tabId);
        const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (selectedContent && selectedButton) {
            selectedContent.classList.add('active');
            selectedButton.classList.add('active');
            
            // Track tab interaction
            this.trackInteraction('tab_switch', { tab: tabId });
        }
    }

    setupMoodTracker() {
        const savedMood = localStorage.getItem('currentMood');
        if (savedMood) {
            const moodElement = document.querySelector(`.mood-option[data-mood="${savedMood}"]`);
            if (moodElement) {
                this.selectMood(moodElement);
            }
        }
    }

    selectMood(moodElement) {
        // Remove previous selections
        document.querySelectorAll('.mood-option').forEach(mood => {
            mood.classList.remove('selected');
        });

        // Select current mood
        moodElement.classList.add('selected');
        this.currentMood = moodElement.dataset.mood;
        
        // Save to localStorage
        localStorage.setItem('currentMood', this.currentMood);
        
        // Update mood display
        this.updateMoodFeedback();
        
        // Track mood selection
        this.trackInteraction('mood_selected', { mood: this.currentMood });
    }

    updateMoodFeedback() {
        const feedbackElement = document.getElementById('moodFeedback');
        if (!feedbackElement || !this.currentMood) return;

        const moodMessages = {
            'very-sad': {
                message: "I understand you're going through a difficult time. Remember, it's okay to seek help.",
                suggestions: ["Talk to a counselor", "Try deep breathing", "Reach out to a friend"],
                color: '#ef4444'
            },
            'sad': {
                message: "It's normal to have tough days. Small steps can make a big difference.",
                suggestions: ["Take a short walk", "Listen to calming music", "Practice mindfulness"],
                color: '#f97316'
            },
            'neutral': {
                message: "You're doing okay today. Consider some activities to boost your mood.",
                suggestions: ["Try a new hobby", "Connect with others", "Set a small goal"],
                color: '#eab308'
            },
            'happy': {
                message: "Great to see you're feeling positive! Keep up the good energy.",
                suggestions: ["Share your positivity", "Help someone else", "Practice gratitude"],
                color: '#22c55e'
            },
            'very-happy': {
                message: "Wonderful! Your positive energy is contagious. Keep spreading joy!",
                suggestions: ["Celebrate your wins", "Inspire others", "Maintain healthy habits"],
                color: '#10b981'
            }
        };

        const moodData = moodMessages[this.currentMood];
        if (moodData) {
            feedbackElement.innerHTML = `
                <div class="mood-feedback" style="border-left: 4px solid ${moodData.color}; padding: 1rem; margin: 1rem 0; background: rgba(255,255,255,0.9); border-radius: 8px;">
                    <p><strong>${moodData.message}</strong></p>
                    <div class="suggestions">
                        <h6>Suggested Activities:</h6>
                        <ul>
                            ${moodData.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            feedbackElement.style.display = 'block';
        }
    }

    toggleBreathingExercise() {
        const circle = document.getElementById('breathingCircle');
        const button = document.getElementById('startBreathing');
        
        if (!this.isBreathing) {
            this.startBreathingExercise(circle, button);
        } else {
            this.stopBreathingExercise(circle, button);
        }
    }

    startBreathingExercise(circle, button) {
        this.isBreathing = true;
        button.textContent = 'Stop Exercise';
        button.classList.add('btn-danger');
        button.classList.remove('btn-primary');
        
        let phase = 'inhale';
        let count = 4;
        
        const updateBreathing = () => {
            if (!this.isBreathing) return;
            
            circle.textContent = phase === 'inhale' ? `Breathe In (${count})` : `Breathe Out (${count})`;
            circle.className = `breathing-circle ${phase}`;
            
            count--;
            
            if (count === 0) {
                phase = phase === 'inhale' ? 'exhale' : 'inhale';
                count = 4;
            }
            
            setTimeout(updateBreathing, 1000);
        };
        
        updateBreathing();
        this.trackInteraction('breathing_started');
    }

    stopBreathingExercise(circle, button) {
        this.isBreathing = false;
        button.textContent = 'Start Breathing Exercise';
        button.classList.remove('btn-danger');
        button.classList.add('btn-primary');
        circle.textContent = 'Click to Start';
        circle.className = 'breathing-circle';
        
        this.trackInteraction('breathing_stopped');
    }

    playVideo(videoElement) {
        const videoId = videoElement.dataset.videoId;
        const videoTitle = videoElement.dataset.title;
        
        // Create modal for video playback
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h5>${videoTitle}</h5>
                    <button class="btn-close" onclick="this.closest('.video-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="video-placeholder">
                        <p>Video player would be embedded here</p>
                        <p>Video ID: ${videoId}</p>
                        <button class="btn btn-primary" onclick="this.closest('.video-modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.trackInteraction('video_played', { videoId, title: videoTitle });
    }

    handleEmergencyContact(contactElement) {
        const contactType = contactElement.dataset.type;
        const contactInfo = contactElement.dataset.contact;
        
        // Show confirmation modal
        const confirmed = confirm(`Do you want to contact ${contactType}?\n\n${contactInfo}\n\nThis will attempt to open your phone app or copy the number.`);
        
        if (confirmed) {
            // Try to open phone app or copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(contactInfo).then(() => {
                    this.showToast('Contact information copied to clipboard');
                });
            }
            
            this.trackInteraction('emergency_contact', { type: contactType });
        }
    }

    trackArticleView(articleElement) {
        const articleTitle = articleElement.querySelector('h5').textContent;
        const readTime = articleElement.querySelector('small').textContent;
        
        this.trackInteraction('article_viewed', { title: articleTitle, readTime });
        
        // Mark as read
        articleElement.classList.add('read');
        localStorage.setItem(`article_read_${articleTitle}`, Date.now());
    }

    updateProgress(buttonElement) {
        const progressType = buttonElement.dataset.type;
        const increment = parseInt(buttonElement.dataset.increment) || 10;
        
        if (this.progressData[progressType] !== undefined) {
            this.progressData[progressType] = Math.min(100, this.progressData[progressType] + increment);
            this.saveProgressData();
            this.renderProgress();
            this.showToast(`${progressType} progress updated!`);
        }
    }

    initializeProgressTracking() {
        this.renderProgress();
    }

    renderProgress() {
        const progressContainer = document.getElementById('progressTracker');
        if (!progressContainer) return;

        const progressItems = [
            { key: 'dailyMeditation', label: 'Daily Meditation', icon: '🧘‍♂️' },
            { key: 'weeklyExercise', label: 'Weekly Exercise', icon: '🏃‍♂️' },
            { key: 'sleepQuality', label: 'Sleep Quality', icon: '😴' },
            { key: 'stressLevel', label: 'Stress Management', icon: '😌' }
        ];

        progressContainer.innerHTML = progressItems.map(item => `
            <div class="progress-item">
                <span>${item.icon} ${item.label}</span>
                <div class="progress-bar-custom">
                    <div class="progress-fill" style="width: ${this.progressData[item.key]}%"></div>
                </div>
                <span>${this.progressData[item.key]}%</span>
                <button class="btn btn-sm btn-outline-primary progress-update ml-2" 
                        data-type="${item.key}" data-increment="10">+</button>
            </div>
        `).join('');

        // Re-attach event listeners for new buttons
        document.querySelectorAll('.progress-update').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateProgress(e.target));
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('resourceSearch');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterResources(e.target.value);
            }, 300);
        });
    }

    filterResources(searchTerm) {
        const articles = document.querySelectorAll('.article-item');
        const videos = document.querySelectorAll('.video-card');
        
        const term = searchTerm.toLowerCase();
        
        [...articles, ...videos].forEach(item => {
            const title = item.querySelector('h5')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            const matches = title.includes(term) || description.includes(term);
            item.style.display = matches ? 'block' : 'none';
        });
        
        this.trackInteraction('search_performed', { term: searchTerm });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        document.querySelectorAll('.mh-card, .resource-item').forEach(el => {
            observer.observe(el);
        });
    }

    loadUserProgress() {
        const saved = localStorage.getItem('mentalHealthProgress');
        if (saved) {
            this.progressData = { ...this.progressData, ...JSON.parse(saved) };
        }
    }

    saveProgressData() {
        localStorage.setItem('mentalHealthProgress', JSON.stringify(this.progressData));
    }

    trackInteraction(action, data = {}) {
        const interaction = {
            action,
            data,
            timestamp: new Date().toISOString(),
            page: 'mental-health'
        };
        
        // Save to localStorage for analytics
        const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
        interactions.push(interaction);
        localStorage.setItem('userInteractions', JSON.stringify(interactions));
        
        console.log('Interaction tracked:', interaction);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    generateDailyTip() {
        const tips = [
            "Take 5 deep breaths when feeling overwhelmed",
            "Practice gratitude by writing down 3 positive things",
            "Take a 10-minute walk outside",
            "Call or text someone you care about",
            "Listen to your favorite song",
            "Do some light stretching",
            "Drink a glass of water mindfully",
            "Practice the 5-4-3-2-1 grounding technique"
        ];
        
        const today = new Date().getDate();
        return tips[today % tips.length];
    }

    initializeDailyTip() {
        const tipElement = document.getElementById('dailyTip');
        if (tipElement) {
            tipElement.textContent = this.generateDailyTip();
        }
    }
}

// Initialize the Mental Health App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mentalHealthApp = new MentalHealthApp();
});

// Add CSS for toast notifications
const toastStyles = `
<style>
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.toast.show {
    transform: translateX(0);
}

.toast-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    gap: 1rem;
}

.toast-content button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
}

.video-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 12px;
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-body {
    padding: 2rem;
}

.video-placeholder {
    text-align: center;
    padding: 2rem;
    background: #f8fafc;
    border-radius: 8px;
}

.animate-in {
    animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', toastStyles);
