// Background animation initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set up theme selector
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            document.getElementById('theme-selector').classList.add('hidden');
        });
    });
    
    // Theme toggle button
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.getElementById('theme-selector').classList.toggle('hidden');
    });
    
    // Close theme selector
    document.getElementById('close-theme-selector').addEventListener('click', () => {
        document.getElementById('theme-selector').classList.add('hidden');
    });
});
