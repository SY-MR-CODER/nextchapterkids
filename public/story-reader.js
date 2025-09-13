// Story Reader JavaScript
class StoryReader {
    constructor() {
        this.currentPageIndex = 0;
        this.totalPages = 0;
        this.flippedPages = new Set();
        this.autoReadInterval = null;
        this.storyData = null;
        
        this.init();
    }
    
    init() {
        // Get story data from URL parameters or localStorage
        this.loadStoryData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show loading screen initially
        this.showLoadingScreen();
    }
    
    loadStoryData() {
        // Try to get story data from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const storyDataParam = urlParams.get('story');
        
        if (storyDataParam) {
            try {
                this.storyData = JSON.parse(decodeURIComponent(storyDataParam));
            } catch (e) {
                console.error('Failed to parse story data from URL');
            }
        }
        
        // Fallback to localStorage
        if (!this.storyData) {
            const savedStory = localStorage.getItem('currentStory');
            if (savedStory) {
                try {
                    this.storyData = JSON.parse(savedStory);
                } catch (e) {
                    console.error('Failed to parse story data from localStorage');
                }
            }
        }
        
        // If still no story data, show error
        if (!this.storyData) {
            this.showError('No story data found. Please generate a story first.');
            return;
        }
        
        // Load the story after a brief delay for loading animation
        setTimeout(() => {
            this.displayStory();
        }, 3000);
    }
    
    setupEventListeners() {
        // Navigation controls
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('printBtn')?.addEventListener('click', () => this.printStory());
        document.getElementById('closeBtn')?.addEventListener('click', () => this.closeStory());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.closeStory();
                    break;
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const storyContent = document.getElementById('storyContent');
        const readingControls = document.getElementById('readingControls');
        
        loadingScreen?.classList.remove('hidden');
        storyContent?.classList.add('hidden');
        readingControls?.classList.add('hidden');
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const storyContent = document.getElementById('storyContent');
        const readingControls = document.getElementById('readingControls');
        
        loadingScreen?.classList.add('hidden');
        storyContent?.classList.remove('hidden');
        readingControls?.classList.remove('hidden');
    }
    
    displayStory() {
        if (!this.storyData) return;
        
        const storyContent = document.getElementById('storyContent');
        const childName = this.storyData.childName || 'Hero';
        
        // Create simple story layout
        const storyHTML = this.createSimpleStoryLayout(this.storyData.story, childName);
        
        storyContent.innerHTML = storyHTML;
        
        // Hide loading screen
        this.hideLoadingScreen();
    }
    
    createSimpleStoryLayout(storyText, childName) {
        const paragraphs = storyText.split('\n\n').filter(p => p.trim());
        
        return `
            <div class="story-container">
                <div class="story-header">
                    <h1 class="story-title">${childName}'s Magical Adventure</h1>
                    <p class="story-subtitle">A Personalized Story</p>
                    <p class="story-author">Created with StoryMagic AI</p>
                </div>
                
                <div class="story-text">
                    ${paragraphs.map(p => `<p class="story-paragraph">${p.trim()}</p>`).join('')}
                </div>
                
                <div class="story-end">
                    <h2>The End</h2>
                    <div class="end-emoji">🌟</div>
                    <p>Thank you for reading ${childName}'s magical adventure!</p>
                    <p class="credits">Created with love by StoryMagic AI</p>
                </div>
            </div>
        `;
    }
    

    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    printStory() {
        window.print();
    }
    
    closeStory() {
        if (window.opener) {
            window.close();
        } else {
            // If opened directly, redirect to main app
            window.location.href = '/';
        }
    }
    

    
    showError(message) {
        const storyContent = document.getElementById('storyContent');
        storyContent.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: white;">
                <h2 style="color: #ff6b9d; margin-bottom: 2rem;">Oops! Something went wrong</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">${message}</p>
                <button onclick="window.close()" style="padding: 1rem 2rem; background: #ff6b9d; color: white; border: none; border-radius: 25px; font-size: 1rem; cursor: pointer;">
                    Close Window
                </button>
            </div>
        `;
        this.hideLoadingScreen();
    }
}

// Initialize story reader when page loads
let storyReader;
document.addEventListener('DOMContentLoaded', () => {
    storyReader = new StoryReader();
});

// Make storyReader globally accessible for onclick handlers
window.storyReader = storyReader;