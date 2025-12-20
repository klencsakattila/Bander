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
-- Reports
--