// Advanced Career Guidance Page JavaScript
class CareerGuidanceApp {
    constructor() {
        this.currentTab = 'resources';
        this.careerGoals = JSON.parse(localStorage.getItem('careerGoals')) || [];
        this.applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
        this.networkingContacts = JSON.parse(localStorage.getItem('networkingContacts')) || [];
        this.skillsProgress = JSON.parse(localStorage.getItem('skillsProgress')) || {
            resume: 0,
            interview: 0,
            networking: 0,
            linkedin: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTabs();
        this.setupSearch();
        this.initializeTools();
        this.loadProgress();
        this.setupAnimations();
        this.initializeSalaryCalculator();
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
        const searchInput = document.getElementById('careerSearch');
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

        // Career path finder
        document.querySelectorAll('.path-step').forEach(step => {
            step.addEventListener('click', () => {
                this.handlePathStep(step);
            });
        });

        // Resume builder
        document.querySelectorAll('.resume-section').forEach(section => {
            section.addEventListener('click', () => {
                this.openResumeBuilder(section.dataset.section);
            });
        });

        // Goal tracking
        const goalForm = document.getElementById('careerGoalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCareerGoal();
            });
        }

        // Application tracker
        const appForm = document.getElementById('applicationForm');
        if (appForm) {
            appForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addJobApplication();
            });
        }

        // Networking tracker
        const networkForm = document.getElementById('networkingForm');
        if (networkForm) {
            networkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNetworkingContact();
            });
        }

        // Skill progress updates
        document.querySelectorAll('.skill-progress').forEach(skill => {
            skill.addEventListener('click', () => {
                this.updateSkillProgress(skill.dataset.skill);
            });
        });
    }

    initializeTabs() {
        // Show active tab content
        document.querySelectorAll('.tab-content-advanced').forEach(tab => {
            tab.style.display = tab.id === this.currentTab ? 'block' : 'none';
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab-advanced').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Hide all content
        document.querySelectorAll('.tab-content-advanced').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });

        // Show selected content
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.style.display = 'block';
            activeContent.classList.add('active');
            
            // Trigger animations
            setTimeout(() => {
                activeContent.querySelectorAll('.fade-in-up').forEach((el, index) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, 100);
        }

        this.currentTab = tabName;
        
        // Load tab-specific content
        switch(tabName) {
            case 'pathfinder':
                this.loadCareerPaths();
                break;
            case 'resume':
                this.loadResumeBuilder();
                break;
            case 'interview':
                this.loadInterviewPrep();
                break;
            case 'networking':
                this.loadNetworkingTools();
                break;
            case 'tracker':
                this.loadProgressTracker();
                break;
        }
    }

    setupSearch() {
        // Initialize search functionality
        this.searchItems = [];
        document.querySelectorAll('.article-item, .tool-card, .question-card').forEach(item => {
            const tags = item.dataset.tags || '';
            const title = item.querySelector('.article-title, .tool-title, .question-text')?.textContent || '';
            const description = item.querySelector('.article-description, .tool-description, .question-tip')?.textContent || '';
            
            this.searchItems.push({
                element: item,
                tags: tags.toLowerCase(),
                title: title.toLowerCase(),
                description: description.toLowerCase(),
                content: (title + ' ' + description + ' ' + tags).toLowerCase()
            });
        });
    }

    performSearch(query) {
        if (!query.trim()) {
            this.searchItems.forEach(item => {
                item.element.style.display = 'block';
            });
            return;
        }

        const searchTerms = query.toLowerCase().split(' ');
        
        this.searchItems.forEach(item => {
            const matches = searchTerms.every(term => 
                item.content.includes(term)
            );
            
            item.element.style.display = matches ? 'block' : 'none';
        });

        // Animate visible items
        this.animateSearchResults();
    }

    toggleFilter(filterTag) {
        const isActive = filterTag.classList.contains('active');
        
        if (isActive) {
            filterTag.classList.remove('active');
            this.clearFilters();
        } else {
            // Remove other active filters
            document.querySelectorAll('.filter-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            
            filterTag.classList.add('active');
            this.applyFilter(filterTag.dataset.filter);
        }
    }

    applyFilter(filterType) {
        this.searchItems.forEach(item => {
            const matches = item.tags.includes(filterType) || 
                           item.content.includes(filterType);
            item.element.style.display = matches ? 'block' : 'none';
        });
        
        this.animateSearchResults();
    }

    clearFilters() {
        this.searchItems.forEach(item => {
            item.element.style.display = 'block';
        });
    }

    animateSearchResults() {
        const visibleItems = this.searchItems.filter(item => 
            item.element.style.display !== 'none'
        );
        
        visibleItems.forEach((item, index) => {
            setTimeout(() => {
                item.element.style.opacity = '0';
                item.element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.element.style.opacity = '1';
                    item.element.style.transform = 'translateY(0)';
                }, 50);
            }, index * 50);
        });
    }

    initializeTools() {
        this.initializeCareerPathFinder();
        this.initializeResumeBuilder();
        this.initializeInterviewPrep();
        this.initializeNetworkingTools();
    }

    initializeCareerPathFinder() {
        // Career assessment quiz
        const assessmentData = [
            {
                question: "What type of work environment do you prefer?",
                options: [
                    { text: "Collaborative team setting", career: "management" },
                    { text: "Independent work from home", career: "freelance" },
                    { text: "Dynamic startup environment", career: "tech" },
                    { text: "Structured corporate setting", career: "corporate" }
                ]
            },
            {
                question: "Which skills do you enjoy using most?",
                options: [
                    { text: "Problem-solving and analysis", career: "analyst" },
                    { text: "Creative design and innovation", career: "creative" },
                    { text: "Communication and presentation", career: "sales" },
                    { text: "Leadership and strategy", career: "management" }
                ]
            }
        ];

        this.careerAssessment = assessmentData;
        this.currentQuestion = 0;
        this.assessmentAnswers = [];
    }

    loadCareerPaths() {
        const pathsContainer = document.getElementById('careerPathsContainer');
        if (!pathsContainer) return;

        const paths = [
            {
                title: "Technology & Software",
                steps: ["Learn Programming", "Build Portfolio", "Apply for Internships", "Land First Job"],
                duration: "6-12 months",
                salary: "$70,000 - $120,000"
            },
            {
                title: "Business & Management",
                steps: ["Develop Leadership Skills", "Gain Industry Experience", "Network with Professionals", "Pursue Advanced Degree"],
                duration: "2-4 years",
                salary: "$60,000 - $150,000"
            },
            {
                title: "Healthcare & Medicine",
                steps: ["Complete Prerequisites", "Take MCAT/GRE", "Apply to Programs", "Complete Residency"],
                duration: "4-8 years",
                salary: "$80,000 - $250,000"
            }
        ];

        pathsContainer.innerHTML = paths.map((path, index) => `
            <div class="career-path-card fade-in-up" style="animation-delay: ${index * 0.2}s">
                <h4>${path.title}</h4>
                <div class="path-timeline">
                    ${path.steps.map((step, stepIndex) => `
                        <div class="timeline-step">
                            <div class="step-number">${stepIndex + 1}</div>
                            <div class="step-content">${step}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="path-info">
                    <p><strong>Timeline:</strong> ${path.duration}</p>
                    <p><strong>Expected Salary:</strong> ${path.salary}</p>
                </div>
                <button class="btn-career" onclick="careerApp.startCareerPath('${path.title}')">
                    Start This Path
                </button>
            </div>
        `).join('');
    }

    initializeSalaryCalculator() {
        const calculator = document.getElementById('salaryCalculator');
        if (!calculator) return;

        const calculateBtn = calculator.querySelector('#calculateSalary');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateSalary();
            });
        }
    }

    calculateSalary() {
        const position = document.getElementById('position')?.value || '';
        const experience = parseInt(document.getElementById('experience')?.value) || 0;
        const location = document.getElementById('location')?.value || '';
        const education = document.getElementById('education')?.value || '';

        // Mock salary calculation (in real app, this would use an API)
        let baseSalary = 50000;
        
        // Position multipliers
        const positionMultipliers = {
            'software-engineer': 1.4,
            'data-scientist': 1.5,
            'product-manager': 1.3,
            'designer': 1.1,
            'marketing': 1.0,
            'sales': 1.2
        };

        // Experience bonus
        const experienceBonus = experience * 5000;

        // Location multipliers
        const locationMultipliers = {
            'san-francisco': 1.8,
            'new-york': 1.6,
            'seattle': 1.4,
            'austin': 1.2,
            'denver': 1.1,
            'other': 1.0
        };

        // Education bonus
        const educationBonus = {
            'bachelors': 0,
            'masters': 10000,
            'phd': 20000,
            'bootcamp': 5000
        };

        const multiplier = positionMultipliers[position] || 1.0;
        const locationMult = locationMultipliers[location] || 1.0;
        const eduBonus = educationBonus[education] || 0;

        const estimatedSalary = Math.round((baseSalary * multiplier * locationMult) + experienceBonus + eduBonus);

        this.displaySalaryResult(estimatedSalary, position, location);
    }

    displaySalaryResult(salary, position, location) {
        const resultContainer = document.getElementById('salaryResult');
        if (!resultContainer) return;

        const formattedSalary = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(salary);

        resultContainer.innerHTML = `
            <div class="salary-result">
                <div class="salary-amount">${formattedSalary}</div>
                <div class="salary-breakdown">
                    <p>Estimated annual salary for ${position} in ${location}</p>
                    <p class="text-muted mt-2">
                        Range: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(salary * 0.8)} - 
                        ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(salary * 1.2)}
                    </p>
                </div>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        this.animateElement(resultContainer);
    }

    loadResumeBuilder() {
        // Initialize resume building tools
        this.setupResumeTemplates();
        this.setupResumeEditor();
    }

    setupResumeTemplates() {
        const templates = [
            { name: "Professional", style: "clean", color: "blue" },
            { name: "Creative", style: "modern", color: "green" },
            { name: "Academic", style: "formal", color: "navy" },
            { name: "Tech", style: "minimal", color: "purple" }
        ];

        const templateContainer = document.getElementById('resumeTemplates');
        if (templateContainer) {
            templateContainer.innerHTML = templates.map(template => `
                <div class="resume-template" data-template="${template.name.toLowerCase()}">
                    <div class="template-preview ${template.style}">
                        <div class="template-header ${template.color}"></div>
                        <div class="template-content">
                            <div class="template-line"></div>
                            <div class="template-line short"></div>
                            <div class="template-line"></div>
                        </div>
                    </div>
                    <h4>${template.name}</h4>
                    <button class="btn-career" onclick="careerApp.selectTemplate('${template.name.toLowerCase()}')">
                        Use Template
                    </button>
                </div>
            `).join('');
        }
    }

    initializeInterviewPrep() {
        this.interviewQuestions = [
            {
                category: "General",
                questions: [
                    { q: "Tell me about yourself", tip: "Keep it professional and relevant to the role" },
                    { q: "Why do you want this job?", tip: "Connect your goals with company values" },
                    { q: "What are your strengths?", tip: "Give specific examples with results" }
                ]
            },
            {
                category: "Behavioral",
                questions: [
                    { q: "Describe a challenging situation you overcame", tip: "Use the STAR method (Situation, Task, Action, Result)" },
                    { q: "Tell me about a time you worked in a team", tip: "Highlight your collaboration and communication skills" },
                    { q: "How do you handle criticism?", tip: "Show growth mindset and learning from feedback" }
                ]
            },
            {
                category: "Technical",
                questions: [
                    { q: "Explain a complex project you worked on", tip: "Break it down into simple, understandable parts" },
                    { q: "How do you stay updated with industry trends?", tip: "Mention specific resources and learning habits" },
                    { q: "What tools and technologies are you familiar with?", tip: "Be honest about your proficiency levels" }
                ]
            }
        ];
    }

    loadInterviewPrep() {
        const container = document.getElementById('interviewQuestionsContainer');
        if (!container) return;

        container.innerHTML = this.interviewQuestions.map(category => `
            <div class="question-category">
                <h4>${category.category} Questions</h4>
                <div class="questions-grid">
                    ${category.questions.map(q => `
                        <div class="question-card">
                            <div class="question-text">${q.q}</div>
                            <div class="question-tip">${q.tip}</div>
                            <button class="btn-career mt-2" onclick="careerApp.practiceQuestion('${q.q}')">
                                Practice Answer
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    initializeNetworkingTools() {
        this.networkingStrategies = [
            {
                platform: "LinkedIn",
                icon: "bi-linkedin",
                tips: [
                    "Optimize your profile with keywords",
                    "Share industry-relevant content",
                    "Engage with others' posts thoughtfully",
                    "Send personalized connection requests"
                ]
            },
            {
                platform: "Industry Events",
                icon: "bi-calendar-event",
                tips: [
                    "Attend conferences and meetups",
                    "Prepare your elevator pitch",
                    "Follow up within 24-48 hours",
                    "Offer value before asking for help"
                ]
            },
            {
                platform: "Professional Organizations",
                icon: "bi-people",
                tips: [
                    "Join relevant professional associations",
                    "Volunteer for committees or events",
                    "Participate in online forums",
                    "Attend local chapter meetings"
                ]
            }
        ];
    }

    loadNetworkingTools() {
        const container = document.getElementById('networkingStrategies');
        if (!container) return;

        container.innerHTML = this.networkingStrategies.map(strategy => `
            <div class="networking-card">
                <div class="networking-icon">
                    <i class="${strategy.icon}"></i>
                </div>
                <h4>${strategy.platform}</h4>
                <ul class="networking-tips">
                    ${strategy.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
                <button class="btn-career" onclick="careerApp.openNetworkingGuide('${strategy.platform}')">
                    Learn More
                </button>
            </div>
        `).join('');
    }

    loadProgress() {
        this.updateProgressCircles();
        this.loadGoals();
        this.loadApplications();
    }

    updateProgressCircles() {
        Object.keys(this.skillsProgress).forEach(skill => {
            const circle = document.querySelector(`[data-skill="${skill}"] .progress-circle`);
            if (circle) {
                this.animateProgressCircle(circle, this.skillsProgress[skill]);
            }
        });
    }

    animateProgressCircle(circle, percentage) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.innerHTML = `
            <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="8" fill="none"/>
                <circle cx="60" cy="60" r="50" stroke="var(--career-primary)" stroke-width="8" 
                        fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                        style="transition: stroke-dashoffset 1s ease-in-out"/>
                <text x="60" y="65" text-anchor="middle" font-size="16" font-weight="bold" fill="var(--career-primary)">
                    ${percentage}%
                </text>
            </svg>
        `;
    }

    addCareerGoal() {
        const form = document.getElementById('careerGoalForm');
        if (!form) return;

        const formData = new FormData(form);
        const goal = {
            id: Date.now(),
            title: formData.get('goalTitle'),
            description: formData.get('goalDescription'),
            deadline: formData.get('goalDeadline'),
            priority: formData.get('goalPriority'),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.careerGoals.push(goal);
        localStorage.setItem('careerGoals', JSON.stringify(this.careerGoals));
        
        form.reset();
        this.loadGoals();
        this.showNotification('Career goal added successfully!');
    }

    loadGoals() {
        const container = document.getElementById('careerGoalsList');
        if (!container) return;

        container.innerHTML = this.careerGoals.map(goal => `
            <div class="goal-item ${goal.completed ? 'completed' : ''}" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h5>${goal.title}</h5>
                    <span class="priority-badge priority-${goal.priority}">${goal.priority}</span>
                </div>
                <p>${goal.description}</p>
                <div class="goal-meta">
                    <span class="deadline">Due: ${new Date(goal.deadline).toLocaleDateString()}</span>
                    <div class="goal-actions">
                        <button class="btn-sm ${goal.completed ? 'btn-secondary' : 'btn-career'}" 
                                onclick="careerApp.toggleGoal(${goal.id})">
                            ${goal.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn-sm btn-danger" onclick="careerApp.deleteGoal(${goal.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });

        // Scroll to top button
        const scrollBtn = document.getElementById('scrollToTop');
        if (scrollBtn) {
            window.addEventListener('scroll', () => {
                scrollBtn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
            });

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    animateElement(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility methods
    startCareerPath(pathTitle) {
        this.showNotification(`Started career path: ${pathTitle}`);
        // Add to user's active paths
    }

    selectTemplate(templateName) {
        this.showNotification(`Selected ${templateName} template`);
        // Open resume editor with selected template
    }

    practiceQuestion(question) {
        this.showNotification('Opening practice mode...');
        // Open interview practice modal
    }

    openNetworkingGuide(platform) {
        this.showNotification(`Opening ${platform} networking guide`);
        // Open detailed networking guide
    }

    toggleGoal(goalId) {
        const goal = this.careerGoals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            localStorage.setItem('careerGoals', JSON.stringify(this.careerGoals));
            this.loadGoals();
            this.showNotification(goal.completed ? 'Goal completed!' : 'Goal reopened');
        }
    }

    deleteGoal(goalId) {
        this.careerGoals = this.careerGoals.filter(g => g.id !== goalId);
        localStorage.setItem('careerGoals', JSON.stringify(this.careerGoals));
        this.loadGoals();
        this.showNotification('Goal deleted');
    }

    updateSkillProgress(skill) {
        this.skillsProgress[skill] = Math.min(100, this.skillsProgress[skill] + 10);
        localStorage.setItem('skillsProgress', JSON.stringify(this.skillsProgress));
        this.updateProgressCircles();
        this.showNotification(`${skill} progress updated!`);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.careerApp = new CareerGuidanceApp();
});

// Export for global access
window.CareerGuidanceApp = CareerGuidanceApp;
