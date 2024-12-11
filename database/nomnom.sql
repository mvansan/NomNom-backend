-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS NomNom;
USE NomNom;

-- Tạo bảng Users
CREATE TABLE Users (
    user_id INT PRIMARY KEY,
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
    id INT PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    average_rating DECIMAL(3, 1) CHECK (average_rating BETWEEN 1.0 AND 5.0),
    calories INT NOT NULL,
    img_url VARCHAR(2083),
    desrip VARCHAR(2083) NOT NULL,
    category_id INT,
    restaurant_id INT,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id) ON DELETE CASCADE
);

-- Sprint2 
-- Tạo bảng Cart_items
CREATE TABLE Cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
);

-- Tạo bảng Order_items
CREATE TABLE Order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10, 2),
    status ENUM('confirmed', 'not_confirmed') DEFAULT 'not_confirmed',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
);

-- Tạo bảng Feedback
CREATE TABLE Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 1.0 AND 5.0),
    comment TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
);
-- Tạo bảng Favorite_dish
CREATE TABLE Favorite_dish (
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    is_favorite BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, dish_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES Dishes(id) ON DELETE CASCADE
);
