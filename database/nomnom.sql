-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS NomNom;
USE NomNom;

-- Tạo bảng Users
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Tạo bảng Restaurants
CREATE TABLE Restaurants (
    id INT PRIMARY KEY,
    res_name VARCHAR(255) NOT NULL,
    res_address TEXT NOT NULL,
    latitude DECIMAL(10, 6) NULL,
    longitude DECIMAL(10, 6) NULL,
    distance DECIMAL(10, 2)
);

-- Tạo bảng Category
CREATE TABLE Category (
    id INT PRIMARY KEY,
    category VARCHAR(255) NOT NULL
);

-- Tạo bảng Dishes
CREATE TABLE Dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    average_rating DECIMAL(3, 1) CHECK (average_rating BETWEEN 1.0 AND 5.0),
    calories INT NOT NULL,
    img_url VARCHAR(2083),
    category_id INT,
    restaurant_id INT,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id) ON DELETE CASCADE
);