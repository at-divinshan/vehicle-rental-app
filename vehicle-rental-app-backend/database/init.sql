-- For an existing MySQL server: replace your_mysql_password to match .env.
CREATE DATABASE IF NOT EXISTS vehicle_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'vehicle_user'@'localhost' IDENTIFIED BY 'your_mysql_password';
GRANT ALL PRIVILEGES ON vehicle_rental_db.* TO 'vehicle_user'@'localhost';
FLUSH PRIVILEGES;
