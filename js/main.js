/**
 * UI Application Engine
 * Architecture: Clean Vanilla ES6+ Modules
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── HELPER: True Context-Preserving Debounce
    const debounce = (func, delay = 100) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
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
        const dots = document.querySelectorAll('.hero-dot');

        const goToSlide = (i) => {
            index = (i + slides.length) % slides.length;
            container.style.transform = `translateX(${-index * 100}%)`;
            dots.forEach((dot, di) => {
                dot.classList.toggle('active', di === index);
            });
        };

        const startAutoplay = () => {
            if (!timer) timer = setInterval(() => goToSlide(index + 1), 4500);
        };

        const stopAutoplay = () => {
            if (timer) { clearInterval(timer); timer = null; }
        };

        dots.forEach((dot, di) => {
            dot.addEventListener('click', () => {
                goToSlide(di);
                stopAutoplay();
                startAutoplay();
            });
        });

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

        document.getElementById('cookieAccept')?.addEventListener('click', (e) => {
            e.preventDefault();
            handleConsent('accepted');
        });

        document.getElementById('cookieReject')?.addEventListener('click', (e) => {
            e.preventDefault();
            handleConsent('rejected');
        });
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
            if (cards[0].getBoundingClientRect().width === 0) return;
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

        setTimeout(updatePosition, 100);
    };

    // ── 8. POP-UP FAQ ACCORDION ENGINE (Matched to fb9bc22c-9703-4fb6-90ab-37a04cbee7be styling)
    const initFaqModal = () => {
        const openBtn = document.getElementById('openFaqBtn');
        const modal = document.getElementById('faqModal');
        const closeBtn = document.getElementById('closeFaqBtn');
        const overlay = document.getElementById('closeFaqOverlay');

        if (!modal || !openBtn) return;

        modal.classList.remove('open');
        modal.setAttribute('inert', '');

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('inert', '');
            document.body.style.overflow = '';
            openBtn.focus();
        };

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.classList.add('open');
            modal.removeAttribute('inert');
            document.body.style.overflow = 'hidden';
            closeBtn?.focus();
        });

        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);

        // Targeted exact matching mappings for your active CSS properties
        const faqButtons = modal.querySelectorAll('.faq-question-btn');

        faqButtons.forEach(btn => {
            // Isolates child clicks (like the chevrons/text spans) from confusing event targets
            const descendants = btn.querySelectorAll('*');
            descendants.forEach(child => {
                child.style.pointerEvents = 'none';
            });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                const nextPanel = btn.nextElementSibling;

                // 1. Collapse all currently opened accordion menus first
                faqButtons.forEach(otherBtn => {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    const otherPanel = otherBtn.nextElementSibling;
                    if (otherPanel && otherPanel.classList.contains('faq-answer-panel')) {
                        otherPanel.style.maxHeight = null;
                    }
                });

                // 2. Open this element cleanly if it wasn't already open
                if (!isExpanded) {
                    btn.setAttribute('aria-expanded', 'true');
                    if (nextPanel && nextPanel.classList.contains('faq-answer-panel')) {
                        // Dynamically sets standard scroll height layouts matching your transitions
                        nextPanel.style.maxHeight = nextPanel.scrollHeight + "px";
                    }
                }
            });
        });
    };

    // ── 9. INTERACTIVE ASSESSMENT FORM HANDLER
    const initAssessmentForm = () => {
        const form = document.getElementById('assessmentForm');
        const modal = document.getElementById('faqModal');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            console.log("Form successfully submitted! Data captured:", payload);

            alert("Grazie! La tua valutazione iniziale è stata inviata con successo. Ti ricontatteremo entro 24 ore.");

            form.reset();
            if (modal) {
                modal.classList.remove('open');
                modal.setAttribute('inert', '');
                document.body.style.overflow = '';
                document.getElementById('openFaqBtn')?.focus();
            }
        });
    };

    // Execution Life Cycle
    initNavScroll();
    initMobileNav();
    initHeroCarousel();
    initScrollReveal();
    initStatCounters();
    initCookieBanner();
    initReviewsCarousel();
    initFaqModal();
    initAssessmentForm();
});