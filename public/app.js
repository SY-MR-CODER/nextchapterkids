// App State
let currentUser = null;
let currentChild = null;


// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 StoryMagic App Initializing...');
    
    // Check if user is logged in (simple session check)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        console.log('Found saved user, loading dashboard...');
        currentUser = JSON.parse(savedUser);
        loadDashboard();
    } else {
        console.log('No saved user, showing welcome screen...');
        showScreen('welcomeScreen');
    }

    setupEventListeners();
    
    // Add a welcome message
    setTimeout(() => {
        if (!currentUser) {
            console.log('🎉 Welcome to StoryMagic! Create magical stories for your children!');
        }
    }, 1000);
});

function setupEventListeners() {
    // Welcome screen - Add null checks
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => showScreen('loginScreen'));
    if (signupBtn) signupBtn.addEventListener('click', () => showScreen('signupScreen'));

    // Auth switching - Add null checks
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('signupScreen');
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('loginScreen');
        });
    }

    // Forms - Add null checks
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const addChildForm = document.getElementById('addChildForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (addChildForm) addChildForm.addEventListener('submit', handleAddChild);

    // Navigation - Add null checks
    const logoutBtn = document.getElementById('logoutBtn');
    const addChildBtn = document.getElementById('addChildBtn');
    const backToDashboard = document.getElementById('backToDashboard');
    const backToChild = document.getElementById('backToChild');
    const backToDashboardFromStory = document.getElementById('backToDashboardFromStory');
    const backToDashboardFromPricing = document.getElementById('backToDashboardFromPricing');
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (addChildBtn) addChildBtn.addEventListener('click', () => showScreen('addChildScreen'));
    if (backToDashboard) backToDashboard.addEventListener('click', () => loadDashboard());
    if (backToChild) backToChild.addEventListener('click', () => loadDashboard());
    if (backToDashboardFromStory) backToDashboardFromStory.addEventListener('click', () => loadDashboard());
    if (backToDashboardFromPricing) backToDashboardFromPricing.addEventListener('click', () => loadDashboard());

    // Story generation - Add null checks
    const generateStoryBtn = document.getElementById('generateStoryBtn');
    const newStoryBtn = document.getElementById('newStoryBtn');
    
    if (generateStoryBtn) generateStoryBtn.addEventListener('click', handleGenerateStory);
    if (newStoryBtn) {
        newStoryBtn.addEventListener('click', () => {
            const storyResult = document.getElementById('storyResult');
            const storyPrompt = document.getElementById('storyPrompt');
            const storyIdea = document.getElementById('storyIdea');
            
            if (storyResult) storyResult.classList.add('hidden');
            if (storyPrompt) storyPrompt.classList.remove('hidden');
            if (storyIdea) storyIdea.value = '';
            resetAdventureButtons();
        });
    }

    // Adventure type buttons
    setupAdventureButtons();
    
    // Story rating
    setupStoryRating();

    // Book option interactions
    setupBookOptionInteractions();
}

function setupAdventureButtons() {
    const adventureButtons = document.querySelectorAll('.adventure-btn');
    adventureButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all buttons
            adventureButtons.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            btn.classList.add('selected');
            // Update story idea input
            const storyIdea = document.getElementById('storyIdea');
            const adventureType = btn.dataset.type;
            const adventurePrompts = {
                fantasy: 'exploring a magical kingdom with castles and wizards',
                space: 'going on an exciting space adventure to distant planets',
                underwater: 'discovering an amazing underwater world with sea creatures',
                forest: 'exploring a magical forest full of talking animals',
                dinosaur: 'traveling back in time to meet friendly dinosaurs',
                superhero: 'becoming a superhero and saving the day',
                pirate: 'sailing the seven seas as a brave pirate captain',
                ninja: 'training as a stealthy ninja with amazing skills',
                wizard: 'attending a magical wizard school and learning spells',
                princess: 'living in a beautiful castle as a kind princess',
                robot: 'exploring a futuristic world filled with helpful robots',
                alien: 'visiting a friendly alien planet with strange creatures',
                jungle: 'going on a wild safari through the jungle',
                arctic: 'exploring the icy Arctic with polar bears and penguins',
                desert: 'crossing the vast desert on a camel adventure',
                mountain: 'climbing tall mountains and discovering hidden caves',
                circus: 'joining the circus and learning amazing tricks',
                farm: 'helping on a farm with friendly animals',
                city: 'exploring the big city and meeting new friends',
                beach: 'having fun at the beach with sand castles and waves',
                carnival: 'enjoying magical rides and games at a carnival',
                museum: 'solving mysteries in an ancient museum',
                library: 'discovering magical books in an enchanted library',
                bakery: 'baking delicious treats in a magical bakery',
                garden: 'finding secrets in a beautiful hidden garden',
                treehouse: 'building the ultimate treehouse adventure club',
                playground: 'having the best day ever at a magical playground',
                school: 'going on exciting adventures at school',
                hospital: 'helping doctors and nurses save the day',
                fire: 'being a brave firefighter and rescuing people',
                police: 'solving crimes as a detective police officer',
                vet: 'helping sick animals as a caring veterinarian',
                chef: 'cooking amazing meals in a restaurant kitchen',
                artist: 'creating beautiful art in a magical studio',
                musician: 'making wonderful music and performing concerts',
                dancer: 'dancing and performing in amazing shows',
                inventor: 'creating incredible inventions in a science lab',
                detective: 'solving mysterious cases as a clever detective',
                time: 'traveling through time to different eras',
                fairy: 'meeting magical fairies in an enchanted realm',
                dragon: 'befriending a gentle dragon and going on adventures',
                unicorn: 'riding unicorns through magical rainbow lands',
                mermaid: 'swimming with mermaids in the deep ocean',
                ghost: 'helping a friendly ghost solve ancient mysteries',
                monster: 'befriending silly monsters and having fun',
                toy: 'shrinking down to play in a magical toy world',
                candy: 'exploring a land made entirely of candy and sweets',
                ice: 'visiting a beautiful palace made of ice and snow',
                volcano: 'exploring an active volcano with lava adventures',
                cloud: 'floating through the sky in a kingdom of clouds',
                rainbow: 'sliding down rainbows and collecting colors'
            };
            storyIdea.value = adventurePrompts[adventureType] || '';
        });
    });
}

function resetAdventureButtons() {
    document.querySelectorAll('.adventure-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function setupStoryRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            // Update visual state
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            // Show thank you message
            setTimeout(() => {
                const ratingDiv = document.querySelector('.story-rating');
                ratingDiv.innerHTML = `
                    <p style="color: #48bb78; font-weight: 600;">
                        ⭐ Thank you for rating the story! Your feedback helps us create better adventures.
                    </p>
                `;
            }, 500);
        });
        
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.style.opacity = '1';
                    s.style.transform = 'scale(1.1)';
                } else {
                    s.style.opacity = '0.3';
                    s.style.transform = 'scale(1)';
                }
            });
        });
    });
    
    const ratingContainer = document.querySelector('.rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                if (!s.classList.contains('active')) {
                    s.style.opacity = '0.3';
                    s.style.transform = 'scale(1)';
                }
            });
        });
    }
}

function setupBookOptionInteractions() {
    setupBookSearch();
}

// Book search autocomplete functionality
function setupBookSearch() {
    const bookSearch = document.getElementById('bookSearch');
    const bookSuggestions = document.getElementById('bookSuggestions');
    const selectedBooks = document.getElementById('selectedBooks');
    
    if (!bookSearch) return; // Not on the add child page
    
    let selectedBooksArray = [];
    
    // Popular books, movies, and shows database
    const mediaDatabase = [
        // Books
        { name: "Harry Potter", emoji: "🧙‍♂️", type: "Book" },
        { name: "The Cat in the Hat", emoji: "🐱", type: "Book" },
        { name: "Where the Wild Things Are", emoji: "👹", type: "Book" },
        { name: "Charlotte's Web", emoji: "🕷️", type: "Book" },
        { name: "The Very Hungry Caterpillar", emoji: "🐛", type: "Book" },
        { name: "Green Eggs and Ham", emoji: "🥚", type: "Book" },
        { name: "Goodnight Moon", emoji: "🌙", type: "Book" },
        { name: "The Giving Tree", emoji: "🌳", type: "Book" },
        { name: "Matilda", emoji: "📚", type: "Book" },
        { name: "The Lion King", emoji: "🦁", type: "Book/Movie" },
        
        // Disney Movies
        { name: "Frozen", emoji: "❄️", type: "Movie" },
        { name: "Moana", emoji: "🌊", type: "Movie" },
        { name: "Encanto", emoji: "🦋", type: "Movie" },
        { name: "Toy Story", emoji: "🤠", type: "Movie" },
        { name: "Finding Nemo", emoji: "🐠", type: "Movie" },
        { name: "The Incredibles", emoji: "🦸", type: "Movie" },
        { name: "Coco", emoji: "💀", type: "Movie" },
        { name: "Zootopia", emoji: "🐰", type: "Movie" },
        { name: "Big Hero 6", emoji: "🤖", type: "Movie" },
        { name: "Tangled", emoji: "👸", type: "Movie" },
        
        // TV Shows
        { name: "Peppa Pig", emoji: "🐷", type: "TV Show" },
        { name: "Bluey", emoji: "🐕", type: "TV Show" },
        { name: "Paw Patrol", emoji: "🐕‍🦺", type: "TV Show" },
        { name: "Dora the Explorer", emoji: "🗺️", type: "TV Show" },
        { name: "SpongeBob SquarePants", emoji: "🧽", type: "TV Show" },
        { name: "My Little Pony", emoji: "🦄", type: "TV Show" },
        { name: "Daniel Tiger", emoji: "🐅", type: "TV Show" },
        { name: "Sesame Street", emoji: "🎭", type: "TV Show" },
        { name: "Cocomelon", emoji: "🎵", type: "TV Show" },
        { name: "Blippi", emoji: "🎩", type: "TV Show" },
        
        // Superheroes
        { name: "Spider-Man", emoji: "🕷️", type: "Superhero" },
        { name: "Batman", emoji: "🦇", type: "Superhero" },
        { name: "Superman", emoji: "🦸‍♂️", type: "Superhero" },
        { name: "Wonder Woman", emoji: "👸", type: "Superhero" },
        
        // Other Popular Characters
        { name: "Pokemon", emoji: "⚡", type: "Anime/Game" },
        { name: "Minecraft", emoji: "⛏️", type: "Game" },
        { name: "Roblox", emoji: "🎮", type: "Game" },
        { name: "Among Us", emoji: "👾", type: "Game" }
    ];
    
    // Update selected books display
    function updateSelectedBooksDisplay() {
        if (selectedBooksArray.length === 0) {
            selectedBooks.innerHTML = '';
            selectedBooks.classList.add('empty');
        } else {
            selectedBooks.classList.remove('empty');
            selectedBooks.innerHTML = selectedBooksArray.map(book => `
                <div class="selected-book">
                    <span class="emoji">${book.emoji}</span>
                    <span class="name">${book.name}</span>
                    <span class="remove" onclick="removeBook('${book.name}')">×</span>
                </div>
            `).join('');
        }
    }
    
    // Remove book function (make it global so onclick can access it)
    window.removeBook = function(bookName) {
        selectedBooksArray = selectedBooksArray.filter(book => book.name !== bookName);
        updateSelectedBooksDisplay();
    };
    
    // Search functionality
    bookSearch.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            bookSuggestions.classList.remove('show');
            return;
        }
        
        const matches = mediaDatabase.filter(item => 
            item.name.toLowerCase().includes(query) &&
            !selectedBooksArray.some(selected => selected.name === item.name)
        ).slice(0, 8); // Limit to 8 suggestions
        
        if (matches.length > 0) {
            bookSuggestions.innerHTML = matches.map(item => `
                <div class="suggestion-item" onclick="addBook('${item.name}', '${item.emoji}', '${item.type}')">
                    <span class="suggestion-emoji">${item.emoji}</span>
                    <span class="suggestion-text">${item.name}</span>
                    <span class="suggestion-type">${item.type}</span>
                </div>
            `).join('');
            bookSuggestions.classList.add('show');
        } else {
            // Allow custom entries
            bookSuggestions.innerHTML = `
                <div class="suggestion-item" onclick="addCustomBook('${query}')">
                    <span class="suggestion-emoji">📚</span>
                    <span class="suggestion-text">Add "${e.target.value}"</span>
                    <span class="suggestion-type">Custom</span>
                </div>
            `;
            bookSuggestions.classList.add('show');
        }
    });
    
    // Add book function (make it global)
    window.addBook = function(name, emoji, type) {
        if (!selectedBooksArray.some(book => book.name === name)) {
            selectedBooksArray.push({ name, emoji, type });
            updateSelectedBooksDisplay();
        }
        bookSearch.value = '';
        bookSuggestions.classList.remove('show');
    };
    
    // Add custom book function
    window.addCustomBook = function(query) {
        const name = bookSearch.value.trim();
        if (name && !selectedBooksArray.some(book => book.name === name)) {
            selectedBooksArray.push({ name, emoji: '📚', type: 'Custom' });
            updateSelectedBooksDisplay();
        }
        bookSearch.value = '';
        bookSuggestions.classList.remove('show');
    };
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!bookSearch.contains(e.target) && !bookSuggestions.contains(e.target)) {
            bookSuggestions.classList.remove('show');
        }
    });
    
    // Initialize display
    updateSelectedBooksDisplay();
    
    // Make selectedBooksArray accessible for form submission
    window.getSelectedBooks = function() {
        console.log('Getting selected books:', selectedBooksArray);
        return selectedBooksArray.map(book => book.name);
    };
    
    // Debug: Log when books are selected
    console.log('Book search system initialized');
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Validation
    if (!email || !password) {
        showNotification('🌟 Please fill in both email and password!', 'warning');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '🌟 Signing in...';
    submitBtn.disabled = true;

    try {
        console.log('Attempting login for:', email);
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (data.success) {
            currentUser = { email, parentName: data.parentName, userId: data.userId };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification('🎉 Welcome back, ' + data.parentName + '! Loading your magical dashboard...', 'success');
            loadDashboard();
        } else {
            showNotification('❌ ' + (data.error || 'Login failed. Please check your credentials.'), 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ Login failed. Please check if the server is running and try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const parentName = document.getElementById('parentName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    // Validation
    if (!parentName || !email || !password) {
        showNotification('🌟 Please fill in all fields!', 'warning');
        return;
    }

    if (password.length < 6) {
        showNotification('🔒 Password should be at least 6 characters long!', 'warning');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '🌟 Creating account...';
    submitBtn.disabled = true;

    try {
        console.log('Attempting signup for:', email);
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentName, email, password })
        });

        console.log('Signup response status:', response.status);
        const data = await response.json();
        console.log('Signup response data:', data);
        
        if (data.success) {
            currentUser = { email, parentName: data.parentName, userId: data.userId };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification('🎉 Account created successfully! Welcome to StoryMagic, ' + data.parentName + '!', 'success');
            loadDashboard();
        } else {
            showNotification('❌ ' + (data.error || 'Registration failed. Please try again.'), 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('❌ Registration failed. Please check if the server is running and try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    currentUser = null;
    currentChild = null;
    localStorage.removeItem('currentUser');
    showNotification('👋 See you later! Come back soon for more magical stories!', 'info');
    showScreen('welcomeScreen');
}

// Fun notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.story-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'story-notification';
    notification.innerHTML = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b9d, #feca57);
        color: white;
        padding: 15px 20px;
        border-radius: 25px;
        box-shadow: 0 8px 25px rgba(255, 107, 157, 0.4);
        z-index: 1000;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 4s;
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="notif" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23feca57;stop-opacity:1" /><stop offset="100%" style="stop-color:%23ff6b9d;stop-opacity:1" /></linearGradient></defs><path d="M2 2 L2 28 L8 22 L12 26 L16 22 L8 14 L18 14 Z" fill="url(%23notif)" stroke="white" stroke-width="1"/><circle cx="24" cy="12" r="6" fill="%23feca57" stroke="%23fff" stroke-width="1"/><path d="M21 12 L27 12 M24 9 L24 15" stroke="%23fff" stroke-width="1.5"/></svg>') 2 2, pointer;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Dashboard Functions
async function loadDashboard() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/user/${currentUser.email}`);
        const userData = await response.json();
        
        if (userData.error) {
            handleLogout();
            return;
        }

        document.getElementById('parentNameDisplay').textContent = userData.parentName;
        displayChildren(userData.children || []);
        showScreen('dashboardScreen');
    } catch (error) {
        console.error('Load dashboard error:', error);
        alert('Failed to load dashboard');
    }
}



function displayChildren(children) {
    const childrenList = document.getElementById('childrenList');
    
    if (!childrenList) {
        console.error('Children list element not found');
        return;
    }
    
    // Update stats
    const totalChildrenElement = document.getElementById('totalChildren');
    if (totalChildrenElement) {
        totalChildrenElement.textContent = children.length;
    }
    
    const totalStories = children.reduce((sum, child) => sum + (child.stories_generated || 0), 0);
    const totalStoriesElement = document.getElementById('totalStories');
    if (totalStoriesElement) {
        totalStoriesElement.textContent = totalStories;
    }
    
    if (children.length === 0) {
        childrenList.innerHTML = `
            <div class="no-children">
                <div style="font-size: 4em; margin-bottom: 20px;">👶</div>
                <h3>No children added yet!</h3>
                <p>Add your first child to start creating magical personalized stories.</p>
                <button class="btn btn-primary" onclick="document.getElementById('addChildBtn').click()" style="margin-top: 20px;">
                    ➕ Add Your First Child
                </button>
            </div>
        `;
        return;
    }

    childrenList.innerHTML = children.map(child => {
        console.log('Displaying child:', child);
        
        return `
            <div class="child-card">
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3em;">${getChildAvatar(child.age)}</div>
                </div>
                <h3>${child.name}</h3>
                <div class="child-info">
                    <p><strong>Age:</strong> ${child.age} years old</p>
                    <p><strong>Reading Level:</strong> ${capitalizeFirst(child.reading_level || child.readingLevel)}</p>
                    <p><strong>Favorite Books:</strong> ${child.favorite_books && child.favorite_books.length > 0 ? 
                        child.favorite_books.slice(0, 2).join(', ') + (child.favorite_books.length > 2 ? '...' : '') : 
                        (child.favoriteBooks && child.favoriteBooks.length > 0 ? 
                            child.favoriteBooks.slice(0, 2).join(', ') + (child.favoriteBooks.length > 2 ? '...' : '') : 
                            'None selected')}</p>
                    <p><strong>Interests:</strong> ${child.interests ? child.interests.substring(0, 50) + (child.interests.length > 50 ? '...' : '') : 'Various adventures'}</p>
                </div>
                <div class="child-stats">
                    <span>📚 ${child.stories_generated || child.storiesGenerated || 0} stories created</span>
                    <span>⭐ ${capitalizeFirst(child.reading_level || child.readingLevel)} reader</span>
                </div>
                <button class="create-story-btn" onclick="startStoryCreation('${child.id}', '${child.name}')">
                    ✨ Create New Story for ${child.name}
                </button>
            </div>
        `;
    }).join('');
}

// Story Creation
function startStoryCreation(childId, childName) {
    currentChild = { id: childId, name: childName };
    
    // Update UI with child's name
    const storyChildNameElement = document.getElementById('storyChildName');
    if (storyChildNameElement) {
        storyChildNameElement.textContent = childName;
    }
    
    document.querySelectorAll('.child-name-placeholder').forEach(el => {
        el.textContent = childName;
    });
    
    // Reset story screen
    const storyPrompt = document.getElementById('storyPrompt');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const storyResult = document.getElementById('storyResult');
    const storyIdea = document.getElementById('storyIdea');
    
    if (storyPrompt) storyPrompt.classList.remove('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (storyResult) storyResult.classList.add('hidden');
    if (storyIdea) storyIdea.value = '';
    
    resetAdventureButtons();
    showScreen('storyScreen');
}

function resetAdventureButtons() {
    document.querySelectorAll('.adventure-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function displayChildren(children) {
    const childrenList = document.getElementById('childrenList');
    
    // Update stats
    document.getElementById('totalChildren').textContent = children.length;
    const totalStories = children.reduce((sum, child) => sum + (child.storiesGenerated || 0), 0);
    document.getElementById('totalStories').textContent = totalStories;
    
    if (children.length === 0) {
        childrenList.innerHTML = `
            <div class="no-children">
                <div style="font-size: 4em; margin-bottom: 20px;">👶</div>
                <h3>No children added yet!</h3>
                <p>Add your first child to start creating magical personalized stories.</p>
                <button class="btn btn-primary" onclick="document.getElementById('addChildBtn').click()" style="margin-top: 20px;">
                    ➕ Add Your First Child
                </button>
            </div>
        `;
        return;
    }

    childrenList.innerHTML = children.map(child => `
        <div class="child-card">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 3em;">${getChildAvatar(child.age)}</div>
            </div>
            <h3>${child.name}</h3>
            <div class="child-info">
                <p><strong>Age:</strong> ${child.age} years old</p>
                <p><strong>Reading Level:</strong> ${capitalizeFirst(child.readingLevel)}</p>
                <p><strong>Favorite Books:</strong> ${child.favoriteBooks && child.favoriteBooks.length > 0 ? child.favoriteBooks.slice(0, 2).join(', ') + (child.favoriteBooks.length > 2 ? '...' : '') : 'None selected'}</p>
                <p><strong>Interests:</strong> ${child.interests ? child.interests.substring(0, 50) + (child.interests.length > 50 ? '...' : '') : 'Various adventures'}</p>
            </div>
            <div class="child-stats">
                <span>📚 ${child.storiesGenerated || 0} stories created</span>
                <span>⭐ ${capitalizeFirst(child.readingLevel)} reader</span>
            </div>
            <button class="create-story-btn" onclick="startStoryCreation('${child.id}', '${child.name}')">
                ✨ Create New Story for ${child.name}
            </button>
        </div>
    `).join('');
}

function getChildAvatar(age) {
    const ageNum = parseInt(age);
    if (ageNum <= 5) return '👶';
    if (ageNum <= 8) return '🧒';
    if (ageNum <= 12) return '👦';
    return '👧';
}

function capitalizeFirst(str) {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getChildAvatar(age) {
    const ageNum = parseInt(age);
    if (ageNum <= 5) return '👶';
    if (ageNum <= 8) return '🧒';
    if (ageNum <= 12) return '👦';
    return '👧';
}

// Child Management
async function handleAddChild(e) {
    e.preventDefault();
    
    console.log('Adding child...');
    
    const formData = new FormData(e.target);
    
    // Get selected books from the new search system
    const selectedBooks = window.getSelectedBooks ? window.getSelectedBooks() : [];
    
    const childData = {
        parentEmail: currentUser.email,
        childName: formData.get('childName'),
        age: formData.get('age'),
        readingLevel: formData.get('readingLevel'),
        favoriteBooks: selectedBooks,
        interests: formData.get('interests')
    };

    console.log('Child data:', childData);

    // Validation
    if (!childData.childName || !childData.age || !childData.readingLevel) {
        showNotification('❌ Please fill in all required fields!', 'error');
        return;
    }

    // Allow children to be added without favorite books, but show a helpful message
    if (childData.favoriteBooks.length === 0) {
        const proceed = confirm('No favorite books selected. We\'ll create general adventure stories for this child. You can always edit their profile later. Continue?');
        if (!proceed) return;
        
        // Add a default "General Adventure" preference
        childData.favoriteBooks = ['General Adventure'];
    }

    try {
        const response = await fetch('/api/add-child', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification(`🎉 ${childData.childName} has been added! Ready to create magical stories!`, 'success');
            loadDashboard();
        } else {
            showNotification(`❌ ${data.error || 'Failed to add child'}`, 'error');
        }
    } catch (error) {
        console.error('Add child error:', error);
        showNotification('❌ Failed to add child. Please try again.', 'error');
    }
}

// Child Management
async function handleAddChild(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const childData = {
        parentEmail: currentUser.email,
        childName: formData.get('childName'),
        age: formData.get('age'),
        readingLevel: formData.get('readingLevel'),
        favoriteBooks: window.getSelectedBooks ? window.getSelectedBooks() : [],
        interests: formData.get('interests')
    };

    // Allow children to be added without favorite books, but show a helpful message
    if (childData.favoriteBooks.length === 0) {
        const proceed = confirm('No favorite books selected. We\'ll create general adventure stories for this child. You can always edit their profile later. Continue?');
        if (!proceed) return;
        
        // Add a default "General Adventure" preference
        childData.favoriteBooks = ['General Adventure'];
    }

    try {
        const response = await fetch('/api/add-child', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
        });

        const data = await response.json();
        
        if (data.success) {
            loadDashboard();
        } else {
            alert(data.error || 'Failed to add child');
        }
    } catch (error) {
        console.error('Add child error:', error);
        alert('Failed to add child. Please try again.');
    }
}

// Story Creation
function startStoryCreation(childId, childName) {
    currentChild = { id: childId, name: childName };
    
    // Update UI with child's name
    document.getElementById('storyChildName').textContent = childName;
    document.querySelectorAll('.child-name-placeholder').forEach(el => {
        el.textContent = childName;
    });
    
    // Reset story screen
    document.getElementById('storyPrompt').classList.remove('hidden');
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('storyResult').classList.add('hidden');
    document.getElementById('storyIdea').value = '';
    
    showScreen('storyScreen');
}

async function handleGenerateStory() {
    if (!currentChild || !currentUser) return;

    // Get child data from current user
    try {
        const response = await fetch(`/api/user/${currentUser.email}`);
        const userData = await response.json();
        const child = userData.children.find(c => c.id === currentChild.id);
        
        if (!child) {
            alert('Child not found');
            return;
        }

        const storyIdea = document.getElementById('storyIdea').value.trim();

        // Show loading
        document.getElementById('storyPrompt').classList.add('hidden');
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('storyResult').classList.add('hidden');

        // Generate story
        const storyResponse = await fetch('/api/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                childName: child.name,
                age: child.age,
                favoriteBooks: child.favoriteBooks,
                imagination: storyIdea || child.interests,
                readingLevel: child.readingLevel,
                parentEmail: currentUser.email
            })
        });

        const storyData = await storyResponse.json();
        
        if (storyData.error) {
            throw new Error(storyData.error);
        }

        // Display story
        document.getElementById('storyContent').textContent = storyData.story;
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('storyResult').classList.remove('hidden');

    } catch (error) {
        console.error('Story generation error:', error);
        alert('Failed to create story. Please try again!');
        
        // Reset to prompt
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('storyPrompt').classList.remove('hidden');
    }
}

// Enhanced loading animation
function animateLoadingSteps() {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
            steps[currentStep - 1].classList.add('completed');
        }
        
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 1500); // Slower animation for image generation
    
    return interval;
}

// Update the story generation to use enhanced loading
async function handleGenerateStory() {
    if (!currentChild || !currentUser) return;

    try {
        const response = await fetch(`/api/user/${currentUser.email}`);
        const userData = await response.json();
        const child = userData.children.find(c => c.id === currentChild.id);
        
        if (!child) {
            alert('Child not found');
            return;
        }

        const storyIdea = document.getElementById('storyIdea').value.trim();
        
        // Get customization options
        const storyLength = document.getElementById('storyLength')?.value || 'medium';
        const storyMood = document.getElementById('storyMood')?.value || 'adventurous';
        const includePictures = document.querySelector('input[name="includePictures"]:checked')?.value === 'yes';
        const artStyle = document.getElementById('artStyle')?.value || 'cartoon';
        
        // Get selected adventure type
        const selectedAdventure = document.querySelector('.adventure-btn.selected')?.dataset.type || '';

        // Validate child data and provide fallbacks
        const favoriteBooks = child.favoriteBooks && child.favoriteBooks.length > 0 
            ? child.favoriteBooks 
            : ['General Adventure']; // Fallback if no books selected
        
        const readingLevel = child.readingLevel || 'intermediate';
        const interests = storyIdea || child.interests || 'magical adventures and friendship';

        // Show enhanced loading
        document.getElementById('storyPrompt').classList.add('hidden');
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('storyResult').classList.add('hidden');

        // Start loading animation
        const loadingInterval = animateLoadingSteps();

        // Generate story
        const storyResponse = await fetch('/api/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                childName: child.name,
                age: child.age,
                favoriteBooks: favoriteBooks,
                imagination: interests,
                readingLevel: readingLevel,
                parentEmail: currentUser.email,
                customization: {
                    length: storyLength,
                    mood: storyMood,
                    adventureType: selectedAdventure,
                    includePictures: includePictures,
                    artStyle: artStyle
                }
            })
        });

        const storyData = await storyResponse.json();
        
        if (storyData.error) {
            clearInterval(loadingInterval);
            
            if (storyData.needsUpgrade) {
                // Show upgrade prompt
                document.getElementById('loadingSpinner').classList.add('hidden');
                document.getElementById('storyPrompt').classList.remove('hidden');
                
                showNotification('📚 ' + storyData.error, 'warning');
                
                // Show upgrade option
                const upgradePrompt = document.createElement('div');
                upgradePrompt.className = 'upgrade-prompt';
                upgradePrompt.innerHTML = `
                    <h3>🚀 Upgrade to Create More Stories!</h3>
                    <p>You've reached your monthly story limit. Upgrade to continue creating magical adventures!</p>
                    <button class="btn btn-primary" onclick="showPricing()">View Plans & Upgrade</button>
                `;
                
                const storyPrompt = document.getElementById('storyPrompt');
                storyPrompt.appendChild(upgradePrompt);
                
                return;
            }
            throw new Error(storyData.error);
        }

        // Clear loading interval
        clearInterval(loadingInterval);

        // Open story in new tab with proper formatting
        openStoryInNewTab(storyData, child.name);
        
        // Update child avatar in story result
        const childAvatar = document.querySelector('#storyResult .child-avatar');
        if (childAvatar) {
            childAvatar.textContent = getChildAvatar(child.age);
        }
        
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('storyResult').classList.remove('hidden');

        // Reset rating stars
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
            star.style.opacity = '0.3';
            star.style.transform = 'scale(1)';
        });

        // Reset rating text
        const ratingDiv = document.querySelector('.story-rating');
        if (ratingDiv) {
            ratingDiv.innerHTML = `
                <p>How did <span class="child-name-placeholder">${child.name}</span> like this story?</p>
                <div class="rating-stars">
                    <span class="star" data-rating="1">⭐</span>
                    <span class="star" data-rating="2">⭐</span>
                    <span class="star" data-rating="3">⭐</span>
                    <span class="star" data-rating="4">⭐</span>
                    <span class="star" data-rating="5">⭐</span>
                </div>
            `;
            setupStoryRating(); // Re-setup rating functionality
        }

    } catch (error) {
        console.error('Story generation error:', error);
        alert('Failed to create story. Please try again!');
        
        // Reset to prompt
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('storyPrompt').classList.remove('hidden');
    }
}

// Placeholder functions for dashboard actions
function generateRandomStory() {
    alert('🎲 Random story feature coming soon! For now, select a child to create their personalized story.');
}

function viewStoryLibrary() {
    alert('📖 Story library feature coming soon! All your created stories will be saved here.');
}

function openSettings() {
    alert('⚙️ Settings feature coming soon! You\'ll be able to manage your account preferences here.');
}

// Subscription Functions


async function selectPlan(planId) {
    if (planId === 'free') {
        // Simulate downgrade to free
        try {
            const response = await fetch('/api/downgrade-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: currentUser.email
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification('🎉 Successfully downgraded to Free plan!', 'success');
                currentUser.subscription = { plan: 'free' };
                loadDashboard();
            }
        } catch (error) {
            showNotification('❌ Failed to downgrade plan.', 'error');
        }
        return;
    }

    // Simulate upgrade (no real payment)
    const plan = subscriptionPlans[planId];
    const confirmed = confirm(`🚀 Upgrade to ${plan.name} Plan?\n\nThis is a DEMO - no real payment will be charged.\n\nFeatures:\n${plan.features.join('\n')}\n\nPrice: $${plan.price}/month`);
    
    if (!confirmed) return;

    try {
        const response = await fetch('/api/upgrade-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planId: planId,
                userEmail: currentUser.email
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification(`🎉 Successfully upgraded to ${data.plan} plan! (Demo - no payment charged)`, 'success');
            currentUser.subscription = { plan: data.plan.toLowerCase() };
            loadDashboard();
        } else {
            throw new Error('Failed to upgrade subscription');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showNotification('❌ Failed to upgrade subscription. Please try again.', 'error');
    }
}

// Display story in realistic 3D flipbook format
function displayStoryAsBook(storyData, childName) {
    const storyContent = document.getElementById('storyContent');
    
    // Parse story into individual pages
    const storyText = storyData.story;
    const paragraphs = storyText.split('\n\n').filter(p => p.trim());
    
    // Create individual pages with proper content distribution
    const pages = createBookPages(paragraphs, storyData.images || [], childName);
    
    let bookHTML = `
        <div class="story-book" id="flipbook">
            <div class="book-container">
                <div class="book-spine"></div>
    `;
    
    // Create individual pages that can flip
    pages.forEach((page, index) => {
        const isLeft = index % 2 === 0;
        const zIndex = pages.length - index;
        
        bookHTML += `
            <div class="book-page ${isLeft ? 'left' : 'right'}" 
                 data-page="${index}" 
                 style="z-index: ${zIndex};"
                 onclick="flipPage(${index})">
                <div class="page-content">
                    ${page.content}
                    <div class="page-number ${isLeft ? 'left' : 'right'}">${index === 0 ? '' : index}</div>
                    <div class="page-flip-hint">
                        ${isLeft ? (index > 0 ? 'Click to flip back' : 'Click to start reading') : 'Click to continue'}
                    </div>
                </div>
            </div>
        `;
    });
    
    bookHTML += `
            </div>
            
            <div class="book-controls">
                <button class="page-nav-btn" id="prevBtn" onclick="previousPage()" disabled>
                    ← Previous Page
                </button>
                
                <div class="page-indicator">
                    Page <span id="currentPage">1</span> of <span id="totalPages">${pages.length}</span>
                </div>
                
                <button class="page-nav-btn" id="nextBtn" onclick="nextPage()">
                    Next Page →
                </button>
                
                <button class="auto-flip-btn" id="autoFlipBtn" onclick="toggleAutoFlip()">
                    🎬 Auto Read
                </button>
                
                <button class="page-nav-btn" onclick="printStory()">🖨️ Print</button>
                <button class="page-nav-btn" onclick="shareStory()">📤 Share</button>
            </div>
        </div>
    `;
    
    storyContent.innerHTML = bookHTML;
    
    // Initialize flipbook
    initializeFlipbook(pages.length);
}

// Create individual pages with proper content distribution
function createBookPages(paragraphs, images, childName) {
    const pages = [];
    const maxParagraphsPerPage = 2; // Paragraphs per page for better pacing
    
    // Cover page
    pages.push({
        content: `
            <div class="book-cover">
                <h1 class="book-title">${childName}'s Magical Adventure</h1>
                <p class="book-subtitle">A Personalized Story</p>
                <p class="book-author">Created with StoryMagic AI</p>
                ${images[0] ? 
                    `<img src="${images[0]}" alt="Cover illustration" class="story-image" />` : 
                    '<div class="image-placeholder">🎨 Generating magical cover...</div>'}
            </div>
        `
    });
    
    // Story pages
    let currentPageContent = [];
    let imageIndex = 1; // Start from 1 since 0 is used for cover
    
    paragraphs.forEach((paragraph, index) => {
        currentPageContent.push(paragraph);
        
        // Create new page when we have enough content or reach the end
        if (currentPageContent.length >= maxParagraphsPerPage || index === paragraphs.length - 1) {
            const hasImage = images[imageIndex] && imageIndex < images.length;
            
            const pageContent = `
                ${hasImage ? `<img src="${images[imageIndex]}" alt="Story illustration" class="story-image" />` : 
                  (imageIndex < 4 ? '<div class="image-placeholder">🎨 Story moment illustration...</div>' : '')}
                <div class="story-text">
                    ${currentPageContent.map(p => `<p class="story-paragraph">${p.trim()}</p>`).join('')}
                </div>
            `;
            
            pages.push({ content: pageContent });
            
            // Reset for next page
            currentPageContent = [];
            imageIndex++;
        }
    });
    
    // Ensure we have an even number of pages for proper book layout
    if (pages.length % 2 !== 0) {
        pages.push({
            content: `
                <div style="display: flex; flex-direction: column; justify-content: center; height: 100%; text-align: center;">
                    <h2 style="color: #ff6b9d; margin-bottom: 30px;">The End</h2>
                    <div style="font-size: 48px; margin: 20px 0;">🌟</div>
                    <p style="font-style: italic; color: #666;">Thank you for reading ${childName}'s magical adventure!</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">Created with love by StoryMagic AI</p>
                </div>
            `
        });
    }
    
    return pages;
}

// Realistic flipbook functionality
let currentPageIndex = 0;
let totalPages = 0;
let autoFlipInterval = null;
let flippedPages = new Set(); // Track which pages have been flipped

function initializeFlipbook(pageCount) {
    totalPages = pageCount;
    currentPageIndex = 0;
    flippedPages.clear();
    updatePageIndicator();
    updateNavigationButtons();
}

function flipPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    
    const page = document.querySelector(`[data-page="${pageIndex}"]`);
    if (!page) return;
    
    const isLeft = page.classList.contains('left');
    
    if (isLeft && pageIndex < totalPages - 1) {
        // Flip left page forward
        if (!flippedPages.has(pageIndex)) {
            page.classList.add('flipping-left');
            flippedPages.add(pageIndex);
            currentPageIndex = Math.max(currentPageIndex, pageIndex + 1);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                page.classList.remove('flipping-left');
                page.style.transform = 'rotateY(-180deg)';
                page.style.zIndex = '1';
            }, 1200);
        }
    } else if (!isLeft && pageIndex > 0) {
        // Flip right page backward
        if (flippedPages.has(pageIndex - 1)) {
            const prevPage = document.querySelector(`[data-page="${pageIndex - 1}"]`);
            if (prevPage) {
                prevPage.classList.add('flipping-right');
                flippedPages.delete(pageIndex - 1);
                currentPageIndex = Math.min(currentPageIndex, pageIndex - 1);
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    prevPage.classList.remove('flipping-right');
                    prevPage.style.transform = 'rotateY(0deg)';
                    prevPage.style.zIndex = totalPages - (pageIndex - 1);
                }, 1200);
            }
        }
    }
    
    updatePageIndicator();
    updateNavigationButtons();
}

function nextPage() {
    // Find the next left page that hasn't been flipped
    for (let i = currentPageIndex; i < totalPages; i++) {
        const page = document.querySelector(`[data-page="${i}"]`);
        if (page && page.classList.contains('left') && !flippedPages.has(i)) {
            flipPage(i);
            break;
        }
    }
}

function previousPage() {
    // Find the most recently flipped page and flip it back
    const flippedArray = Array.from(flippedPages).sort((a, b) => b - a);
    if (flippedArray.length > 0) {
        const lastFlipped = flippedArray[0];
        flipPage(lastFlipped + 1); // Flip back by clicking the right page
    }
}

function updatePageIndicator() {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (currentPageSpan) currentPageSpan.textContent = Math.max(1, currentPageIndex);
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = flippedPages.size === 0;
    if (nextBtn) nextBtn.disabled = flippedPages.size >= Math.floor(totalPages / 2);
}

function toggleAutoFlip() {
    const autoFlipBtn = document.getElementById('autoFlipBtn');
    
    if (autoFlipInterval) {
        // Stop auto flip
        clearInterval(autoFlipInterval);
        autoFlipInterval = null;
        autoFlipBtn.textContent = '🎬 Auto Read';
        autoFlipBtn.classList.remove('active');
    } else {
        // Start auto flip
        autoFlipInterval = setInterval(() => {
            if (flippedPages.size < Math.floor(totalPages / 2)) {
                nextPage();
            } else {
                // Restart from beginning
                resetBook();
            }
        }, 6000); // 6 seconds per page
        
        autoFlipBtn.textContent = '⏸️ Stop';
        autoFlipBtn.classList.add('active');
    }
}

function resetBook() {
    // Reset all pages to original position
    flippedPages.forEach(pageIndex => {
        const page = document.querySelector(`[data-page="${pageIndex}"]`);
        if (page) {
            page.style.transform = 'rotateY(0deg)';
            page.style.zIndex = totalPages - pageIndex;
        }
    });
    
    flippedPages.clear();
    currentPageIndex = 0;
    updatePageIndicator();
    updateNavigationButtons();
}

// Open story in new tab with proper formatting
function openStoryInNewTab(storyData, childName) {
    // Prepare story data
    const storyInfo = {
        story: storyData.story,
        images: storyData.images || [],
        childName: childName,
        customization: storyData.customization || {},
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage for the new tab to access
    localStorage.setItem('currentStory', JSON.stringify(storyInfo));
    
    // Open story reader in new tab
    const storyWindow = window.open(
        'story-reader.html',
        '_blank',
        'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=yes,menubar=yes'
    );
    
    // Focus the new window
    if (storyWindow) {
        storyWindow.focus();
        
        // Show success message
        showNotification('📖 Story opened in new tab! Enjoy reading!', 'success');
        
        // Hide loading and show completion message in current tab
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('storyResult').classList.remove('hidden');
        
        // Update story result to show that it opened in new tab
        const storyContent = document.getElementById('storyContent');
        if (storyContent) {
            storyContent.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 220, 0.95)); border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                    <div style="font-size: 4rem; margin-bottom: 2rem;">📖</div>
                    <h2 style="color: #ff6b9d; margin-bottom: 1rem; font-size: 2rem;">Story Ready!</h2>
                    <p style="font-size: 1.2rem; color: #666; margin-bottom: 2rem;">
                        ${childName}'s magical adventure has opened in a new tab with our beautiful book reader!
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="openStoryInNewTab(${JSON.stringify(storyInfo).replace(/"/g, '&quot;')}, '${childName}')" 
                                class="btn btn-primary">
                            📖 Open Story Again
                        </button>
                        <button onclick="loadDashboard()" class="btn btn-secondary">
                            ← Back to Dashboard
                        </button>
                        <button onclick="startStoryCreation('${currentChild?.id}', '${childName}')" 
                                class="btn btn-outline">
                            ✨ Create Another Story
                        </button>
                    </div>
                    <div style="margin-top: 2rem; padding: 1rem; background: rgba(46, 213, 115, 0.1); border-radius: 15px; border-left: 4px solid #2ed573;">
                        <p style="margin: 0; color: #2d3436; font-size: 0.9rem;">
                            <strong>💡 Tip:</strong> The story reader supports keyboard navigation (arrow keys), fullscreen mode, auto-read, and printing!
                        </p>
                    </div>
                </div>
            `;
        }
    } else {
        // Handle popup blocked
        showNotification('❌ Popup blocked! Please allow popups and try again.', 'error');
        
        // Fallback: show story in current tab
        displayStoryAsBook(storyData, childName);
    }
}

// Fallback function for displaying story in current tab (keep the original)
function displayStoryAsBook(storyData, childName) {
    const storyContent = document.getElementById('storyContent');
    
    // Parse story into individual pages
    const storyText = storyData.story;
    const paragraphs = storyText.split('\n\n').filter(p => p.trim());
    
    // Create individual pages with proper content distribution
    const pages = createBookPages(paragraphs, storyData.images || [], childName);
    
    let bookHTML = `
        <div class="story-book" id="flipbook">
            <div class="book-container">
                <div class="book-spine"></div>
    `;
    
    // Create individual pages that can flip
    pages.forEach((page, index) => {
        const isLeft = index % 2 === 0;
        const zIndex = pages.length - index;
        
        bookHTML += `
            <div class="book-page ${isLeft ? 'left' : 'right'}" 
                 data-page="${index}" 
                 style="z-index: ${zIndex};"
                 onclick="flipPage(${index})">
                <div class="page-content">
                    ${page.content}
                    <div class="page-number ${isLeft ? 'left' : 'right'}">${index === 0 ? '' : index}</div>
                    <div class="page-flip-hint">
                        ${isLeft ? (index > 0 ? 'Click to flip back' : 'Click to start reading') : 'Click to continue'}
                    </div>
                </div>
            </div>
        `;
    });
    
    bookHTML += `
            </div>
            
            <div class="book-controls">
                <button class="page-nav-btn" id="prevBtn" onclick="previousPage()" disabled>
                    ← Previous Page
                </button>
                
                <div class="page-indicator">
                    Page <span id="currentPage">1</span> of <span id="totalPages">${pages.length}</span>
                </div>
                
                <button class="page-nav-btn" id="nextBtn" onclick="nextPage()">
                    Next Page →
                </button>
                
                <button class="auto-flip-btn" id="autoFlipBtn" onclick="toggleAutoFlip()">
                    🎬 Auto Read
                </button>
                
                <button class="page-nav-btn" onclick="openStoryInNewTab({story: '${storyData.story.replace(/'/g, "\\'")}', images: ${JSON.stringify(storyData.images || [])}}, '${childName}')">
                    📖 Open in New Tab
                </button>
                
                <button class="page-nav-btn" onclick="printStory()">🖨️ Print</button>
                <button class="page-nav-btn" onclick="shareStory()">📤 Share</button>
            </div>
        </div>
    `;
    
    storyContent.innerHTML = bookHTML;
    
    // Initialize flipbook
    initializeFlipbook(pages.length);
}

// Make functions global for onclick handlers
window.flipPage = flipPage;
window.nextPage = nextPage;
window.previousPage = previousPage;
window.toggleAutoFlip = toggleAutoFlip;
window.resetBook = resetBook;
window.openStoryInNewTab = openStoryInNewTab;

// Print story function
function printStory() {
    const storyContent = document.getElementById('storyContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Story for Print</title>
                <style>
                    body { font-family: Georgia, serif; margin: 20px; }
                    .story-book { box-shadow: none; }
                    .book-cover { background: #f0f0f0 !important; color: #333 !important; }
                    .story-image { max-width: 100%; height: auto; }
                    @media print {
                        .book-navigation { display: none; }
                        .nav-btn { display: none; }
                    }
                </style>
            </head>
            <body>
                ${storyContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function shareStory() {
    if (navigator.share) {
        navigator.share({
            title: 'Amazing Story Created with StoryMagic!',
            text: 'Check out this personalized story I created for my child with StoryMagic AI!',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const storyContent = document.getElementById('storyContent').textContent;
        const shareText = `Amazing story created with StoryMagic!\n\n${storyContent.substring(0, 200)}...`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('📤 Story copied to clipboard! You can now paste and share it.');
            });
        } else {
            alert('📤 Share feature: Copy the story text and share it with friends and family!');
        }
    }
}