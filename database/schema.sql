-- Create database
CREATE DATABASE IF NOT EXISTS `511_homes`;
USE `511_homes`;

-- Users table (for future expansion, but we'll use hardcoded for now)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `id_number` VARCHAR(20) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `email` VARCHAR(100) NOT NULL,
  `occupation` VARCHAR(100),
  `next_of_kin_name` VARCHAR(100),
  `next_of_kin_phone` VARCHAR(20),
  `house_number` ENUM('H01','H02','H03','H04','H05','H06','H07','H08','H09','H10') NOT NULL,
  `id_front_path` VARCHAR(255),
  `id_back_path` VARCHAR(255),
  `agreement_pdf_path` VARCHAR(255),
  `status` ENUM('pending','approved','declined') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agreement logs
CREATE TABLE IF NOT EXISTS `agreement_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `tenant_id` INT NOT NULL,
  `pdf_path` VARCHAR(255),
  `email_sent` BOOLEAN DEFAULT FALSE,
  `email_sent_at` TIMESTAMP NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
);

-- Insert default house numbers (optional)
INSERT INTO `tenants` (`full_name`, `id_number`, `phone`, `email`, `occupation`, `next_of_kin_name`, `next_of_kin_phone`, `house_number`) VALUES
('Sample Tenant', '00000000', '0712345678', 'sample@email.com', 'Test', 'Sample Kin', '0712345679', 'H01');