/**
 * HabMate - Habit Management Module
 * Handles creating, updating, deleting, and tracking habits
 */

// Initialize habits module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getStorageItem('currentUser');
    
    // Set up habit-related event listeners
    setupHabitListeners();
    
    if (currentUser) {
        // Check if habits need to be reset for a new day
        checkAndResetHabits();
    }
});

// Set up habit-related event listeners
function setupHabitListeners() {
    // Add habit button
    const addHabitBtn = document.getElementById('addHabitBtn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', function() {
            document.getElementById('addHabitModal').style.display = 'flex';
        });
    }
    
    // Habit form submission
    const habitForm = document.getElementById('habitForm');
    if (habitForm) {
        habitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddHabit();
        });
    }
    
    // Close modal when clicking outside or on close button
    const modal = document.getElementById('addHabitModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (modal) modal.style.display = 'none';
        });
    });
}

// Handle adding a new habit
function handleAddHabit() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) {
        showNotification('Please login to add habits', 'error');
        return;
    }
    
    // Get form values
    const name = document.getElementById('habitName').value.trim();
    const timeOfDay = document.getElementById('habitTime').value;
    const category = document.getElementById('habitCategory').value;
    
    // Validate
    if (!name) {
        showNotification('Please enter a habit name', 'error');
        return;
    }
    
    // Create new habit object
    const newHabit = {
        id: generateId(),
        userId: currentUser.id,
        name: name,
        timeOfDay: timeOfDay,
        category: category,
        completed: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        // Track completion history
        history: []
    };
    
    // Get current user's habits
    const userHabits = getUserHabits(currentUser.id);
    
    // Add new habit
    userHabits.push(newHabit);
    
    // Save to LocalStorage
    setStorageItem(`habits_${currentUser.id}`, userHabits);
    
    // Close modal and reset form
    const modal = document.getElementById('addHabitModal');
    if (modal) modal.style.display = 'none';
    
    const habitForm = document.getElementById('habitForm');
    if (habitForm) habitForm.reset();
    
    // Refresh habits list
    loadHabits();
    
    // Update progress
    updateProgress();
    
    showNotification('Habit added successfully!', 'success');
}

// Load and display user's habits
function loadHabits() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get user's habits
    const habits = getUserHabits(currentUser.id);
    
    // Get container element
    const habitsList = document.getElementById('habitsList');
    if (!habitsList) return;
    
    // Clear container
    habitsList.innerHTML = '';
    
    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-clipboard-list fa-3x" style="color: var(--gray-color); margin-bottom: 20px;"></i>
                <h4 style="color: var(--gray-color); margin-bottom: 10px;">No habits yet</h4>
                <p style="color: var(--gray-color);">Start by adding your first habit using the "Add New Habit" button above.</p>
            </div>
        `;
        return;
    }
    
    // Add each habit to the list
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit);
        habitsList.appendChild(habitElement);
    });
}

// Create HTML element for a habit
function createHabitElement(habit) {
    const habitCard = document.createElement('div');
    habitCard.className = 'habit-card';
    habitCard.dataset.id = habit.id;
    
    // Determine category icon
    let categoryIcon = 'fas fa-star';
    let categoryText = 'Other';
    if (habit.category === 'health') {
        categoryIcon = 'fas fa-heartbeat';
        categoryText = 'Health & Fitness';
    } else if (habit.category === 'learning') {
        categoryIcon = 'fas fa-book';
        categoryText = 'Learning';
    } else if (habit.category === 'productivity') {
        categoryIcon = 'fas fa-briefcase';
        categoryText = 'Productivity';
    } else if (habit.category === 'mindfulness') {
        categoryIcon = 'fas fa-spa';
        categoryText = 'Mindfulness';
    }
    
    // Determine time icon
    let timeIcon = 'fas fa-clock';
    let timeText = 'Anytime';
    if (habit.timeOfDay === 'morning') {
        timeIcon = 'fas fa-sun';
        timeText = 'Morning';
    } else if (habit.timeOfDay === 'afternoon') {
        timeIcon = 'fas fa-sun';
        timeText = 'Afternoon';
    } else if (habit.timeOfDay === 'evening') {
        timeIcon = 'fas fa-moon';
        timeText = 'Evening';
    }
    
    // Determine status button text and class
    const statusText = habit.completed ? 'Completed' : 'Pending';
    const statusClass = habit.completed ? 'status-completed' : 'status-pending';
    
    habitCard.innerHTML = `
        <div class="habit-info">
            <h4>${habit.name}</h4>
            <div class="habit-meta">
                <span><i class="${categoryIcon}"></i> ${categoryText}</span>
                <span><i class="${timeIcon}"></i> ${timeText}</span>
            </div>
        </div>
        <div class="habit-actions">
            <button class="habit-status ${statusClass}" data-id="${habit.id}">
                ${statusText}
            </button>
            <button class="btn-icon delete-habit" data-id="${habit.id}" title="Delete habit">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const statusBtn = habitCard.querySelector('.habit-status');
    statusBtn.addEventListener('click', function() {
        toggleHabitStatus(habit.id);
    });
    
    const deleteBtn = habitCard.querySelector('.delete-habit');
    deleteBtn.addEventListener('click', function() {
        deleteHabit(habit.id);
    });
    
    return habitCard;
}

// Toggle habit completion status
function toggleHabitStatus(habitId) {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get user's habits
    const habits = getUserHabits(currentUser.id);
    
    // Find the habit
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    // Toggle completion status
    habits[habitIndex].completed = !habits[habitIndex].completed;
    habits[habitIndex].lastUpdated = new Date().toISOString();
    
    // Add to history if completed
    if (habits[habitIndex].completed) {
        if (!habits[habitIndex].history) {
            habits[habitIndex].history = [];
        }
        habits[habitIndex].history.push(new Date().toISOString());
    }
    
    // Save to LocalStorage
    setStorageItem(`habits_${currentUser.id}`, habits);
    
    // Update UI
    loadHabits();
    updateProgress();
    
    // Show notification
    const status = habits[habitIndex].completed ? 'completed' : 'marked as pending';
    showNotification(`Habit "${habits[habitIndex].name}" ${status}!`, 'success');
}

// Delete a habit
function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get user's habits
    const habits = getUserHabits(currentUser.id);
    
    // Filter out the habit to delete
    const updatedHabits = habits.filter(h => h.id !== habitId);
    
    // Save to LocalStorage
    setStorageItem(`habits_${currentUser.id}`, updatedHabits);
    
    // Update UI
    loadHabits();
    updateProgress();
    
    showNotification('Habit deleted successfully', 'info');
}

// Get user's habits from LocalStorage
function getUserHabits(userId) {
    const habits = getStorageItem(`habits_${userId}`) || [];
    
    // Ensure each habit has the required properties
    return habits.map(habit => {
        return {
            id: habit.id || generateId(),
            userId: habit.userId || userId,
            name: habit.name || 'Unnamed Habit',
            timeOfDay: habit.timeOfDay || 'anytime',
            category: habit.category || 'other',
            completed: habit.completed || false,
            createdAt: habit.createdAt || new Date().toISOString(),
            lastUpdated: habit.lastUpdated || new Date().toISOString(),
            history: habit.history || []
        };
    });
}

// Update progress display
function updateProgress() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get user's habits
    const habits = getUserHabits(currentUser.id);
    
    if (habits.length === 0) {
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressFill').textContent = '0%';
        document.getElementById('progressText').textContent = '0 of 0 habits completed';
        return;
    }
    
    // Calculate completion percentage
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        progressFill.textContent = `${percentage}%`;
    }
    
    // Update progress text
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${completedCount} of ${totalCount} habits completed`;
    }
}

// Check if habits need to be reset for a new day
function checkAndResetHabits() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get today's date (at midnight)
    const today = getToday();
    
    // Get the last reset date from LocalStorage
    const lastResetKey = `lastReset_${currentUser.id}`;
    const lastReset = getStorageItem(lastResetKey);
    
    // If no last reset date or last reset was before today, reset habits
    if (!lastReset || !isSameDay(new Date(lastReset), today)) {
        resetDailyHabits(currentUser.id);
        setStorageItem(lastResetKey, today.toISOString());
    }
}

// Reset all habits to not completed for the new day
function resetDailyHabits(userId) {
    const habits = getUserHabits(userId);
    
    // Only reset if there are habits
    if (habits.length === 0) return;
    
    // Check if any habits were completed yesterday
    const hadCompletedHabits = habits.some(h => h.completed);
    
    // Reset all habits to not completed
    const resetHabits = habits.map(habit => {
        return {
            ...habit,
            completed: false,
            lastUpdated: new Date().toISOString()
        };
    });
    
    // Save reset habits
    setStorageItem(`habits_${userId}`, resetHabits);
    
    // Show notification if habits were reset
    if (hadCompletedHabits) {
        showNotification('A new day has started! All habits have been reset.', 'info');
    }
    
    // Update UI if user is on dashboard
    const dashboardView = document.getElementById('dashboardView');
    if (dashboardView && dashboardView.style.display !== 'none') {
        loadHabits();
        updateProgress();
    }
}

// Load motivational quote for dashboard
function loadMotivationalQuote() {
    displayMotivationalQuote('dashboardQuote');
}