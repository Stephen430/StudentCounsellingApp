// Advanced Academic Support Page JavaScript
class AcademicSupportApp {
    constructor() {
        this.currentTab = 'resources';
        this.pomodoroTimer = null;
        this.pomodoroTimeLeft = 25 * 60; // 25 minutes
        this.isTimerRunning = false;
        this.studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        this.notes = JSON.parse(localStorage.getItem('academicNotes')) || [];
        this.goals = JSON.parse(localStorage.getItem('academicGoals')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTabs();
        this.setupSearch();
        this.initializeStudyTools();
        this.loadProgress();
        this.setupAnimations();
        this.initializeCalendar();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab-advanced').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('academicSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }

        // Filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.toggleFilter(tag);
            });
        });

        // Video players
        document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                this.playVideo(thumbnail);
            });
        });

        // Pomodoro timer
        this.setupPomodoroTimer();

        // Note taking
        this.setupNoteTaking();

        // Progress tracking
        this.setupProgressTracking();
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content-advanced').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab-advanced').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content
        const targetContent = document.getElementById(tabName);
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetContent && targetTab) {
            targetContent.classList.add('active');
            targetTab.classList.add('active');
            this.currentTab = tabName;

            // Trigger animations for the new tab
            this.animateTabContent(targetContent);
        }
    }

    animateTabContent(content) {
        const elements = content.querySelectorAll('.academic-card, .tool-card, .article-item');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    performSearch(query) {
        const articles = document.querySelectorAll('.article-item');
        const videos = document.querySelectorAll('.video-card-advanced');
        const tools = document.querySelectorAll('.tool-card');
        
        const searchTerm = query.toLowerCase();
        
        [...articles, ...videos, ...tools].forEach(item => {
            const title = item.querySelector('.article-title, .video-title, .tool-title')?.textContent.toLowerCase() || '';
            const description = item.querySelector('.article-description, .video-description, .tool-description')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'block';
                item.classList.add('fade-in-up');
            } else {
                item.style.display = 'none';
            }
        });

        // Show/hide no results message
        this.toggleNoResultsMessage(query);
    }

    toggleNoResultsMessage(query) {
        const visibleItems = document.querySelectorAll('.article-item:not([style*="display: none"]), .video-card-advanced:not([style*="display: none"]), .tool-card:not([style*="display: none"])');
        const noResultsDiv = document.getElementById('noResults');
        
        if (visibleItems.length === 0 && query.trim() !== '') {
            if (!noResultsDiv) {
                this.createNoResultsMessage();
            } else {
                noResultsDiv.style.display = 'block';
            }
        } else if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }

    createNoResultsMessage() {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'noResults';
        noResultsDiv.className = 'text-center py-5';
        noResultsDiv.innerHTML = `
            <div class="academic-card" style="max-width: 500px; margin: 0 auto;">
                <div class="card-body-advanced">
                    <i class="bi bi-search" style="font-size: 3rem; color: var(--academic-primary); margin-bottom: 1rem;"></i>
                    <h3>No Results Found</h3>
                    <p class="text-muted">Try adjusting your search terms or browse our categories.</p>
                    <button class="btn-advanced" onclick="academicApp.clearSearch()">Clear Search</button>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.academic-grid') || document.querySelector('.video-grid');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(noResultsDiv, container.nextSibling);
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('academicSearch');
        if (searchInput) {
            searchInput.value = '';
            this.performSearch('');
        }
    }

    toggleFilter(tag) {
        tag.classList.toggle('active');
        
        const activeFilters = Array.from(document.querySelectorAll('.filter-tag.active'))
            .map(t => t.textContent.toLowerCase().trim());
        
        this.applyFilters(activeFilters);
    }

    applyFilters(activeFilters) {
        if (activeFilters.length === 0) {
            // Show all items if no filters are active
            document.querySelectorAll('.article-item, .video-card-advanced, .tool-card').forEach(item => {
                item.style.display = 'block';
            });
            return;
        }

        document.querySelectorAll('.article-item, .video-card-advanced, .tool-card').forEach(item => {
            const tags = item.querySelectorAll('.tag');
            const itemTags = Array.from(tags).map(tag => tag.textContent.toLowerCase().trim());
            
            const hasMatchingTag = activeFilters.some(filter => 
                itemTags.some(tag => tag.includes(filter))
            );
            
            item.style.display = hasMatchingTag ? 'block' : 'none';
        });
    }

    playVideo(thumbnail) {
        const videoId = thumbnail.dataset.videoId;
        const title = thumbnail.dataset.title;
        
        // Create modal for video player
        this.createVideoModal(videoId, title);
        
        // Track video view
        this.trackVideoView(videoId, title);
    }

    createVideoModal(videoId, title) {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="video-modal-body">
                    <div class="video-placeholder">
                        <i class="bi bi-play-circle" style="font-size: 4rem;"></i>
                        <p>Video player would be embedded here</p>
                        <p class="text-muted">In a real implementation, this would connect to your video hosting service</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .video-modal-content {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 800px;
                max-height: 90%;
                overflow: hidden;
            }
            .video-modal-header {
                padding: 1.5rem;
                background: var(--academic-primary);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                line-height: 1;
            }
            .video-modal-body {
                padding: 2rem;
                text-align: center;
            }
            .video-placeholder {
                background: var(--academic-light);
                padding: 4rem 2rem;
                border-radius: 15px;
                color: var(--academic-primary);
            }
        `;
        document.head.appendChild(style);
        
        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    trackVideoView(videoId, title) {
        const view = {
            id: videoId,
            title: title,
            timestamp: new Date().toISOString(),
            type: 'video'
        };
        
        let viewHistory = JSON.parse(localStorage.getItem('academicViewHistory')) || [];
        viewHistory.push(view);
        
        // Keep only last 50 views
        if (viewHistory.length > 50) {
            viewHistory = viewHistory.slice(-50);
        }
        
        localStorage.setItem('academicViewHistory', JSON.stringify(viewHistory));
        this.updateProgress();
    }

    setupPomodoroTimer() {
        const startBtn = document.getElementById('startPomodoro');
        const pauseBtn = document.getElementById('pausePomodoro');
        const resetBtn = document.getElementById('resetPomodoro');
        const timerDisplay = document.getElementById('pomodoroTimer');
        
        if (!startBtn || !timerDisplay) return;
        
        this.updateTimerDisplay();
        
        startBtn.addEventListener('click', () => {
            this.startPomodoro();
        });
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pausePomodoro();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetPomodoro();
            });
        }
    }

    startPomodoro() {
        if (this.isTimerRunning) return;
        
        this.isTimerRunning = true;
        const startBtn = document.getElementById('startPomodoro');
        const pauseBtn = document.getElementById('pausePomodoro');
        
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        
        this.pomodoroTimer = setInterval(() => {
            this.pomodoroTimeLeft--;
            this.updateTimerDisplay();
            
            if (this.pomodoroTimeLeft <= 0) {
                this.completePomodoro();
            }
        }, 1000);
    }

    pausePomodoro() {
        this.isTimerRunning = false;
        clearInterval(this.pomodoroTimer);
        
        const startBtn = document.getElementById('startPomodoro');
        const pauseBtn = document.getElementById('pausePomodoro');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    resetPomodoro() {
        this.isTimerRunning = false;
        clearInterval(this.pomodoroTimer);
        this.pomodoroTimeLeft = 25 * 60;
        this.updateTimerDisplay();
        
        const startBtn = document.getElementById('startPomodoro');
        const pauseBtn = document.getElementById('pausePomodoro');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('pomodoroTimer');
        if (!timerDisplay) return;
        
        const minutes = Math.floor(this.pomodoroTimeLeft / 60);
        const seconds = this.pomodoroTimeLeft % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    completePomodoro() {
        this.pausePomodoro();
        this.recordStudySession();
        this.showPomodoroComplete();
        this.pomodoroTimeLeft = 25 * 60;
        this.updateTimerDisplay();
    }

    showPomodoroComplete() {
        const notification = document.createElement('div');
        notification.className = 'pomodoro-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-check-circle-fill"></i>
                <h4>Pomodoro Complete!</h4>
                <p>Great job! Take a 5-minute break.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-advanced">Got it!</button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .pomodoro-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            }
            .notification-content {
                padding: 2rem;
                text-align: center;
                color: var(--academic-success);
            }
            .notification-content i {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                style.remove();
            }
        }, 5000);
    }

    recordStudySession() {
        const session = {
            date: new Date().toISOString(),
            duration: 25, // minutes
            type: 'pomodoro',
            completed: true
        };
        
        this.studySessions.push(session);
        localStorage.setItem('studySessions', JSON.stringify(this.studySessions));
        this.updateProgress();
    }

    setupNoteTaking() {
        const noteEditor = document.getElementById('noteEditor');
        const saveBtn = document.getElementById('saveNote');
        const loadBtn = document.getElementById('loadNotes');
        
        if (!noteEditor) return;
        
        // Auto-save notes
        let saveTimeout;
        noteEditor.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSaveNote(noteEditor.value);
            }, 2000);
        });
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveNote(noteEditor.value);
            });
        }
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadNotes();
            });
        }
        
        // Load existing notes
        this.loadExistingNotes();
    }

    autoSaveNote(content) {
        if (content.trim()) {
            localStorage.setItem('currentNote', content);
        }
    }

    saveNote(content) {
        if (!content.trim()) return;
        
        const note = {
            id: Date.now(),
            content: content,
            timestamp: new Date().toISOString(),
            title: content.substring(0, 50) + '...'
        };
        
        this.notes.push(note);
        localStorage.setItem('academicNotes', JSON.stringify(this.notes));
        
        this.showSaveConfirmation();
    }

    showSaveConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>Note saved!</span>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .save-confirmation {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--academic-success);
                color: white;
                padding: 1rem 2rem;
                border-radius: 50px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                animation: slideInUp 0.3s ease;
                z-index: 1000;
            }
            @keyframes slideInUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
            style.remove();
        }, 3000);
    }

    loadExistingNotes() {
        const currentNote = localStorage.getItem('currentNote');
        const noteEditor = document.getElementById('noteEditor');
        
        if (currentNote && noteEditor) {
            noteEditor.value = currentNote;
        }
    }

    setupProgressTracking() {
        this.updateProgress();
        
        // Set up goal tracking
        const addGoalBtn = document.getElementById('addGoal');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.showAddGoalModal();
            });
        }
    }

    updateProgress() {
        const progressItems = document.querySelectorAll('.progress-item');
        
        // Calculate statistics
        const stats = this.calculateStats();
        
        progressItems.forEach(item => {
            const type = item.dataset.progressType;
            const circle = item.querySelector('.progress-circle');
            const value = item.querySelector('.progress-value');
            
            if (stats[type] !== undefined) {
                if (value) value.textContent = stats[type].value;
                if (circle) this.updateProgressCircle(circle, stats[type].percentage);
            }
        });
    }

    calculateStats() {
        const now = new Date();
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekSessions = this.studySessions.filter(session => 
            new Date(session.date) >= thisWeek
        );
        
        const viewHistory = JSON.parse(localStorage.getItem('academicViewHistory')) || [];
        const weekViews = viewHistory.filter(view => 
            new Date(view.timestamp) >= thisWeek
        );
        
        return {
            sessions: {
                value: weekSessions.length,
                percentage: Math.min((weekSessions.length / 10) * 100, 100)
            },
            hours: {
                value: Math.round(weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60),
                percentage: Math.min((weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 600) * 100, 100)
            },
            resources: {
                value: weekViews.length,
                percentage: Math.min((weekViews.length / 20) * 100, 100)
            },
            goals: {
                value: this.goals.filter(goal => goal.completed).length,
                percentage: this.goals.length > 0 ? (this.goals.filter(goal => goal.completed).length / this.goals.length) * 100 : 0
            }
        };
    }

    updateProgressCircle(circle, percentage) {
        // Simple progress circle implementation
        circle.style.background = `conic-gradient(var(--academic-primary) ${percentage * 3.6}deg, var(--academic-light) 0deg)`;
        circle.style.borderRadius = '50%';
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
        circle.style.position = 'relative';
        
        // Add inner circle
        if (!circle.querySelector('.inner-circle')) {
            const innerCircle = document.createElement('div');
            innerCircle.className = 'inner-circle';
            innerCircle.style.width = '80%';
            innerCircle.style.height = '80%';
            innerCircle.style.background = 'white';
            innerCircle.style.borderRadius = '50%';
            innerCircle.style.display = 'flex';
            innerCircle.style.alignItems = 'center';
            innerCircle.style.justifyContent = 'center';
            innerCircle.style.fontWeight = '700';
            innerCircle.style.color = 'var(--academic-primary)';
            innerCircle.textContent = Math.round(percentage) + '%';
            
            circle.appendChild(innerCircle);
        } else {
            circle.querySelector('.inner-circle').textContent = Math.round(percentage) + '%';
        }
    }

    initializeTabs() {
        // Set default active tab
        const defaultTab = document.querySelector('.nav-tab-advanced[data-tab="resources"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
        
        const defaultContent = document.getElementById('resources');
        if (defaultContent) {
            defaultContent.classList.add('active');
        }
    }

    setupSearch() {
        // Initialize search suggestions
        this.setupSearchSuggestions();
    }

    setupSearchSuggestions() {
        const searchInput = document.getElementById('academicSearch');
        if (!searchInput) return;
        
        const suggestions = [
            'study techniques',
            'time management',
            'note taking',
            'exam preparation',
            'research methods',
            'writing skills',
            'memory techniques',
            'productivity tips',
            'academic planning',
            'learning strategies'
        ];
        
        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions(suggestions);
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSearchSuggestions(), 200);
        });
    }

    showSearchSuggestions(suggestions) {
        const existingSuggestions = document.getElementById('searchSuggestions');
        if (existingSuggestions) return;
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.id = 'searchSuggestions';
        suggestionsDiv.className = 'search-suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                document.getElementById('academicSearch').value = suggestion;
                this.performSearch(suggestion);
                this.hideSearchSuggestions();
            });
            suggestionsDiv.appendChild(suggestionItem);
        });
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(suggestionsDiv);
        }
        
        // Add styles
        const style = document.createElement('style');
        style.id = 'searchSuggestionsStyle';
        style.textContent = `
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(37, 99, 235, 0.1);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
            }
            .suggestion-item {
                padding: 1rem 1.5rem;
                cursor: pointer;
                transition: background 0.2s ease;
                border-bottom: 1px solid rgba(37, 99, 235, 0.05);
            }
            .suggestion-item:hover {
                background: rgba(37, 99, 235, 0.05);
            }
            .suggestion-item:last-child {
                border-bottom: none;
            }
        `;
        document.head.appendChild(style);
    }

    hideSearchSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        const style = document.getElementById('searchSuggestionsStyle');
        
        if (suggestions) suggestions.remove();
        if (style) style.remove();
    }

    initializeStudyTools() {
        // Initialize various study tools
        this.setupQuickNotepad();
        this.setupStudyTimer();
        this.setupGoalTracker();
    }

    setupQuickNotepad() {
        // Quick notepad functionality is already handled in setupNoteTaking
    }

    setupStudyTimer() {
        // Study timer functionality is already handled in setupPomodoroTimer
    }

    setupGoalTracker() {
        this.renderGoals();
    }

    renderGoals() {
        const goalsContainer = document.getElementById('goalsContainer');
        if (!goalsContainer) return;
        
        goalsContainer.innerHTML = '';
        
        this.goals.forEach(goal => {
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            goalElement.innerHTML = `
                <div class="goal-content">
                    <div class="goal-header">
                        <h5>${goal.title}</h5>
                        <div class="goal-actions">
                            <button class="goal-toggle ${goal.completed ? 'completed' : ''}" onclick="academicApp.toggleGoal(${goal.id})">
                                <i class="bi bi-${goal.completed ? 'check-circle-fill' : 'circle'}"></i>
                            </button>
                            <button class="goal-delete" onclick="academicApp.deleteGoal(${goal.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="goal-description">${goal.description}</p>
                    <div class="goal-meta">
                        <span class="goal-deadline">Due: ${new Date(goal.deadline).toLocaleDateString()}</span>
                        <span class="goal-priority priority-${goal.priority}">${goal.priority}</span>
                    </div>
                </div>
            `;
            goalsContainer.appendChild(goalElement);
        });
    }

    toggleGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            localStorage.setItem('academicGoals', JSON.stringify(this.goals));
            this.renderGoals();
            this.updateProgress();
        }
    }

    deleteGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        localStorage.setItem('academicGoals', JSON.stringify(this.goals));
        this.renderGoals();
        this.updateProgress();
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, { threshold: 0.1 });

        // Observe all cards
        document.querySelectorAll('.academic-card, .tool-card, .video-card-advanced').forEach(card => {
            observer.observe(card);
        });
    }

    initializeCalendar() {
        // Basic calendar implementation
        const calendarContainer = document.getElementById('studyCalendar');
        if (!calendarContainer) return;
        
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('studyCalendar');
        if (!calendarContainer) return;
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <h4>${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                <div class="calendar-nav">
                    <button class="calendar-btn" onclick="academicApp.previousMonth()">&larr;</button>
                    <button class="calendar-btn" onclick="academicApp.nextMonth()">&rarr;</button>
                </div>
            </div>
            <div class="calendar-grid">
                ${this.generateCalendarDays(currentYear, currentMonth)}
            </div>
        `;
    }

    generateCalendarDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let daysHTML = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Add day headers
        dayNames.forEach(day => {
            daysHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const hasEvents = this.hasEventsOnDate(currentDate);
            
            daysHTML += `
                <div class="calendar-day ${hasEvents ? 'has-event' : ''}" data-date="${currentDate.toISOString()}">
                    <div class="day-number ${isCurrentMonth ? '' : 'other-month'}">${currentDate.getDate()}</div>
                    ${hasEvents ? '<div class="day-event">Study Session</div>' : ''}
                </div>
            `;
        }
        
        return daysHTML;
    }

    hasEventsOnDate(date) {
        const dateString = date.toDateString();
        return this.studySessions.some(session => 
            new Date(session.date).toDateString() === dateString
        );
    }

    loadProgress() {
        // Load and display user progress
        this.updateProgress();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.academicApp = new AcademicSupportApp();
});

// Export for use in HTML
window.AcademicSupportApp = AcademicSupportApp;
