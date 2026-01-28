/**
 * HabMate - Community Feed Module
 * Displays followed users' progress in a feed
 */

// Initialize feed module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Set up feed event listeners
    setupFeedListeners();
});

// Set up feed event listeners
function setupFeedListeners() {
    // Refresh feed button
    const refreshBtn = document.getElementById('refreshFeedBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCommunityFeed);
    }
}

// Load and display community feed
function loadCommunityFeed() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;
    
    // Clear feed
    feedContainer.innerHTML = '';
    
    // Get users that current user is following
    const followingUsers = getFollowingUsers(currentUser.id);
    
    if (followingUsers.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users fa-3x"></i>
                <h4>Your feed is empty</h4>
                <p>Follow other users to see their progress here.</p>
                <a href="#" id="goToExplore" class="btn btn-primary" style="margin-top: 15px;">
                    Explore Users
                </a>
            </div>
        `;
        
        // Add event listener to "Explore Users" button
        const goToExploreBtn = document.getElementById('goToExplore');
        if (goToExploreBtn) {
            goToExploreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showView('exploreView');
                loadExplore();
            });
        }
        
        return;
    }
    
    // Add each followed user's progress to the feed
    followingUsers.forEach(user => {
        const feedCard = createFeedCard(user);
        feedContainer.appendChild(feedCard);
    });
}

// Create a feed card for a user
function createFeedCard(user) {
    // Get user's habits
    const userHabits = getUserHabits(user.id);
    
    // Calculate progress
    const completedCount = userHabits.filter(h => h.completed).length;
    const totalCount = userHabits.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'user-card';
    
    // Build habits list HTML
    let habitsHtml = '';
    if (userHabits.length === 0) {
        habitsHtml = '<p class="no-habits">No habits added yet.</p>';
    } else {
        // Show only up to 5 habits
        const habitsToShow = userHabits.slice(0, 5);
        
        habitsHtml = habitsToShow.map(habit => {
            const statusIcon = habit.completed ? 'fas fa-check-circle text-success' : 'fas fa-clock text-warning';
            const statusText = habit.completed ? 'Completed' : 'Pending';
            
            return `
                <div class="user-habit-item">
                    <span>${habit.name}</span>
                    <span><i class="${statusIcon}"></i> ${statusText}</span>
                </div>
            `;
        }).join('');
        
        // Show "and X more" if there are more habits
        if (userHabits.length > 5) {
            habitsHtml += `
                <div class="user-habit-item">
                    <span>and ${userHabits.length - 5} more habit${userHabits.length - 5 !== 1 ? 's' : ''}</span>
                </div>
            `;
        }
    }
    
    // Determine progress color
    let progressColor = 'var(--warning-color)';
    if (progressPercentage >= 80) progressColor = 'var(--success-color)';
    else if (progressPercentage >= 50) progressColor = 'var(--accent-color)';
    
    card.innerHTML = `
        <div class="user-header">
            <div>
                <h4>${user.username}</h4>
                <p>${user.email}</p>
            </div>
            <div class="progress-circle" style="width: 50px; height: 50px; border-radius: 50%; background: conic-gradient(${progressColor} ${progressPercentage}%, #eee ${progressPercentage}%); display: flex; align-items: center; justify-content: center;">
                <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <span style="font-weight: 600;">${progressPercentage}%</span>
                </div>
            </div>
        </div>
        <div class="user-habits">
            <h5>Today's Habits</h5>
            ${habitsHtml}
        </div>
        <div class="user-progress">
            <div style="display: flex; justify-content: space-between;">
                <span>Daily Progress</span>
                <span>${completedCount}/${totalCount} completed</span>
            </div>
        </div>
    `;
    
    return card;
}