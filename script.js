import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Fonctions utilitaires ---

/**
 * Ouvre une modale spécifique.
 * @param {string} idModale - L'ID de la modale à ouvrir.
 */
function ouvrirModale(idModale) {
    const modale = document.getElementById(idModale);
    if (modale) {
        modale.classList.add('actif');
        modale.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Ferme une modale spécifique.
 * @param {string} idModale - L'ID de la modale à fermer.
 */
function fermerModale(idModale) {
    const modale = document.getElementById(idModale);
    if (modale) {
        modale.classList.remove('actif');
        modale.addEventListener('transitionend', function handler() {
            modale.style.display = 'none';
            modale.removeEventListener('transitionend', handler);
        }, { once: true });
        document.body.style.overflow = '';
    }
}

// Exposer les fonctions globalement pour les onclick dans le HTML
window.ouvrirModale = ouvrirModale;
window.fermerModale = fermerModale;

// Fermer les modales en cliquant à l'extérieur
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modale')) {
        fermerModale(event.target.id);
    }
});

// --- Logique du menu Hamburger ---
const boutonHamburger = document.querySelector('.hamburger');
const menuNavigation = document.querySelector('.menu-navigation');
const actionsNavigation = document.querySelector('.actions-navigation');

if (boutonHamburger && menuNavigation && actionsNavigation) {
    boutonHamburger.addEventListener('click', () => {
        boutonHamburger.classList.toggle('actif');
        menuNavigation.classList.toggle('actif');
        actionsNavigation.classList.toggle('actif');
    });

    // Fermer le menu si on clique sur un lien de navigation
    document.querySelectorAll('.lien-navigation').forEach(link => {
        link.addEventListener('click', () => {
            if (menuNavigation.classList.contains('actif')) {
                boutonHamburger.classList.remove('actif');
                menuNavigation.classList.remove('actif');
                actionsNavigation.classList.remove('actif');
            }
        });
    });
}

// --- Animation du compteur de parrainages ---
function animerCompteur() {
    const compteur = document.getElementById('compteur-parrainages');
    if (compteur) {
        const objectif = 12500; // Nombre d'exemple
        let actuel = 0;
        const increment = objectif / 100;
        
        const timer = setInterval(() => {
            actuel += increment;
            if (actuel >= objectif) {
                actuel = objectif;
                clearInterval(timer);
            }
            compteur.textContent = Math.floor(actuel).toLocaleString('fr-FR');
        }, 30);
    }
}

// --- Navigation fluide ---
function initNavigationFluide() {
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
        });
    });
}

// --- Gestion des formulaires ---
function initFormulaireGestion() {
    // Formulaire d'adhésion
    const formulaireAdhesion = document.getElementById('formulaire-adhesion');
    if (formulaireAdhesion) {
        formulaireAdhesion.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupération des données
            const formData = new FormData(this);
            const roles = Array.from(formData.getAll('roles'));
            
            // Simulation d'envoi
            const boutonSubmit = this.querySelector('button[type="submit"]');
            const texteOriginal = boutonSubmit.textContent;
            
            boutonSubmit.textContent = 'Envoi en cours...';
            boutonSubmit.disabled = true;
            
            setTimeout(() => {
                alert('Merci pour votre adhésion ! Nous vous contacterons bientôt.');
                fermerModale('modale-adhesion');
                this.reset();
                boutonSubmit.textContent = texteOriginal;
                boutonSubmit.disabled = false;
            }, 2000);
        });
    }

    // Formulaire de parrainage
    const formulaireParrainage = document.getElementById('formulaire-parrainage-modale');
    if (formulaireParrainage) {
        formulaireParrainage.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const boutonSubmit = this.querySelector('button[type="submit"]');
            const texteOriginal = boutonSubmit.textContent;
            
            boutonSubmit.textContent = 'Envoi en cours...';
            boutonSubmit.disabled = true;
            
            setTimeout(() => {
                alert('Merci pour votre parrainage ! Votre soutien compte énormément.');
                fermerModale('modale-parrainage');
                this.reset();
                boutonSubmit.textContent = texteOriginal;
                boutonSubmit.disabled = false;
            }, 2000);
        });
    }
}

// --- Initialisation à l'chargement de la page ---
document.addEventListener('DOMContentLoaded', () => {
    animerCompteur();
    initNavigationFluide();
    initFormulaireGestion();
    
    // Animation d'apparition progressive des éléments
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observer les sections pour l'animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});