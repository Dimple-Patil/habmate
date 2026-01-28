/**
 * HabMate - Social Features Module
 * Handles user search, follow/unfollow functionality
 */

// Initialize social module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Set up social event listeners
    setupSocialListeners();
    
    // Load following list if on explore page
    if (document.getElementById('exploreView').style.display !== 'none') {
        loadFollowingList();
    }
});

// Set up social event listeners
function setupSocialListeners() {
    // User search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleUserSearch);
    }
    
    // User search on Enter key
    const userSearchInput = document.getElementById('userSearch');
    if (userSearchInput) {
        userSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleUserSearch();
            }
        });
    }
}

// Handle user search
function handleUserSearch() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) {
        showNotification('Please login to search users', 'error');
        return;
    }
    
    const searchTerm = document.getElementById('userSearch').value.trim();
    
    if (!searchTerm) {
        showNotification('Please enter a username or email to search', 'error');
        return;
    }
    
    // Get all users
    const allUsers = getAllUsers();
    
    // Filter out current user
    const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
    
    // Search by username or email (case-insensitive)
    const searchResults = otherUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Display results
    displaySearchResults(searchResults, currentUser.id);
}

// Display user search results
function displaySearchResults(users, currentUserId) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (users.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h4>No users found</h4>
                <p>Try searching with a different username or email address.</p>
            </div>
        `;
        return;
    }
    
    // Create result elements
    users.forEach(user => {
        const userElement = createUserResultElement(user, currentUserId);
        resultsContainer.appendChild(userElement);
    });
}

// Create HTML element for a user search result
function createUserResultElement(user, currentUserId) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-result';
    
    // Get current user's following list
    const currentUser = getUserById(currentUserId);
    const isFollowing = currentUser.following && currentUser.following.includes(user.id);
    
    // Get user's habits to show count
    const userHabits = getUserHabits(user.id);
    const habitCount = userHabits.length;
    
    userDiv.innerHTML = `
        <div class="user-details">
            <h4>${user.username}</h4>
            <p>${user.email} • ${habitCount} habit${habitCount !== 1 ? 's' : ''}</p>
        </div>
        <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} follow-btn" data-userid="${user.id}">
            ${isFollowing ? 'Unfollow' : 'Follow'}
        </button>
    `;
    
    // Add event listener to follow/unfollow button
    const followBtn = userDiv.querySelector('.follow-btn');
    followBtn.addEventListener('click', function() {
        toggleFollow(user.id);
    });
    
    return userDiv;
}

// Toggle follow/unfollow for a user
function toggleFollow(targetUserId) {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    // Get target user
    const targetUser = getUserById(targetUserId);
    if (!targetUser) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Can't follow yourself
    if (targetUserId === currentUser.id) {
        showNotification('You cannot follow yourself', 'error');
        return;
    }
    
    // Initialize following/followers arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];
    
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
        
        showNotification(`You unfollowed ${targetUser.username}`, 'info');
    } else {
        // Follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUser.id);
        
        showNotification(`You are now following ${targetUser.username}`, 'success');
    }
    
    // Save both users
    saveUser(currentUser);
    saveUser(targetUser);
    
    // Update current user in session
    setStorageItem('currentUser', currentUser);
    
    // Refresh UI
    if (document.getElementById('exploreView').style.display !== 'none') {
        // Reload search results and following list
        handleUserSearch();
        loadFollowingList();
    }
    
    // Refresh feed if on feed page
    if (document.getElementById('feedView').style.display !== 'none') {
        loadCommunityFeed();
    }
}

// Load and display users that current user is following
function loadFollowingList() {
    const currentUser = getStorageItem('currentUser');
    if (!currentUser) return;
    
    const followingList = document.getElementById('followingList');
    if (!followingList) return;
    
    // Clear list
    followingList.innerHTML = '';
    
    // Check if user is following anyone
    if (!currentUser.following || currentUser.following.length === 0) {
        followingList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends fa-2x"></i>
                <h4>Not following anyone yet</h4>
                <p>Search for users above and follow them to see their progress in your feed.</p>
            </div>
        `;
        return;
    }
    
    // Add each followed user to the list
    currentUser.following.forEach(userId => {
        const user = getUserById(userId);
        if (user) {
            const followingItem = createFollowingItem(user);
            followingList.appendChild(followingItem);
        }
    });
}

// Create HTML element for a following list item
function createFollowingItem(user) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'following-item';
    
    // Get user's habits to calculate progress
    const userHabits = getUserHabits(user.id);
    const completedCount = userHabits.filter(h => h.completed).length;
    const totalCount = userHabits.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    itemDiv.innerHTML = `
        <div class="user-details">
            <h4>${user.username}</h4>
            <p>${progressPercentage}% completed today</p>
        </div>
        <button class="btn btn-secondary unfollow-btn" data-userid="${user.id}">
            Unfollow
        </button>
    `;
    
    // Add event listener to unfollow button
    const unfollowBtn = itemDiv.querySelector('.unfollow-btn');
    unfollowBtn.addEventListener('click', function() {
        toggleFollow(user.id);
    });
    
    return itemDiv;
}

// Get users that the current user is following
function getFollowingUsers(currentUserId) {
    const currentUser = getUserById(currentUserId);
    if (!currentUser || !currentUser.following) return [];
    
    return currentUser.following.map(userId => getUserById(userId)).filter(user => user !== null);
}