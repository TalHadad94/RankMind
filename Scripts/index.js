// Get references to the main button and the sub-buttons container
const mainContactButton = document.getElementById('mainContactButton');
const subButtonsContainer = document.getElementById('subButtonsContainer');

// Function to toggle the visibility of sub-buttons
function toggleSubButtons() {
    subButtonsContainer.classList.toggle('active');
}

// Add click event listener to the main button
mainContactButton.addEventListener('click', toggleSubButtons);

// Optional: Close sub-buttons when clicking outside
document.addEventListener('click', (event) => {
    // Check if the click was outside the contact container
    const contactContainer = document.querySelector('.contact-container');
    if (!contactContainer.contains(event.target) && subButtonsContainer.classList.contains('active')) {
        subButtonsContainer.classList.remove('active');
    }
});