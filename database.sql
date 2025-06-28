-- Base de données pour le site de parrainage Gnamien Konan
-- Créer la base de données
CREATE DATABASE gnamien_konan_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gnamien_konan_site;

-- Table des régions
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des communes
CREATE TABLE communes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    region_id INT,
    code_postal VARCHAR(10),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Table des utilisateurs/citoyens
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    commune_id INT,
    profession VARCHAR(100),
    numero_cni VARCHAR(20) UNIQUE,
    date_naissance DATE,
    adresse TEXT,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    consentement_donnees BOOLEAN DEFAULT FALSE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commune_id) REFERENCES communes(id),
    INDEX idx_email (email),
    INDEX idx_cni (numero_cni)
);

-- Table des parrainages
CREATE TABLE parrainages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    type_parrainage ENUM('moral', 'physique') NOT NULL,
    statut ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
    commentaire_admin TEXT,
    document_justificatif VARCHAR(255),
    date_parrainage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP NULL,
    validé_par INT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (validé_par) REFERENCES utilisateurs(id),
    INDEX idx_statut (statut),
    INDEX idx_type (type_parrainage)
);

-- Table des actualités
CREATE TABLE actualites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    resume TEXT,
    image_url VARCHAR(500),
    type ENUM('featured', 'standard', 'urgent') DEFAULT 'standard',
    statut ENUM('brouillon', 'publie', 'archive') DEFAULT 'brouillon',
    auteur_id INT,
    date_publication TIMESTAMP NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    nombre_vues INT DEFAULT 0,
    FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id),
    INDEX idx_statut (statut),
    INDEX idx_date_publication (date_publication),
    INDEX idx_type (type)
);

-- Table des messages de contact
CREATE TABLE messages_contact (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    commune_id INT,
    sujet VARCHAR(255),
    message TEXT NOT NULL,
    statut ENUM('nouveau', 'lu', 'traite', 'archive') DEFAULT 'nouveau',
    reponse TEXT,
    date_reponse TIMESTAMP NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commune_id) REFERENCES communes(id),
    INDEX idx_statut (statut),
    INDEX idx_email (email)
);

-- Table des administrateurs
CREATE TABLE administrateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    role ENUM('super_admin', 'admin', 'moderateur') DEFAULT 'moderateur',
    permissions JSON,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    UNIQUE KEY unique_admin (utilisateur_id)
);

-- Table des sessions de newsletter
CREATE TABLE newsletter_abonnes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100),
    statut ENUM('actif', 'inactif', 'desabonne') DEFAULT 'actif',
    date_abonnement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_desabonnement TIMESTAMP NULL,
    token_desabonnement VARCHAR(255) UNIQUE,
    INDEX idx_email (email),
    INDEX idx_statut (statut)
);

-- Table des logs d'activité
CREATE TABLE logs_activite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    action VARCHAR(100) NOT NULL,
    table_affectee VARCHAR(50),
    id_enregistrement INT,
    donnees_avant JSON,
    donnees_apres JSON,
    adresse_ip VARCHAR(45),
    user_agent TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_action (action),
    INDEX idx_date (date_action)
);

-- Table des statistiques
CREATE TABLE statistiques_site (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_stat DATE NOT NULL,
    nombre_visiteurs INT DEFAULT 0,
    nombre_parrainages INT DEFAULT 0,
    nombre_nouveaux_utilisateurs INT DEFAULT 0,
    nombre_actualites_vues INT DEFAULT 0,
    donnees_additionnelles JSON,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_stat (date_stat)
);

-- Insertion des données de base

-- Régions de Côte d'Ivoire
INSERT INTO regions (nom, code) VALUES 
('Lagunes', 'LAG'),
('Haut-Sassandra', 'HSS'),
('Savanes', 'SAV'),
('Vallée du Bandama', 'VDB'),
('Moyen-Comoé', 'MCO'),
('18 Montagnes', '18M'),
('Lacs', 'LAC'),
('Zanzan', 'ZAN'),
('Bas-Sassandra', 'BSS'),
('Denguélé', 'DEN'),
('Nzi-Comoé', 'NCO'),
('Marahoué', 'MAR'),
('Sud-Comoé', 'SCO'),
('Worodougou', 'WOR'),
('Sud-Bandama', 'SBD'),
('Agnéby', 'AGN'),
('Bafing', 'BAF'),
('Gbêkê', 'GBE'),
('Fromager', 'FRO');

-- Principales communes
INSERT INTO communes (nom, region_id, code_postal) VALUES 
('Abidjan', 1, '01'),
('Bouaké', 18, '02'),
('Daloa', 2, '03'),
('Yamoussoukro', 4, '04'),
('Korhogo', 3, '05'),
('San-Pédro', 9, '06'),
('Man', 6, '07'),
('Divo', 15, '08'),
('Gagnoa', 19, '09'),
('Abengourou', 5, '10');

-- Utilisateur administrateur par défaut
INSERT INTO utilisateurs (nom, prenom, email, telephone, commune_id, profession, statut, consentement_donnees) VALUES 
('Admin', 'Système', 'admin@gnamienkonan.ci', '+225XXXXXXXXXX', 1, 'Administrateur', 'actif', TRUE);

-- Administrateur principal
INSERT INTO administrateurs (utilisateur_id, role, permissions) VALUES 
(1, 'super_admin', '{"all": true}');

-- Quelques actualités d'exemple
INSERT INTO actualites (titre, contenu, resume, image_url, type, statut, auteur_id, date_publication) VALUES 
('Lancement de l\'initiative "Côte d\'Ivoire Numérique"', 'Une stratégie ambitieuse pour faire du numérique un levier de développement économique et social. Cette initiative vise à moderniser l\'administration publique et à faciliter l\'accès des citoyens aux services publics.', 'Une stratégie ambitieuse pour faire du numérique un levier de développement...', 'https://via.placeholder.com/600x400/1e40af/ffffff?text=Numérique', 'featured', 'publie', 1, NOW()),
('Rencontre avec les jeunes entrepreneurs', 'Échanges fructueux avec les jeunes entrepreneurs ivoiriens sur l\'innovation et l\'entrepreneuriat. Discussion sur les défis et opportunités pour développer l\'écosystème entrepreneurial en Côte d\'Ivoire.', 'Échanges sur l\'innovation et l\'entrepreneuriat...', 'https://via.placeholder.com/600x400/f59e0b/ffffff?text=Entrepreneurs', 'standard', 'publie', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Forum sur l\'éducation inclusive', 'Présentation de solutions concrètes pour une éducation de qualité accessible à tous. Focus sur l\'inclusion des enfants en situation de handicap et l\'amélioration des infrastructures scolaires.', 'Des solutions concrètes pour une éducation de qualité...', 'https://via.placeholder.com/600x400/10b981/ffffff?text=Education', 'standard', 'publie', 1, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Index pour optimiser les performances
CREATE INDEX idx_actualites_publie ON actualites (statut, date_publication DESC);
CREATE INDEX idx_parrainages_stats ON parrainages (statut, date_parrainage);
CREATE INDEX idx_utilisateurs_commune ON utilisateurs (commune_id, date_inscription);