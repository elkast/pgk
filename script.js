import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Database simulation with localStorage
class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('sponsorships')) {
            localStorage.setItem('sponsorships', JSON.stringify([]));
        }
        if (!localStorage.getItem('members')) {
            localStorage.setItem('members', JSON.stringify([]));
        }
        if (!localStorage.getItem('donations')) {
            localStorage.setItem('donations', JSON.stringify([]));
        }
    }

    addSponsorship(data) {
        const sponsorships = JSON.parse(localStorage.getItem('sponsorships'));
        const sponsorship = {
            id: Date.now(),
            ...data,
            timestamp: new Date().toISOString()
        };
        sponsorships.push(sponsorship);
        localStorage.setItem('sponsorships', JSON.stringify(sponsorships));
        return sponsorship;
    }

    addMember(data) {
        const members = JSON.parse(localStorage.getItem('members'));
        const member = {
            id: Date.now(),
            ...data,
            timestamp: new Date().toISOString()
        };
        members.push(member);
        localStorage.setItem('members', JSON.stringify(members));
        return member;
    }

    getSponsorshipCount() {
        const sponsorships = JSON.parse(localStorage.getItem('sponsorships'));
        return sponsorships.length;
    }

    getMemberCount() {
        const members = JSON.parse(localStorage.getItem('members'));
        return members.length;
    }
}

const db = new Database();

// Global variables
let commentsData = [];
let commentsCursor = null;
let isLoadingComments = false;

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateSponsorCount();
    setupEventListeners();
    setupSmoothScrolling();
    setupNavbarScroll();
    loadComments();
    setupCommentsRealtime();
}

function updateSponsorCount() {
    const count = db.getSponsorshipCount();
    const counterElement = document.getElementById('sponsor-count');
    if (counterElement) {
        animateCounter(counterElement, count);
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
}

function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Form submissions
    setupFormHandlers();
    
    // Comment image preview
    const commentImages = document.getElementById('comment-images');
    if (commentImages) {
        commentImages.addEventListener('change', handleImagePreview);
    }

    // Load more comments
    const loadMoreBtn = document.getElementById('load-more-comments');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreComments);
    }
}

function setupFormHandlers() {
    // Sponsor form
    const sponsorForm = document.getElementById('sponsor-form');
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', handleSponsorSubmission);
    }

    const modalSponsorForm = document.getElementById('modal-sponsor-form');
    if (modalSponsorForm) {
        modalSponsorForm.addEventListener('submit', handleSponsorSubmission);
    }

    // Join form
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinSubmission);
    }
}

async function handleSponsorSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        id_number: formData.get('id_number'),
        location: formData.get('location'),
        contact: formData.get('contact'),
        consent: formData.get('consent') === 'on'
    };

    if (!data.consent) {
        showNotification('Vous devez donner votre consentement pour parrainer.', 'error');
        return;
    }

    try {
        const sponsorship = db.addSponsorship(data);
        showNotification('Merci pour votre parrainage ! Votre soutien compte énormément.', 'success');
        e.target.reset();
        updateSponsorCount();
        
        // Close modal if it's the modal form
        if (e.target.id === 'modal-sponsor-form') {
            closeModal('sponsor-modal');
        }
    } catch (error) {
        showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        console.error('Sponsorship error:', error);
    }
}

async function handleJoinSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const roles = [];
    const roleCheckboxes = formData.getAll('roles');
    roleCheckboxes.forEach(role => roles.push(role));

    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        commune: formData.get('commune'),
        roles: roles
    };

    try {
        const member = db.addMember(data);
        showNotification('Bienvenue dans le mouvement ! Ensemble, nous pouvons changer l\'Afrique.', 'success');
        e.target.reset();
        closeModal('join-modal');
    } catch (error) {
        showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        console.error('Join error:', error);
    }
}

function handleImagePreview(e) {
    const files = Array.from(e.target.files).slice(0, 4); // Limit to 4 images
    const preview = document.getElementById('image-preview');
    
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '10px';
                img.style.border = '2px solid var(--border-color)';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Comments functionality
async function loadComments() {
    if (isLoadingComments) return;
    
    isLoadingComments = true;
    
    try {
        const project = await window.websim.getCurrentProject();
        const response = await fetch(`/api/v1/projects/${project.id}/comments?first=12`);
        const data = await response.json();
        
        commentsData = data.comments.data;
        commentsCursor = data.comments.has_next_page ? 'next_cursor' : null;
        
        renderComments(commentsData);
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading comments:', error);
    } finally {
        isLoadingComments = false;
    }
}

async function loadMoreComments() {
    if (isLoadingComments || !commentsCursor) return;
    
    isLoadingComments = true;
    
    try {
        const project = await window.websim.getCurrentProject();
        const response = await fetch(`/api/v1/projects/${project.id}/comments?first=12&after=${commentsCursor}`);
        const data = await response.json();
        
        const newComments = data.comments.data;
        commentsData = [...commentsData, ...newComments];
        commentsCursor = data.comments.has_next_page ? 'next_cursor' : null;
        
        renderComments(commentsData);
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading more comments:', error);
    } finally {
        isLoadingComments = false;
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    comments.forEach(commentData => {
        const comment = commentData.comment;
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.setAttribute('data-comment-id', comment.id);
    
    const authorInitials = comment.author.display_name 
        ? comment.author.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : comment.author.username[0].toUpperCase();
    
    const commentDate = new Date(comment.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Convert markdown to HTML
    const commentHtml = DOMPurify.sanitize(marked.parse(comment.raw_content));
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <div class="comment-avatar">${authorInitials}</div>
            <div class="comment-meta">
                <div class="comment-author">${comment.author.display_name || comment.author.username}</div>
                <div class="comment-date">${commentDate}</div>
            </div>
        </div>
        <div class="comment-content">
            ${commentHtml}
        </div>
        <div class="comment-actions-bar">
            <button class="comment-action" onclick="likeComment('${comment.id}')">
                👍 ${comment.reactions.find(r => r.emoji.name === '+1')?.count || 0}
            </button>
            <button class="comment-action" onclick="replyToComment('${comment.id}')">
                💬 Répondre
            </button>
            ${comment.reply_count > 0 ? `<button class="comment-action" onclick="loadReplies('${comment.id}')">Voir les réponses (${comment.reply_count})</button>` : ''}
        </div>
    `;
    
    return commentDiv;
}

async function postComment() {
    const input = document.getElementById('comment-input');
    const imageInput = document.getElementById('comment-images');
    
    if (!input.value.trim()) {
        showNotification('Veuillez saisir votre commentaire.', 'error');
        return;
    }
    
    try {
        let imageUrls = [];
        
        // Upload images if any
        if (imageInput.files.length > 0) {
            const files = Array.from(imageInput.files).slice(0, 4);
            for (let file of files) {
                const url = await window.websim.upload(file);
                imageUrls.push(url);
            }
        }
        
        const result = await window.websim.postComment({
            content: input.value,
            images: imageUrls
        });
        
        if (result.error) {
            showNotification(result.error, 'error');
            return;
        }
        
        // Clear form
        input.value = '';
        imageInput.value = '';
        document.getElementById('image-preview').innerHTML = '';
        
        showNotification('Commentaire publié avec succès !', 'success');
        
        // Reload comments
        setTimeout(() => {
            loadComments();
        }, 1000);
        
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification('Erreur lors de la publication du commentaire.', 'error');
    }
}

async function replyToComment(commentId) {
    const content = prompt('Votre réponse :');
    if (!content || !content.trim()) return;
    
    try {
        const result = await window.websim.postComment({
            content: content,
            parent_comment_id: commentId
        });
        
        if (result.error) {
            showNotification(result.error, 'error');
            return;
        }
        
        showNotification('Réponse publiée avec succès !', 'success');
        
        // Reload comments
        setTimeout(() => {
            loadComments();
        }, 1000);
        
    } catch (error) {
        console.error('Error posting reply:', error);
        showNotification('Erreur lors de la publication de la réponse.', 'error');
    }
}

function setupCommentsRealtime() {
    if (window.websim && window.websim.addEventListener) {
        window.websim.addEventListener('comment:created', (data) => {
            console.log('New comment created:', data);
            
            // Add new comment to the beginning of the list
            commentsData.unshift(data);
            renderComments(commentsData);
            
            // Show notification
            showNotification('Nouveau commentaire ajouté !', 'info');
        });
    }
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-comments');
    if (loadMoreBtn) {
        if (commentsCursor) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = isLoadingComments ? 'Chargement...' : 'Voir plus de commentaires';
            loadMoreBtn.disabled = isLoadingComments;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Smooth scrolling
function setupSmoothScrolling() {
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

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Intersection Observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe cards and sections
    document.querySelectorAll('.program-card, .news-card, .value-item, .objective-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', observeElements);

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.postComment = postComment;
window.replyToComment = replyToComment;
window.likeComment = function(commentId) {
    // Placeholder for like functionality
    showNotification('Fonctionnalité à venir !', 'info');
};
window.loadReplies = function(commentId) {
    // Placeholder for replies functionality
    showNotification('Chargement des réponses...', 'info');
};

