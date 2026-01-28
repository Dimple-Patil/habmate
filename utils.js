/**
 * HabMate - Utility Functions
 * Contains helper functions used across the application
 */

// Generate a unique ID for new items
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date to display nicely
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Check if two dates are the same day (ignoring time)
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Get today's date at midnight (for comparison)
function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

// Get data from LocalStorage
function getStorageItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from LocalStorage:', error);
        return null;
    }
}

// Save data to LocalStorage
function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error writing to LocalStorage:', error);
        return false;
    }
}

// Remove data from LocalStorage
function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from LocalStorage:', error);
        return false;
    }
}

// Show notification message to user
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--box-shadow)';
    notification.style.zIndex = '1000';
    notification.style.fontWeight = '600';
    notification.style.maxWidth = '300px';
    
    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success-color)';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'var(--danger-color)';
        notification.style.color = 'white';
    } else if (type === 'warning') {
        notification.style.backgroundColor = 'var(--warning-color)';
        notification.style.color = 'var(--dark-color)';
    } else {
        notification.style.backgroundColor = 'var(--primary-color)';
        notification.style.color = 'white';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Toggle theme between light and dark mode
function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon';
        setStorageItem('habmate-theme', 'light');
        showNotification('Switched to light mode', 'info');
    } else {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
        setStorageItem('habmate-theme', 'dark');
        showNotification('Switched to dark mode', 'info');
    }
}

// Initialize theme from LocalStorage
function initTheme() {
    const savedTheme = getStorageItem('habmate-theme') || 'light';
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon';
    }
    
    // Add event listener to theme toggle button
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// Array of motivational quotes
const motivationalQuotes = [
    { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
    { quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "The best way to predict your future is to create it.", author: "Peter Drucker" },
    { quote: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
    { quote: "Every day is a chance to be better than yesterday.", author: "Unknown" },
    { quote: "Your habits determine your future.", author: "Jack Canfield" },
    { quote: "Consistency is the key to achieving your goals.", author: "Unknown" },
    { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { quote: "Good habits are the foundation of success.", author: "Brian Tracy" }
];

// Get a random motivational quote
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
}

// Display a motivational quote
function displayMotivationalQuote(elementId = 'motivationalQuote', authorId = 'quoteAuthor') {
    const quoteElement = document.getElementById(elementId);
    const authorElement = document.getElementById(authorId);
    
    if (quoteElement && authorElement) {
        const randomQuote = getRandomQuote();
        quoteElement.textContent = `"${randomQuote.quote}"`;
        authorElement.textContent = `- ${randomQuote.author}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Display initial motivational quote
    displayMotivationalQuote();
    
    // Add event listener for new quote button
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', function() {
            displayMotivationalQuote('dashboardQuote');
        });
    }
});