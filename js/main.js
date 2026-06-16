/**
 * UI Application Engine
 * Architecture: Clean Vanilla ES6+ Modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Helper: Debounce function to limit unthrottled layout execution loops
    const debounce = (func, delay = 100) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // ── 1. NAVIGATION SCROLL CONTROL
    const initNavScroll = () => {
        const nav = document.getElementById('nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    };

    // ── 2. MOBILE NAVIGATION DRAWER
    const initMobileNav = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (!navToggle || !navLinks) return;

        const toggleMenu = (open) => {
            navToggle.setAttribute('aria-expanded', String(open));
            navLinks.classList.toggle('open', open);
        };

        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            toggleMenu(!isExpanded);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768) toggleMenu(false);
        }));
    };

    // ── 3. HERO INFINITE CAROUSEL
    const initHeroCarousel = () => {
        const container = document.querySelector('.hero-slides');
        if (!container) return;

        const slides = Array.from(container.querySelectorAll('.hero-carousel-slide'));
        if (!slides.length) return;

        let index = 0;
        let timer = null;

        const goToSlide = (i) => {
            index = (i + slides.length) % slides.length;
            container.style.transform = `translateX(${-index * 100}%)`;
        };

        const startAutoplay = () => {
            if (!timer) timer = setInterval(() => goToSlide(index + 1), 4500);
        };

        const stopAutoplay = () => {
            if (timer) { clearInterval(timer); timer = null; }
        };

        container.style.transition = 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)';

        window.addEventListener('resize', debounce(() => goToSlide(index)));

        const wrapper = container.parentElement || container;
        wrapper.addEventListener('mouseenter', stopAutoplay);
        wrapper.addEventListener('mouseleave', startAutoplay);

        startAutoplay();
    };

    // ── 4. PERFORMANCE SCROLL REVEAL (INTERSECTION OBSERVER)
    const initScrollReveal = () => {
        const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(target => observer.observe(target));
    };

    // ── 5. ASYNCHRONOUS STAT COUNTERS
    const initStatCounters = () => {
        const counters = document.querySelectorAll('.stat-num');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const targetNum = parseInt(el.dataset.count, 10);
                const container = el.querySelector('.count-num');
                if (!targetNum || !container) return;

                let count = 0;
                const duration = 1800; 
                const frameRate = 1000 / 60;
                const totalFrames = Math.round(duration / frameRate);
                const step = targetNum / totalFrames;

                const counterLoop = setInterval(() => {
                    count += step;
                    if (count >= targetNum) {
                        container.textContent = targetNum;
                        clearInterval(counterLoop);
                    } else {
                        container.textContent = Math.floor(count);
                    }
                }, frameRate);

                observer.unobserve(el);
            });
        }, { threshold: 0.3 });

        counters.forEach(el => observer.observe(el));
    };

    // ── 6. COOKIE COMPLIANCE ENGINE
    const initCookieBanner = () => {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;

        // COMMENT OR REMOVE THIS LINE LATER TO SAVE PERMANENT CHOICE:
        localStorage.removeItem('cookieConsent'); 

        // Checks if user already clicked it in a past session
        if (localStorage.getItem('cookieConsent')) {
            banner.style.display = 'none';
            return;
        } else {
            banner.style.display = 'flex';
        }

        const handleConsent = (status) => {
            localStorage.setItem('cookieConsent', status);
            banner.style.display = 'none';
        };

        const acceptBtn = document.getElementById('cookieAccept');
        const rejectBtn = document.getElementById('cookieReject');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleConsent('accepted');
            });
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleConsent('rejected');
            });
        }
    };

    // ── 7. REVIEWS FLEX CAROUSEL
    const initReviewsCarousel = () => {
        const track = document.querySelector('.reviews-track');
        if (!track) return;

        const cards = Array.from(track.children);
        if (!cards.length) return;

        let index = 0;
        let isCarouselInView = false;
        const prevBtn = document.querySelector('.arrow-btn[data-dir="prev"]');
        const nextBtn = document.querySelector('.arrow-btn[data-dir="next"]');

        const updatePosition = () => {
            const gap = parseFloat(getComputedStyle(track).gap) || 16;
            const cardWidth = cards[0].getBoundingClientRect().width;
            track.style.transform = `translateX(${-index * (cardWidth + gap)}px)`;
        };

        const slidePrev = () => { index = Math.max(0, index - 1); updatePosition(); };
        const slideNext = () => { index = Math.min(cards.length - 1, index + 1); updatePosition(); };

        prevBtn?.addEventListener('click', slidePrev);
        nextBtn?.addEventListener('click', slideNext);

        const visibilityObserver = new IntersectionObserver(([entry]) => {
            isCarouselInView = entry.isIntersecting;
        }, { threshold: 0.15 });
        visibilityObserver.observe(track);

        document.addEventListener('keydown', (e) => {
            if (!isCarouselInView) return;
            if (e.key === 'ArrowLeft') slidePrev();
            if (e.key === 'ArrowRight') slideNext();
        });

        track.style.transition = 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)';
        window.addEventListener('resize', debounce(updatePosition));

        setTimeout(updatePosition, 50);
    };

    // Initialize Modules safely
    initNavScroll();
    initMobileNav();
    initHeroCarousel();
    initScrollReveal();
    initStatCounters();
    initCookieBanner();
    initReviewsCarousel();
});