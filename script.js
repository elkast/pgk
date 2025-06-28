// DOM Elements
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const parrainageBtn = document.getElementById('parrainageBtn');
const parrainageModal = document.getElementById('parrainageModal');
const modalClose = document.querySelector('.modal-close');
const parrainageForm = document.getElementById('parrainageForm');
const contactForm = document.getElementById('contactForm');
const statNumbers = document.querySelectorAll('.stat-number');

// Éléments DOM
const decouvrir_projet_btn = document.getElementById('decouvrir-projet-btn');
const projet_modal = document.getElementById('projetModal');
const projet_close = document.getElementById('projet-close');
const news_slider = document.getElementById('news-slider');
const news_prev = document.getElementById('news-prev');
const news_next = document.getElementById('news-next');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Mobile navigation toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Close mobile menu if open
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Active navigation link update
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animated counters
const animateCounters = () => {
    statNumbers.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger counter animation for stats section
            if (entry.target.classList.contains('hero-stats')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.vision-card, .timeline-item, .news-card, .hero-stats').forEach(el => {
    observer.observe(el);
});

// Carrousel de vision automatique
let indice_slide_actuel = 0;
const slides_vision = document.querySelectorAll('.vision-slide');
const indicateurs_vision = document.querySelectorAll('.indicator');
const conteneur_slides = document.querySelector('.vision-slides');

function afficher_slide_vision(indice) {
    // Masquer tous les slides
    slides_vision.forEach(slide => slide.classList.remove('active'));
    indicateurs_vision.forEach(ind => ind.classList.remove('active'));
    
    // Afficher le slide actuel
    slides_vision[indice].classList.add('active');
    indicateurs_vision[indice].classList.add('active');
    
    // Déplacer le conteneur
    conteneur_slides.style.transform = `translateX(-${indice * 100}%)`;
}

function slide_suivant_vision() {
    indice_slide_actuel = (indice_slide_actuel + 1) % slides_vision.length;
    afficher_slide_vision(indice_slide_actuel);
}

// Auto-scroll pour la vision (toutes les 4 secondes)
setInterval(slide_suivant_vision, 4000);

// Gestion des indicateurs cliquables
indicateurs_vision.forEach((indicateur, indice) => {
    indicateur.addEventListener('click', () => {
        indice_slide_actuel = indice;
        afficher_slide_vision(indice);
    });
});

// Modal Découvrir le Projet
decouvrir_projet_btn.addEventListener('click', () => {
    projet_modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

projet_close.addEventListener('click', () => {
    projet_modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === projet_modal) {
        projet_modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Gestion du carrousel d'actualités
let position_actuelle_news = 0;
let actualites_donnees = [];

// Fonction pour charger les actualités depuis l'API
async function charger_actualites() {
    try {
        // Simulation d'appel API - remplacer par votre vraie API
        const reponse = await fetch('/api/actualites');
        if (!reponse.ok) {
            // Données de test si l'API n'est pas disponible
            actualites_donnees = [
                {
                    id: 1,
                    titre: "Lancement de l'initiative Côte d'Ivoire Numérique",
                    contenu: "Une stratégie ambitieuse pour faire du numérique un levier de développement...",
                    date: "2024-12-15",
                    image: "https://via.placeholder.com/300x200/1e40af/ffffff?text=Numérique",
                    type: "featured"
                },
                {
                    id: 2,
                    titre: "Rencontre avec les jeunes entrepreneurs",
                    contenu: "Échanges sur l'innovation et l'entrepreneuriat...",
                    date: "2024-12-12",
                    image: "https://via.placeholder.com/300x200/f59e0b/ffffff?text=Entrepreneurs",
                    type: "standard"
                },
                {
                    id: 3,
                    titre: "Forum sur l'éducation inclusive",
                    contenu: "Des solutions concrètes pour une éducation de qualité...",
                    date: "2024-12-10",
                    image: "https://via.placeholder.com/300x200/10b981/ffffff?text=Education",
                    type: "standard"
                },
                {
                    id: 4,
                    titre: "Programme de développement rural",
                    contenu: "Modernisation de l'agriculture et développement des zones rurales...",
                    date: "2024-12-08",
                    image: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Rural",
                    type: "standard"
                },
                {
                    id: 5,
                    titre: "Inauguration du centre de formation professionnelle",
                    contenu: "Un nouveau centre pour former nos jeunes aux métiers d'avenir...",
                    date: "2024-12-05",
                    image: "https://via.placeholder.com/300x200/ef4444/ffffff?text=Formation",
                    type: "standard"
                }
            ];
        } else {
            actualites_donnees = await reponse.json();
        }
        afficher_actualites();
    } catch (erreur) {
        console.error('Erreur lors du chargement des actualités:', erreur);
        // Utiliser les données de test en cas d'erreur
        charger_actualites();
    }
}

function afficher_actualites() {
    news_slider.innerHTML = '';
    
    actualites_donnees.forEach(actualite => {
        const carte_actualite = document.createElement('article');
        carte_actualite.className = `news-card ${actualite.type === 'featured' ? 'featured' : ''}`;
        
        carte_actualite.innerHTML = `
            <div class="news-image" style="background-image: url('${actualite.image}'); background-size: cover; background-position: center;"></div>
            <div class="news-content">
                <span class="news-date">${formater_date(actualite.date)}</span>
                <h3>${actualite.titre}</h3>
                <p>${actualite.contenu}</p>
                <a href="#" class="read-more" data-id="${actualite.id}">Lire la suite</a>
            </div>
        `;
        
        news_slider.appendChild(carte_actualite);
    });
    
    // Ajouter les événements pour "Lire la suite"
    document.querySelectorAll('.read-more').forEach(lien => {
        lien.addEventListener('click', (e) => {
            e.preventDefault();
            const id_actualite = e.target.getAttribute('data-id');
            afficher_actualite_complete(id_actualite);
        });
    });
}

function formater_date(date_str) {
    const date = new Date(date_str);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function afficher_actualite_complete(id) {
    const actualite = actualites_donnees.find(a => a.id == id);
    if (actualite) {
        // Créer et afficher un modal avec l'actualité complète
        const modal_actualite = document.createElement('div');
        modal_actualite.className = 'modal';
        modal_actualite.innerHTML = `
            <div class="modal-content large-modal">
                <span class="modal-close">&times;</span>
                <h2>${actualite.titre}</h2>
                <img src="${actualite.image}" alt="${actualite.titre}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 1rem 0;">
                <p><strong>Date:</strong> ${formater_date(actualite.date)}</p>
                <div style="margin-top: 1rem; line-height: 1.6;">
                    ${actualite.contenu}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal_actualite);
        modal_actualite.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const fermer = modal_actualite.querySelector('.modal-close');
        fermer.addEventListener('click', () => {
            modal_actualite.remove();
            document.body.style.overflow = 'auto';
        });
        
        modal_actualite.addEventListener('click', (e) => {
            if (e.target === modal_actualite) {
                modal_actualite.remove();
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Navigation du carrousel d'actualités
news_prev.addEventListener('click', () => {
    if (position_actuelle_news > 0) {
        position_actuelle_news--;
        news_slider.style.transform = `translateX(-${position_actuelle_news * 370}px)`;
    }
});

news_next.addEventListener('click', () => {
    const largeur_carte = 370; // 350px + 20px gap
    const largeur_visible = news_slider.parentElement.clientWidth - 120; // moins les boutons
    const max_position = Math.max(0, Math.ceil((actualites_donnees.length * largeur_carte - largeur_visible) / largeur_carte));
    
    if (position_actuelle_news < max_position) {
        position_actuelle_news++;
        news_slider.style.transform = `translateX(-${position_actuelle_news * largeur_carte}px)`;
    }
});

// Modal functionality
parrainageBtn.addEventListener('click', () => {
    parrainageModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

modalClose.addEventListener('click', () => {
    parrainageModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === parrainageModal) {
        parrainageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form validation and submission
const validateForm = (form) => {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value && !emailRegex.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        }
    });
    
    // Phone validation (basic)
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (field.value && !phoneRegex.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        }
    });
    
    return isValid;
};

const showMessage = (message, type = 'success') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
};

// Parrainage form submission
parrainageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm(parrainageForm)) {
        showMessage('Veuillez remplir tous les champs requis correctement.', 'error');
        return;
    }
    
    const formData = new FormData(parrainageForm);
    const data = Object.fromEntries(formData);
    
    // Simulate API call
    const submitBtn = parrainageForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Reset form and close modal
        parrainageForm.reset();
        parrainageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        showMessage('Votre parrainage a été enregistré avec succès ! Nous vous contacterons bientôt.', 'success');
        
        // Update stats (simulate)
        const supportStat = document.querySelector('[data-count="15000"]');
        if (supportStat) {
            const currentCount = parseInt(supportStat.textContent.replace(/,/g, ''));
            supportStat.textContent = (currentCount + 1).toLocaleString();
        }
    }, 2000);
});

// Contact form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm(contactForm)) {
        showMessage('Veuillez remplir tous les champs requis correctement.', 'error');
        return;
    }
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Simulate API call
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        showMessage('Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.', 'success');
    }, 2000);
});

// Enhanced scroll animations
const handleScrollAnimations = () => {
    const elements = document.querySelectorAll('.vision-card, .timeline-item, .news-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Set initial states
    document.querySelectorAll('.vision-card, .timeline-item, .news-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    handleScrollAnimations();
    charger_actualites();
});

window.addEventListener('scroll', handleScrollAnimations);

// Add CSS for slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .nav-links.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
    }
`;
document.head.appendChild(style);