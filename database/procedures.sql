USE NomNom;

DELIMITER $$

-- Xóa thủ tục cũ nếu có
DROP PROCEDURE IF EXISTS FilterDishes$$

-- Tạo thủ tục FilterDishes
CREATE PROCEDURE FilterDishes(
    IN p_category_ids VARCHAR(255),
    IN p_minPrice DECIMAL(10,2),
    IN p_maxPrice DECIMAL(10,2),
    IN p_minCalo INT,
    IN p_maxCalo INT
)
BEGIN
    -- Lọc món ăn theo các điều kiện
    SELECT 
        d.id, d.dish_name, d.price, d.average_rating, d.calories, d.img_url, d.category_id, 
        r.distance, r.res_address
    FROM Dishes d
    JOIN Restaurants r ON d.restaurant_id = r.id
    WHERE 
        (p_category_ids IS NULL OR p_category_ids = '' OR FIND_IN_SET(d.category_id, p_category_ids) > 0)
        AND (p_minPrice IS NULL OR p_minPrice = '' OR d.price >= p_minPrice)
        AND (p_maxPrice IS NULL OR p_maxPrice = '' OR d.price <= p_maxPrice)
        AND (p_minCalo IS NULL OR p_minCalo = '' OR d.calories >= p_minCalo)
        AND (p_maxCalo IS NULL OR p_maxCalo = '' OR d.calories <= p_maxCalo)
    ORDER BY 
        d.average_rating DESC;
END $$

DELIMITER ;

DELIMITER $$

-- Xóa thủ tục cũ nếu có
DROP PROCEDURE IF EXISTS GetCartItemsByUser$$

-- Tạo thủ tục GetCartItemsByUser
CREATE PROCEDURE GetCartItemsByUser(IN userId INT)
BEGIN
    -- Lấy các món ăn trong giỏ hàng của người dùng
    SELECT 
        Dishes.id, 
        Dishes.dish_name, 
        Dishes.desrip, 
        Dishes.price, 
        Dishes.calories,
        Dishes.img_url, 
        Cart_items.quantity
    FROM Cart_items 
    JOIN Dishes ON Dishes.id = Cart_items.dish_id
    WHERE Cart_items.user_id = userId
    ORDER BY Cart_items.id DESC;
END $$

DELIMITER ;

DELIMITER $$

-- Xóa thủ tục cũ nếu có
DROP PROCEDURE IF EXISTS AddOrUpdateCartItem$$

-- Tạo thủ tục AddOrUpdateCartItem
CREATE PROCEDURE `AddOrUpdateCartItem`(
    IN p_user_id INT, 
    IN p_dish_id INT, 
    IN p_quantity INT
)
BEGIN
    -- Thêm hoặc cập nhật món ăn trong giỏ hàng
    IF EXISTS (SELECT 1 FROM Cart_items WHERE user_id = p_user_id AND dish_id = p_dish_id) THEN
        UPDATE Cart_items
        SET quantity = quantity + p_quantity
        WHERE user_id = p_user_id AND dish_id = p_dish_id;
    ELSE
        INSERT INTO Cart_items (user_id, dish_id, quantity)
        VALUES (p_user_id, p_dish_id, p_quantity);
    END IF;

    -- Trả về số lần món ăn xuất hiện trong giỏ hàng
    SELECT COUNT(DISTINCT dish_id) AS total_dishes
    FROM Cart_items
    WHERE user_id = p_user_id;
END $$

DELIMITER ;

DELIMITER $$

-- Xóa thủ tục cũ nếu có
DROP PROCEDURE IF EXISTS placeOrder$$

CREATE PROCEDURE placeOrder(
    IN user_id INT,
    IN dish_id INT
)
BEGIN
    -- Đặt món ăn vào đơn hàng
    DECLARE dish_price DECIMAL(10, 2);
    DECLARE dish_quantity INT;
    DECLARE total DECIMAL(10, 2);
    
    SELECT price INTO dish_price
    FROM Dishes
    WHERE id = dish_id;
    
    IF dish_price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Dish not found';
    END IF;
    
    SELECT quantity INTO dish_quantity
    FROM Cart_items
    WHERE user_id = user_id AND dish_id = dish_id
    LIMIT 1;
    
    IF dish_quantity IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Dish not found in cart';
    END IF;
    
    SET total = dish_price * dish_quantity;
    
    INSERT INTO Order_items (user_id, dish_id, price, quantity, total, status)
    VALUES (user_id, dish_id, dish_price, dish_quantity, total, 'not_confirmed');
    
    SELECT 'Order placed successfully' AS message, total AS totalOrderPrice;
END$$

DELIMITER ;

DELIMITER $$

-- Xóa thủ tục cũ nếu có
DROP PROCEDURE IF EXISTS confirm_order$$

CREATE PROCEDURE confirm_order(IN p_order_id INT)
BEGIN
    -- Xác nhận đơn hàng
    UPDATE Order_items
    SET status = 'confirmed'
    WHERE id = p_order_id AND status = 'not_confirmed';
    
    IF ROW_COUNT() = 0 THEN
        SELECT 'No order found to confirm' AS message;
    ELSE
        SELECT 'Order confirmed successfully' AS message;
    END IF;
END$$

DELIMITER ;


DELIMITER $$

DROP PROCEDURE IF EXISTS get_pending_orders$$

CREATE PROCEDURE get_pending_orders(IN p_user_id INT)
BEGIN
    SELECT 
        oi.id AS id,
        d.dish_name AS name,
        d.calories,
        d.desrip AS description,
        oi.price,
        oi.quantity,
        d.img_url AS image,
        CASE 
            WHEN oi.status = 'confirmed' THEN TRUE 
            ELSE FALSE 
        END AS confirmed
    FROM 
        Order_items oi
    JOIN 
        Dishes d ON oi.dish_id = d.id
    WHERE 
        oi.user_id = p_user_id AND oi.status = 'not_confirmed'
    ORDER BY oi.id DESC;
END$$

DELIMITER ;


DELIMITER $$

DROP PROCEDURE IF EXISTS get_orders_history$$

CREATE PROCEDURE get_orders_history(IN p_user_id INT)
BEGIN
    SELECT 
        oi.id AS order_id,
        oi.dish_id AS dish_id,
        d.dish_name AS name,
        oi.quantity,
        oi.total AS total_price,
        d.img_url AS image,
        CASE 
            WHEN oi.status = 'confirmed' THEN TRUE 
            ELSE FALSE 
        END AS confirmed
    FROM 
        Order_items oi
    JOIN 
        Dishes d ON oi.dish_id = d.id
    WHERE 
        oi.user_id = p_user_id AND oi.status = 'confirmed'
    ORDER BY oi.id DESC;
END$$

DELIMITER ;


DELIMITER $$

DROP PROCEDURE IF EXISTS rate_dish$$

CREATE PROCEDURE rate_dish(
    IN p_user_id INT, 
    IN p_order_id INT, 
    IN p_dish_id INT, 
    IN p_rating DECIMAL(2, 1),
    IN p_comment TEXT
)
BEGIN
    DECLARE order_status VARCHAR(255);
    
    SELECT status INTO order_status
    FROM Order_items
    WHERE id = p_order_id AND user_id = p_user_id;
    
    IF order_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;
    
    IF order_status != 'confirmed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not confirmed';
    END IF;
    
    INSERT INTO Feedback (user_id, dish_id, rating, comment)
    VALUES (p_user_id, p_dish_id, p_rating, p_comment)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment);
    
    SELECT 'Dish rated successfully' AS message;
END$$

DELIMITER ;
