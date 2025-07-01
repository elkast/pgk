// Variables globales
let fluxCamera = null;
let photoCapturee = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initialiserNavigation();
    initialiserFormulaires();
    initialiserAnimations();
    initialiserPhoto();
    initialiserPaiement();
    initialiserBarreProgression();
});

// ===== NAVIGATION =====
function initialiserNavigation() {
    const boutonMenu = document.getElementById('boutonMenuMobile');
    const menuPrincipal = document.querySelector('.menu-principal');
    const liensNav = document.querySelectorAll('.lien-nav');

    // Gestion du menu mobile
    if (boutonMenu) {
        boutonMenu.addEventListener('click', function() {
            menuPrincipal.classList.toggle('menu-ouvert');
            boutonMenu.classList.toggle('actif');
        });
    }

    // Fermeture du menu au clic sur un lien
    liensNav.forEach(lien => {
        lien.addEventListener('click', function() {
            if (menuPrincipal.classList.contains('menu-ouvert')) {
                menuPrincipal.classList.remove('menu-ouvert');
                boutonMenu.classList.remove('actif');
            }
        });
    });

    // Gestion du scroll pour la navigation
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header-principal');
        if (window.scrollY > 100) {
            header.classList.add('scroll');
        } else {
            header.classList.remove('scroll');
        }
    });
}

// ===== GESTION DES PHOTOS =====
function initialiserPhoto() {
    const optionsPhoto = document.querySelectorAll('input[name="type-photo"]');
    const sectionCamera = document.getElementById('section-camera');
    const sectionUpload = document.getElementById('section-upload');
    const boutonPhoto = document.getElementById('bouton-photo');
    const boutonRefaire = document.getElementById('bouton-refaire');
    const video = document.getElementById('video-camera');
    const canvas = document.getElementById('canvas-photo');
    const fichierPhoto = document.getElementById('fichier-photo');
    const apercuPhoto = document.getElementById('apercu-photo');
    const imageApercu = document.getElementById('image-apercu');

    // Gestion des options de photo
    optionsPhoto.forEach(option => {
        option.addEventListener('change', function() {
            const typePhoto = this.value;
            
            // Masquer toutes les sections
            sectionCamera.style.display = 'none';
            sectionUpload.style.display = 'none';
            apercuPhoto.style.display = 'none';
            
            // Arrêter la caméra si elle est active
            arreterCamera();
            
            if (typePhoto === 'camera') {
                sectionCamera.style.display = 'block';
                demarrerCamera();
            } else if (typePhoto === 'upload') {
                sectionUpload.style.display = 'block';
            }
        });
    });

    // Démarrer la caméra
    async function demarrerCamera() {
        try {
            fluxCamera = await navigator.mediaDevices.getUserMedia({
                video: { width: 400, height: 300 }
            });
            video.srcObject = fluxCamera;
        } catch (erreur) {
            console.error('Erreur lors de l\'accès à la caméra:', erreur);
            afficherMessage('Erreur lors de l\'accès à la caméra. Veuillez vérifier vos autorisations.', 'erreur');
        }
    }

    // Arrêter la caméra
    function arreterCamera() {
        if (fluxCamera) {
            fluxCamera.getTracks().forEach(track => track.stop());
            fluxCamera = null;
        }
    }

    // Prendre une photo
    if (boutonPhoto) {
        boutonPhoto.addEventListener('click', function() {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            // Convertir en blob
            canvas.toBlob(function(blob) {
                photoCapturee = blob;
                afficherApercu(blob);
                
                // Masquer la vidéo et afficher le canvas
                video.style.display = 'none';
                canvas.style.display = 'block';
                boutonPhoto.style.display = 'none';
                boutonRefaire.style.display = 'inline-block';
                
                arreterCamera();
            }, 'image/jpeg', 0.8);
        });
    }

    // Refaire la photo
    if (boutonRefaire) {
        boutonRefaire.addEventListener('click', function() {
            video.style.display = 'block';
            canvas.style.display = 'none';
            boutonPhoto.style.display = 'inline-block';
            boutonRefaire.style.display = 'none';
            apercuPhoto.style.display = 'none';
            
            photoCapturee = null;
            demarrerCamera();
        });
    }

    // Gestion de l'upload de fichier
    if (fichierPhoto) {
        fichierPhoto.addEventListener('change', function(e) {
            const fichier = e.target.files[0];
            if (fichier) {
                // Vérifier le type de fichier
                if (!fichier.type.startsWith('image/')) {
                    afficherMessage('Veuillez sélectionner un fichier image valide.', 'erreur');
                    return;
                }
                
                // Vérifier la taille (5MB max)
                if (fichier.size > 5 * 1024 * 1024) {
                    afficherMessage('La taille du fichier ne doit pas dépasser 5MB.', 'erreur');
                    return;
                }
                
                photoCapturee = fichier;
                afficherApercu(fichier);
            }
        });
    }

    // Afficher l'aperçu de la photo
    function afficherApercu(fichier) {
        const url = URL.createObjectURL(fichier);
        imageApercu.src = url;
        apercuPhoto.style.display = 'block';
        
        // Animation d'apparition
        apercuPhoto.style.opacity = '0';
        apercuPhoto.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            apercuPhoto.style.transition = 'all 0.3s ease';
            apercuPhoto.style.opacity = '1';
            apercuPhoto.style.transform = 'scale(1)';
        }, 100);
    }

    // Gestion du drag and drop
    const zoneDepot = document.querySelector('.zone-depot');
    if (zoneDepot) {
        zoneDepot.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('survol');
        });

        zoneDepot.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('survol');
        });

        zoneDepot.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('survol');
            
            const fichiers = e.dataTransfer.files;
            if (fichiers.length > 0) {
                const fichier = fichiers[0];
                if (fichier.type.startsWith('image/')) {
                    fichierPhoto.files = fichiers;
                    fichierPhoto.dispatchEvent(new Event('change'));
                } else {
                    afficherMessage('Veuillez déposer un fichier image valide.', 'erreur');
                }
            }
        });
    }
}

// ===== GESTION DES PAIEMENTS =====
function initialiserPaiement() {
    const optionsPaiement = document.querySelectorAll('input[name="methode-paiement"]');
    const detailsPaiement = document.getElementById('details-paiement');
    const formsPaiement = {
        'mobile-money': document.getElementById('form-mobile-money'),
        'carte': document.getElementById('form-carte'),
        'virement': document.getElementById('form-virement'),
        'paypal': document.getElementById('form-paypal')
    };

    optionsPaiement.forEach(option => {
        option.addEventListener('change', function() {
            const methodePaiement = this.value;
            
            // Masquer tous les formulaires de paiement
            Object.values(formsPaiement).forEach(form => {
                if (form) form.style.display = 'none';
            });
            
            // Afficher les détails de paiement
            detailsPaiement.style.display = 'block';
            
            // Afficher le formulaire correspondant
            if (formsPaiement[methodePaiement]) {
                formsPaiement[methodePaiement].style.display = 'block';
                
                // Animation d'apparition
                formsPaiement[methodePaiement].style.opacity = '0';
                formsPaiement[methodePaiement].style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    formsPaiement[methodePaiement].style.transition = 'all 0.3s ease';
                    formsPaiement[methodePaiement].style.opacity = '1';
                    formsPaiement[methodePaiement].style.transform = 'translateY(0)';
                }, 100);
            }
        });
    });

    // Formatage des champs de carte
    const numeroCarteInput = document.getElementById('numero-carte');
    if (numeroCarteInput) {
        numeroCarteInput.addEventListener('input', function(e) {
            // Supprimer tous les caractères non numériques
            let valeur = e.target.value.replace(/\D/g, '');
            
            // Limiter à 16 chiffres
            valeur = valeur.substring(0, 16);
            
            // Ajouter des espaces tous les 4 chiffres
            valeur = valeur.replace(/(.{4})/g, '$1 ').trim();
            
            e.target.value = valeur;
        });
    }

    const expirationInput = document.getElementById('expiration');
    if (expirationInput) {
        expirationInput.addEventListener('input', function(e) {
            let valeur = e.target.value.replace(/\D/g, '');
            valeur = valeur.substring(0, 4);
            
            if (valeur.length >= 2) {
                valeur = valeur.substring(0, 2) + '/' + valeur.substring(2);
            }
            
            e.target.value = valeur;
        });
    }

    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let valeur = e.target.value.replace(/\D/g, '');
            valeur = valeur.substring(0, 3);
            e.target.value = valeur;
        });
    }
}

// ===== GESTION DES FORMULAIRES =====
function initialiserFormulaires() {
    const formulaireAdhesion = document.getElementById('formulaireAdhesion');
    const formulaireContact = document.querySelector('.formulaire-contact');

    // Validation en temps réel
    const champs = document.querySelectorAll('input, select, textarea');
    champs.forEach(champ => {
        champ.addEventListener('blur', function() {
            validerChamp(this);
        });
        
        champ.addEventListener('input', function() {
            if (this.classList.contains('erreur')) {
                validerChamp(this);
            }
        });
    });

    // Soumission du formulaire d'adhésion
    if (formulaireAdhesion) {
        formulaireAdhesion.addEventListener('submit', function(e) {
            e.preventDefault();
            traiterAdhesion();
        });
    }

    // Soumission du formulaire de contact
    if (formulaireContact) {
        formulaireContact.addEventListener('submit', function(e) {
            e.preventDefault();
            traiterContact();
        });
    }
}

// Validation des champs
function validerChamp(champ) {
    const valeur = champ.value.trim();
    let valide = true;
    let messageErreur = '';

    // Validation selon le type de champ
    switch (champ.type) {
        case 'email':
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (valeur && !regexEmail.test(valeur)) {
                valide = false;
                messageErreur = 'Adresse email invalide';
            }
            break;
        case 'tel':
            const regexTel = /^[+]?[\d\s-()]+$/;
            if (valeur && !regexTel.test(valeur)) {
                valide = false;
                messageErreur = 'Numéro de téléphone invalide';
            }
            break;
        case 'number':
            if (champ.id === 'age' && valeur && (valeur < 18 || valeur > 120)) {
                valide = false;
                messageErreur = 'Âge doit être entre 18 et 120 ans';
            }
            break;
    }

    // Validation des champs requis
    if (champ.required && !valeur) {
        valide = false;
        messageErreur = 'Ce champ est requis';
    }

    // Appliquer les styles de validation
    if (valide) {
        champ.classList.remove('erreur');
        champ.classList.add('succes');
        supprimerMessageErreur(champ);
    } else {
        champ.classList.remove('succes');
        champ.classList.add('erreur');
        afficherMessageErreur(champ, messageErreur);
    }

    return valide;
}

// Afficher message d'erreur pour un champ
function afficherMessageErreur(champ, message) {
    supprimerMessageErreur(champ);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-erreur-champ';
    messageDiv.style.cssText = `
        color: var(--couleur-erreur);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: apparition 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    champ.parentNode.appendChild(messageDiv);
}

// Supprimer message d'erreur
function supprimerMessageErreur(champ) {
    const messageExistant = champ.parentNode.querySelector('.message-erreur-champ');
    if (messageExistant) {
        messageExistant.remove();
    }
}

// Traitement de l'adhésion
async function traiterAdhesion() {
    const formulaire = document.getElementById('formulaireAdhesion');
    const boutonSoumettre = formulaire.querySelector('.bouton-soumettre');
    
    // Validation complète du formulaire
    let formulaireValide = true;
    const champs = formulaire.querySelectorAll('input[required], select[required], textarea[required]');
    
    champs.forEach(champ => {
        if (!validerChamp(champ)) {
            formulaireValide = false;
        }
    });

    // Vérifier qu'une photo a été sélectionnée
    const typePhotoSelectionne = document.querySelector('input[name="type-photo"]:checked');
    if (typePhotoSelectionne && !photoCapturee) {
        formulaireValide = false;
        afficherMessage('Veuillez prendre ou télécharger une photo.', 'erreur');
    }

    // Vérifier qu'une méthode de paiement a été sélectionnée
    const methodePaiementSelectionnee = document.querySelector('input[name="methode-paiement"]:checked');
    if (!methodePaiementSelectionnee) {
        formulaireValide = false;
        afficherMessage('Veuillez sélectionner une méthode de paiement.', 'erreur');
    }

    if (!formulaireValide) {
        return;
    }

    // Désactiver le bouton et afficher le chargement
    boutonSoumettre.disabled = true;
    boutonSoumettre.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';
    formulaire.classList.add('chargement');

    try {
        // Préparer les données du formulaire
        const donneesFormulaire = new FormData(formulaire);
        
        // Ajouter la photo si elle existe
        if (photoCapturee) {
            donneesFormulaire.append('photo', photoCapturee, 'photo-profil.jpg');
        }

        // Simuler l'envoi (à remplacer par l'appel API réel)
        await simularEnvoi(donneesFormulaire);
        
        // Succès
        afficherMessage('Votre demande d\'adhésion a été envoyée avec succès ! Vous recevrez une confirmation par email.', 'succes');
        formulaire.reset();
        
        // Masquer les sections photo et paiement
        document.getElementById('section-camera').style.display = 'none';
        document.getElementById('section-upload').style.display = 'none';
        document.getElementById('apercu-photo').style.display = 'none';
        document.getElementById('details-paiement').style.display = 'none';
        photoCapturee = null;
        
    } catch (erreur) {
        console.error('Erreur lors de l\'envoi:', erreur);
        afficherMessage('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', 'erreur');
    } finally {
        // Réactiver le bouton
        boutonSoumettre.disabled = false;
        boutonSoumettre.innerHTML = '<i class="fas fa-user-plus"></i> Finaliser mon adhésion';
        formulaire.classList.remove('chargement');
    }
}

// Traitement du contact
async function traiterContact() {
    const formulaire = document.querySelector('.formulaire-contact');
    const boutonSoumettre = formulaire.querySelector('.bouton-soumettre');
    
    // Validation
    let formulaireValide = true;
    const champs = formulaire.querySelectorAll('input[required], textarea[required]');
    
    champs.forEach(champ => {
        if (!validerChamp(champ)) {
            formulaireValide = false;
        }
    });

    if (!formulaireValide) {
        return;
    }

    // Désactiver le bouton
    boutonSoumettre.disabled = true;
    boutonSoumettre.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

    try {
        const donneesFormulaire = new FormData(formulaire);
        await simularEnvoi(donneesFormulaire);
        
        afficherMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'succes');
        formulaire.reset();
        
    } catch (erreur) {
        afficherMessage('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', 'erreur');
    } finally {
        boutonSoumettre.disabled = false;
        boutonSoumettre.innerHTML = 'Envoyer le message';
    }
}

// Simulation d'envoi (à remplacer par l'API réelle)
function simularEnvoi(donnees) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simuler un succès dans 90% des cas
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('Erreur simulée'));
            }
        }, 2000);
    });
}

// ===== ANIMATIONS =====
function initialiserAnimations() {
    // Intersection Observer pour les animations au scroll
    const observateur = new IntersectionObserver((entrees) => {
        entrees.forEach(entree => {
            if (entree.isIntersecting) {
                entree.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observer tous les éléments animables
    const elementsAnimes = document.querySelectorAll('.carte-valeur, .carte-actualite, .carte-contact, .texte-apropos, .image-apropos');
    elementsAnimes.forEach(element => {
        element.classList.add('anime-au-scroll');
        observateur.observe(element);
    });

    // Animation de comptage pour les statistiques (si présentes)
    animerCompteurs();
}

// Animation des compteurs
function animerCompteurs() {
    const compteurs = document.querySelectorAll('.compteur');
    compteurs.forEach(compteur => {
        const valeurFinale = parseInt(compteur.textContent);
        const duree = 2000;
        const increment = valeurFinale / (duree / 16);
        let valeurActuelle = 0;

        const timer = setInterval(() => {
            valeurActuelle += increment;
            compteur.textContent = Math.floor(valeurActuelle);
            
            if (valeurActuelle >= valeurFinale) {
                compteur.textContent = valeurFinale;
                clearInterval(timer);
            }
        }, 16);
    });
}

// ===== BARRE DE PROGRESSION =====
function initialiserBarreProgression() {
    const indicateur = document.createElement('div');
    indicateur.className = 'indicateur-progression';
    document.body.appendChild(indicateur);

    window.addEventListener('scroll', () => {
        const hauteurDocument = document.documentElement.scrollHeight - window.innerHeight;
        const progression = (window.scrollY / hauteurDocument) * 100;
        indicateur.style.width = progression + '%';
    });
}

// ===== UTILITAIRES =====
function afficherMessage(message, type = 'info') {
    // Supprimer les messages existants
    const messagesExistants = document.querySelectorAll('.message-etat');
    messagesExistants.forEach(msg => msg.remove());

    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-etat message-${type}`;
    
    const icone = type === 'succes' ? 'fa-check-circle' : 
                 type === 'erreur' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    messageDiv.innerHTML = `
        <i class="fas ${icone}"></i>
        <span>${message}</span>
    `;

    // Positionner en haut de la page
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        max-width: 500px;
        animation: glisserBas 0.5s ease-out;
    `;

    document.body.appendChild(messageDiv);

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        messageDiv.style.animation = 'glisserHaut 0.5s ease-out';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}

// Ajouter les animations CSS manquantes
const style = document.createElement('style');
style.textContent = `
    @keyframes glisserBas {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes glisserHaut {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }

    .zone-depot.survol {
        border-color: var(--couleur-primaire);
        background: rgba(37, 99, 235, 0.05);
    }

    .menu-ouvert {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: var(--ombre-elevee);
        padding: 1rem;
        gap: 1rem;
    }

    .bouton-menu-mobile.actif span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .bouton-menu-mobile.actif span:nth-child(2) {
        opacity: 0;
    }

    .bouton-menu-mobile.actif span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    .header-principal.scroll {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: var(--ombre-carte);
    }
`;
document.head.appendChild(style);

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', function() {
    if (fluxCamera) {
        fluxCamera.getTracks().forEach(track => track.stop());
    }
});

