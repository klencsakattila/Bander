-- Active: 1741960987478@@127.0.0.1@3306@bander
-- ======================================================
-- Database
-- ======================================================
DROP DATABASE IF EXISTS bander;
CREATE DATABASE bander
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_hungarian_ci;

USE bander;

-- ======================================================
-- User
-- ======================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    city VARCHAR(50),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- Band
-- ======================================================
CREATE TABLE bands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE band_members (
    band_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    PRIMARY KEY (band_id, user_id),
    FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- Instrument
-- ======================================================
CREATE TABLE instruments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_instruments (
    user_id INT NOT NULL,
    instrument_id INT NOT NULL,
    skill_level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    PRIMARY KEY (user_id, instrument_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
);

-- ======================================================
-- Musical Styles
-- ======================================================
CREATE TABLE musical_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_styles (
    user_id INT NOT NULL,
    style_id INT NOT NULL,
    PRIMARY KEY (user_id, style_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES musical_styles(id) ON DELETE CASCADE
);

CREATE TABLE band_styles (
    band_id INT NOT NULL,
    style_id INT NOT NULL,
    PRIMARY KEY (band_id, style_id),
    FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES musical_styles(id) ON DELETE CASCADE
);

-- ======================================================
-- Posts
-- ======================================================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    band_id INT NULL,
    post_type ENUM('search','announcement','general') NOT NULL,
    post_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE SET NULL
);

-- ======================================================
-- Messages & Threads
-- ======================================================
CREATE TABLE threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE thread_users (
    thread_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (thread_id, user_id),
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- Functions, Procedures, Triggers
CREATE FUNCTION login(email VARCHAR(30), pass VARCHAR(100))
RETURNS INTEGER DETERMINISTIC
BEGIN
    DECLARE OK INTEGER;
    SET OK = 0;
    SELECT id INTO OK FROM users WHERE users.email = email AND users.password_hash = SHA2(pass, 256);
    RETURN OK;
END

-- Trigger: hash passwords on insert if not already SHA-256
DELIMITER $$
CREATE TRIGGER hash_user_password_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.password_hash IS NOT NULL AND NOT (NEW.password_hash REGEXP '^[0-9A-Fa-f]{64}$') THEN
        SET NEW.password_hash = SHA2(NEW.password_hash, 256);
    END IF;
END $$
DELIMITER ;

-- Trigger: hash passwords on update if changed and not already SHA-256
DELIMITER $$
CREATE TRIGGER hash_user_password_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.password_hash IS NOT NULL AND NEW.password_hash <> OLD.password_hash
       AND NOT (NEW.password_hash REGEXP '^[0-9A-Fa-f]{64}$') THEN
        SET NEW.password_hash = SHA2(NEW.password_hash, 256);
    END IF;
END $$
DELIMITER ;

-- ======================================================
-- Reports
--
-- Demo seed data
INSERT INTO users (username,email,password_hash,first_name,last_name,city,birth_date) VALUES
('alice','alice@example.com','demo-hash','Alice','Smith','Budapest','1990-05-14'),
('bob','bob@example.com','demo-hash','Bob','Jones','Debrecen','1988-11-02'),
('charlie','charlie@example.com','demo-hash','Charlie','Kovács','Szeged','1995-07-22');

INSERT INTO bands (name,city) VALUES
('The Rockets','Budapest'),
('Blue Notes','Szeged');

INSERT INTO band_members (band_id,user_id,role) VALUES
(1,1,'vocals'),
(1,2,'guitar'),
(2,3,'drums');

INSERT INTO instruments (name) VALUES
('Guitar'),
('Drums'),
('Bass'),
('Vocals');

INSERT INTO user_instruments (user_id,instrument_id,skill_level) VALUES
(1,4,'advanced'),
(2,1,'intermediate'),
(3,2,'beginner');

INSERT INTO musical_styles (name) VALUES
('Rock'),
('Jazz'),
('Pop');

INSERT INTO user_styles (user_id,style_id) VALUES
(1,1),
(2,1),
(2,3),
(3,2);

INSERT INTO band_styles (band_id,style_id) VALUES
(1,1),
(1,3),
(2,2);

INSERT INTO posts (band_id,post_type,post_message) VALUES
(1,'announcement','The Rockets have a gig this Saturday at the Blue Club.'),
(2,'announcement','Blue Notes released a new single this month.'),
(1,'search','The Rockets are looking for a keyboard player for weekend shows.');

INSERT INTO threads (created_at) VALUES (NOW()),(NOW());

INSERT INTO thread_users (thread_id,user_id) VALUES
(1,1),(1,2),(2,2),(2,3);

INSERT INTO messages (thread_id,sender_id,message) VALUES
(1,1,'Hi Bob, are you available for rehearsal?'),
(1,2,'Yes, Alice! Friday works.'),
(2,3,'Hi, anyone playing this weekend?');

-- End demo seed data