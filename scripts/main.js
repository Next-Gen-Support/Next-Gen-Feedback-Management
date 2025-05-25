import { addFeedback, listFeedbacks, deleteFeedback } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const feedbackList = document.getElementById('feedback-list');
    const addFeedbackBtn = document.getElementById('add-feedback-btn');
    const addFeedbackModal = document.getElementById('add-feedback-modal');
    const closeModal = document.getElementById('close-modal');
    const feedbackForm = document.getElementById('feedback-form');
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    const downloadAllBtn = document.getElementById('download-all');
    const notificationBtn = document.getElementById('notification-btn');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    // State
    let feedbacks = [];
    let selectedFeedbacks = [];
    let newFeedbacksCount = 0;
    
    // Load feedbacks from localStorage
    const loadFeedbacksFromStorage = () => {
        const savedFeedbacks = localStorage.getItem('feedbacks');
        return savedFeedbacks ? JSON.parse(savedFeedbacks) : [];
    };
    
    // Save feedbacks to localStorage
    const saveFeedbacksToStorage = (feedbacks) => {
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    };
    
    // Check for new feedbacks
    const checkForNewFeedbacks = (currentFeedbacks) => {
        const savedFeedbacks = loadFeedbacksFromStorage();
        const savedIds = savedFeedbacks.map(f => f.id);
        
        const newFeedbacks = currentFeedbacks.filter(f => !savedIds.includes(f.id));
        newFeedbacksCount = newFeedbacks.length;
        
        if (newFeedbacksCount > 0) {
            notificationBadge.textContent = newFeedbacksCount;
            notificationBadge.classList.remove('hidden');
        } else {
            notificationBadge.classList.add('hidden');
        }
    };
    
    // Decode feedback
    const decodeFeedback = (encoded) => {
        try {
            const decoded = atob(encoded);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error decoding feedback:', error);
            return { error: 'Invalid feedback format' };
        }
    };
    
    // Render feedbacks
    const renderFeedbacks = (feedbacksToRender) => {
        if (feedbacksToRender.length === 0) {
            feedbackList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <p>No feedback available</p>
                </div>
            `;
            return;
        }
        
        feedbackList.innerHTML = '';
        
        feedbacksToRender.forEach(feedback => {
            const feedbackCard = document.createElement('div');
            feedbackCard.className = 'feedback-card';
            feedbackCard.dataset.id = feedback.id;
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.id = `feedback-${feedback.id}`;
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedFeedbacks.push(feedback.id);
                } else {
                    selectedFeedbacks = selectedFeedbacks.filter(id => id !== feedback.id);
                }
                deleteSelectedBtn.disabled = selectedFeedbacks.length === 0;
            });
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = `feedback-${feedback.id}`;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            
            const feedbackContent = document.createElement('div');
            feedbackContent.className = 'feedback-content';
            
            const feedbackTitle = document.createElement('h3');
            feedbackTitle.className = 'feedback-title';
            feedbackTitle.textContent = Object.keys(feedback.data)[0] || 'Feedback';
            
            const feedbackText = document.createElement('p');
            feedbackText.className = 'feedback-text';
            feedbackText.textContent = Object.values(feedback.data)[0] || 'No content';
            
            const feedbackMeta = document.createElement('div');
            feedbackMeta.className = 'feedback-meta';
            
            const feedbackDate = document.createElement('span');
            feedbackDate.textContent = new Date().toLocaleDateString();
            
            feedbackMeta.appendChild(feedbackDate);
            
            feedbackContent.appendChild(feedbackTitle);
            feedbackContent.appendChild(feedbackText);
            feedbackContent.appendChild(feedbackMeta);
            
            feedbackCard.appendChild(checkboxContainer);
            feedbackCard.appendChild(feedbackContent);
            
            feedbackList.appendChild(feedbackCard);
        });
    };
    
    // Fetch and display feedbacks
    const fetchAndDisplayFeedbacks = async () => {
        const response = await listFeedbacks();
        
        if (response.ids && response.ids.length > 0) {
            feedbacks = response.ids.map(id => {
                const decoded = decodeFeedback(id);
                return {
                    id,
                    data: decoded
                };
            });
            
            checkForNewFeedbacks(feedbacks);
            renderFeedbacks(feedbacks);
            saveFeedbacksToStorage(feedbacks);
        } else {
            feedbacks = [];
            renderFeedbacks([]);
        }
    };
    
    // Initialize
    fetchAndDisplayFeedbacks();
    
    // Modal handling
    addFeedbackBtn.addEventListener('click', () => {
        addFeedbackModal.classList.remove('hidden');
    });
    
    closeModal.addEventListener('click', () => {
        addFeedbackModal.classList.add('hidden');
    });
    
    // Form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('feedback-id');
        const contentInput = document.getElementById('feedback-content');
        
        const feedbackData = {
            [idInput.value]: contentInput.value
        };
        
        const encodedFeedback = btoa(JSON.stringify(feedbackData));
        
        const response = await addFeedback(encodedFeedback);
        
        if (response.error) {
            alert(response.error);
        } else {
            alert('Feedback added successfully!');
            feedbackForm.reset();
            addFeedbackModal.classList.add('hidden');
            fetchAndDisplayFeedbacks();
        }
    });
    
    // Select all / deselect all
    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
        selectedFeedbacks = feedbacks.map(f => f.id);
        deleteSelectedBtn.disabled = false;
    });
    
    deselectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        selectedFeedbacks = [];
        deleteSelectedBtn.disabled = true;
    });
    
    // Delete selected
    deleteSelectedBtn.addEventListener('click', async () => {
        if (selectedFeedbacks.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedFeedbacks.length} selected feedback(s)?`)) {
            return;
        }
        
        const deletePromises = selectedFeedbacks.map(id => deleteFeedback(id));
        const results = await Promise.all(deletePromises);
        
        if (results.some(result => result.error)) {
            alert('Some feedbacks could not be deleted. Please try again.');
        } else {
            alert('Selected feedbacks deleted successfully!');
            fetchAndDisplayFeedbacks();
            selectedFeedbacks = [];
            deleteSelectedBtn.disabled = true;
        }
    });
    
    // Download all
    downloadAllBtn.addEventListener('click', () => {
        if (feedbacks.length === 0) {
            alert('No feedbacks to download');
            return;
        }
        
        const dataStr = JSON.stringify(feedbacks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `feedbacks-${new Date().toISOString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    // Notifications
    notificationBtn.addEventListener('click', () => {
        notificationDropdown.classList.toggle('hidden');
        
        if (newFeedbacksCount > 0) {
            // Mark as read
            newFeedbacksCount = 0;
            notificationBadge.classList.add('hidden');
            saveFeedbacksToStorage(feedbacks);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.add('hidden');
        }
    });
    
    // Periodically check for new feedbacks
    setInterval(fetchAndDisplayFeedbacks, 30000); // Every 30 seconds
});
