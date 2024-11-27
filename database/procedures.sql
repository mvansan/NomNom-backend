USE nomnom

DROP PROCEDURE IF EXISTS FilterDishes;

DELIMITER $$

DROP PROCEDURE IF EXISTS FilterDishes$$

CREATE PROCEDURE FilterDishes(
    IN p_category_id INT,
    IN p_minPrice DECIMAL(10,2),
    IN p_maxPrice DECIMAL(10,2),
    IN p_minCalo INT,
    IN p_maxCalo INT
)
BEGIN
    SELECT * 
    FROM Dishes
    WHERE 
        (p_category_id IS NULL OR category_id = p_category_id)
        AND (p_minPrice IS NULL OR price >= p_minPrice)
        AND (p_maxPrice IS NULL OR price <= p_maxPrice)
        AND (p_minCalo IS NULL OR calories >= p_minCalo)
        AND (p_maxCalo IS NULL OR calories <= p_maxCalo)
    ORDER BY 
        average_rating DESC;
END$$

DELIMITER ;