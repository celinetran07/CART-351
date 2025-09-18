// CART 351 Journal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeFadeAnimations();
});

function initializeFadeAnimations() {
    const entries = document.querySelectorAll('.journal-entry');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    entries.forEach(entry => {
        observer.observe(entry);
    });
}