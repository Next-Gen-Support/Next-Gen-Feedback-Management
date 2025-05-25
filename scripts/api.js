const API_BASE_URL = 'https://next-gen-feedback-server.vercel.app/api';

// Function to add feedback
export const addFeedback = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/add.js`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error adding feedback:', error);
        return { error: 'Failed to add feedback' };
    }
};

// Function to list all feedbacks
export const listFeedbacks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/list.js`, {
            method: 'GET',
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error listing feedbacks:', error);
        return { ids: [] };
    }
};

// Function to delete feedback
export const deleteFeedback = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/delete.js`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return { error: 'Failed to delete feedback' };
    }
};
