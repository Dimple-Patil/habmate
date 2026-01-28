/**
 * HabMate - Authentication Module
 * Handles user registration, login, and session management
 */

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkLoginStatus();
    
    // Set up authentication event listeners
    setupAuthListeners();
});

// Check if a user is already logged in
function checkLoginStatus() {
    const currentUser = getStorageItem('currentUser');
    
    if (currentUser) {
        // User is logged in, show app section
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser.username;
    } else {
        // User is not logged in, show auth section
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('appSection').style.display = 'none';
        document.getElementById('currentUser').textContent = 'Guest';
    }
}

// Set up authentication form listeners
function setupAuthListeners() {
    // Tab switching between login and register
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });
        
        registerTab.addEventListener('click', function() {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
    
    // Login form submission
    const loginFormElement = document.getElementById('loginForm');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Register form submission
    const registerFormElement = document.getElementById('registerForm');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle user login
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Demo user (for testing without registration)
    if (email === 'demo@habmate.com') {
        // Create demo user data if it doesn't exist
        let demoUser = getStorageItem('user_demo');
        if (!demoUser) {
            demoUser = {
                id: 'demo_user',
                username: 'Demo User',
                email: 'demo@habmate.com',
                password: 'demo123', // In a real app, passwords should be hashed
                createdAt: new Date().toISOString()
            };
            
            // Save demo user
            setStorageItem('user_demo', demoUser);
            
            // Initialize demo user's habits
            const demoHabits = [
                {
                    id: generateId(),
                    userId: 'demo_user',
                    name: 'Drink 8 glasses of water',
                    category: 'health',
                    timeOfDay: 'anytime',
                    completed: false,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: generateId(),
                    userId: 'demo_user',
                    name: '30 minutes of exercise',
                    category: 'health',
                    timeOfDay: 'morning',
                    completed: true,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: generateId(),
                    userId: 'demo_user',
                    name: 'Read 20 pages',
                    category: 'learning',
                    timeOfDay: 'evening',
                    completed: false,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                }
            ];
            
            setStorageItem('habits_demo_user', demoHabits);
        }
        
        // Log in as demo user
        loginUser(demoUser);
        return;
    }
    
    // Get all users from LocalStorage
    const users = getAllUsers();
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showNotification('User not found. Please register first.', 'error');
        return;
    }
    
    // Check password (in a real app, compare hashed passwords)
    if (user.password !== password) {
        showNotification('Incorrect password', 'error');
        return;
    }
    
    // Login successful
    loginUser(user);
}

// Handle user registration
function handleRegistration() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    
    // Basic validation
    if (!username || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get all users from LocalStorage
    const users = getAllUsers();
    
    // Check if email already exists
    const emailExists = users.some(u => u.email === email);
    if (emailExists) {
        showNotification('Email already registered. Please login instead.', 'error');
        return;
    }
    
    // Check if username already exists
    const usernameExists = users.some(u => u.username === username);
    if (usernameExists) {
        showNotification('Username already taken. Please choose another.', 'error');
        return;
    }
    
    // Create new user object
    const newUser = {
        id: generateId(),
        username: username,
        email: email,
        password: password, // In a real app, hash the password
        createdAt: new Date().toISOString(),
        followers: [],
        following: []
    };
    
    // Save user to LocalStorage
    saveUser(newUser);
    
    // Create empty habits array for the new user
    setStorageItem(`habits_${newUser.id}`, []);
    
    // Auto login after registration
    loginUser(newUser);
    
    showNotification('Account created successfully!', 'success');
}

// Login user and set session
function loginUser(user) {
    // Save user to current session
    setStorageItem('currentUser', user);
    
    // Update UI
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('currentUser').textContent = user.username;
    
    // Show dashboard
    showView('dashboardView');
    loadDashboard();
    
    // Reset login form
    document.getElementById('loginForm').reset();
    
    showNotification(`Welcome back, ${user.username}!`, 'success');
}

// Handle user logout
function handleLogout() {
    // Clear current user from LocalStorage
    removeStorageItem('currentUser');
    
    // Update UI
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('appSection').style.display = 'none';
    document.getElementById('currentUser').textContent = 'Guest';
    
    // Switch to login tab
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    showNotification('You have been logged out', 'info');
}

// Get all registered users from LocalStorage
function getAllUsers() {
    const users = [];
    
    // Get all keys from LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check if key is a user (starts with 'user_')
        if (key.startsWith('user_')) {
            const user = getStorageItem(key);
            if (user) {
                users.push(user);
            }
        }
    }
    
    return users;
}

// Save a user to LocalStorage
function saveUser(user) {
    setStorageItem(`user_${user.id}`, user);
}

// Get a user by ID
function getUserById(userId) {
    return getStorageItem(`user_${userId}`);
}

// Get a user by email
function getUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

// Get a user by username
function getUserByUsername(username) {
    const users = getAllUsers();
    return users.find(u => u.username === username);
}