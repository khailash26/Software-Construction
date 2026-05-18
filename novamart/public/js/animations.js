let scrollObserver;

// Initialize Intersection Observer for Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    refreshAnimations();
}

// Re-scan and observe new elements
function refreshAnimations() {
    if (!scrollObserver) return;

    // Track staggered children
    document.querySelectorAll('.stagger-container').forEach(container => {
        const children = container.querySelectorAll('.reveal, .fade-up, .fade-in');
        children.forEach((child, index) => {
            child.style.setProperty('--stagger-idx', index);
        });
    });

    document.querySelectorAll('.reveal, .fade-up, .fade-in, .fade-left, .fade-right').forEach(el => {
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
        scrollObserver.observe(el);
    });
}

// Scroll-based Parallax Effect
function initScrollParallax() {
    const parallaxEls = document.querySelectorAll('.parallax-bg');
    if (parallaxEls.length === 0) return;

    let scrollY = window.scrollY;
    
    const updateParallax = () => {
        scrollY = window.scrollY;
        parallaxEls.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
}

// Global Loader Hide
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initScrollParallax();
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    setTimeout(hideLoader, 1000);
});
