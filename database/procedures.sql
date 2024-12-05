USE nomnom;

DELIMITER $$

DROP PROCEDURE IF EXISTS FilterDishes$$

CREATE PROCEDURE FilterDishes(
    IN p_category_ids VARCHAR(255),  -- Chuỗi chứa các category_id, phân cách bằng dấu phẩy
    IN p_minPrice DECIMAL(10,2),
    IN p_maxPrice DECIMAL(10,2),
    IN p_minCalo INT,
    IN p_maxCalo INT
)
BEGIN
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
END$$

DELIMITER ;