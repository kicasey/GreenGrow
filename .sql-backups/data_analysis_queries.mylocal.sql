-- ============================================================================
-- GreenGrow - Data Analysis Queries
-- MIS 330 Group Project - Spring 2026
-- Team: Katelyn Casey, Jabari, Carter
--
-- 10 analytical queries covering:
--   Sales & Revenue Analysis   (Queries 1-3)
--   Customer Insights          (Queries 4-6)
--   Product Insights           (Queries 7-8)
--   Inventory Management       (Queries 9-10)
--
-- Run this AFTER database_creation_queries.sql and data_loading_queries.sql.
-- Usage:  mysql -u root -p greengrow < data_analysis_queries.sql
-- ============================================================================

USE greengrow;

-- =========================================================================
-- SALES & REVENUE ANALYSIS
-- =========================================================================

-- Query 1: Total sales revenue by month
-- Shows monthly revenue trends so the business can track performance over time.
-- -------------------------------------------------------------------------
SELECT
    DATE_FORMAT(o.OrderDate, '%Y-%m')   AS order_month,
    COUNT(DISTINCT o.OrderID)           AS total_orders,
    SUM(o.OrderTotal)                   AS monthly_revenue
FROM `Order` o
GROUP BY DATE_FORMAT(o.OrderDate, '%Y-%m')
ORDER BY order_month;


-- Query 2: Revenue breakdown by product category
-- Identifies which product categories generate the most revenue.
-- -------------------------------------------------------------------------
SELECT
    pc.CategoryName,
    SUM(oc.Quantity)    AS units_sold,
    SUM(oc.LineTotal)   AS category_revenue
FROM OrderContains oc
JOIN Product p        ON oc.ProductID  = p.ProductID
JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
GROUP BY pc.CategoryName
ORDER BY category_revenue DESC;


-- Query 3: Average order value and average items per order
-- Helps understand typical order size and spending behavior.
-- -------------------------------------------------------------------------
SELECT
    COUNT(DISTINCT o.OrderID)                                       AS total_orders,
    ROUND(AVG(o.OrderTotal), 2)                                     AS avg_order_value,
    ROUND(SUM(oc.Quantity) / COUNT(DISTINCT o.OrderID), 2)          AS avg_items_per_order
FROM `Order` o
JOIN OrderContains oc ON o.OrderID = oc.OrderID;


-- =========================================================================
-- CUSTOMER INSIGHTS
-- =========================================================================

-- Query 4: Top customers by total spending
-- Identifies the highest-value customers for loyalty or marketing efforts.
-- -------------------------------------------------------------------------
SELECT
    u.UserID,
    CONCAT(u.Fname, ' ', u.Lname) AS customer_name,
    COUNT(DISTINCT o.OrderID)      AS order_count,
    SUM(o.OrderTotal)              AS total_spent
FROM `User` u
JOIN `Order` o ON u.UserID = o.UserID
GROUP BY u.UserID, u.Fname, u.Lname
ORDER BY total_spent DESC;


-- Query 5: Customer order frequency — repeat vs. one-time buyers
-- Segments customers to understand retention.
-- -------------------------------------------------------------------------
SELECT
    CASE
        WHEN order_count = 1 THEN 'One-Time Buyer'
        WHEN order_count = 2 THEN 'Repeat Buyer'
        ELSE 'Loyal Customer (3+)'
    END                         AS customer_segment,
    COUNT(*)                    AS num_customers
FROM (
    SELECT u.UserID, COUNT(o.OrderID) AS order_count
    FROM `User` u
    LEFT JOIN `Order` o ON u.UserID = o.UserID
    GROUP BY u.UserID
) AS customer_orders
GROUP BY customer_segment
ORDER BY num_customers DESC;


-- Query 6: Customers with their most recent order date and email
-- Useful for re-engagement campaigns targeting inactive customers.
-- -------------------------------------------------------------------------
SELECT
    u.UserID,
    CONCAT(u.Fname, ' ', u.Lname) AS customer_name,
    ue.UserEmail                   AS email,
    MAX(o.OrderDate)               AS last_order_date,
    DATEDIFF(NOW(), MAX(o.OrderDate)) AS days_since_last_order
FROM `User` u
LEFT JOIN UserEmail ue ON u.UserID = ue.UserID
LEFT JOIN `Order` o    ON u.UserID = o.UserID
GROUP BY u.UserID, u.Fname, u.Lname, ue.UserEmail
ORDER BY last_order_date DESC;


-- =========================================================================
-- PRODUCT INSIGHTS
-- =========================================================================

-- Query 7: Best-selling products by total units sold
-- Identifies which individual products drive the most volume.
-- -------------------------------------------------------------------------
SELECT
    p.ProductID,
    p.ProductName,
    pc.CategoryName,
    SUM(oc.Quantity)  AS total_units_sold,
    SUM(oc.LineTotal) AS total_revenue
FROM Product p
JOIN OrderContains oc   ON p.ProductID  = oc.ProductID
JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
GROUP BY p.ProductID, p.ProductName, pc.CategoryName
ORDER BY total_units_sold DESC;


-- Query 8: Products that have never been ordered
-- Flags items that may need a promotion or removal from inventory.
-- -------------------------------------------------------------------------
SELECT
    p.ProductID,
    p.ProductName,
    pc.CategoryName,
    p.Quantity AS stock_on_hand
FROM Product p
JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
LEFT JOIN OrderContains oc ON p.ProductID = oc.ProductID
WHERE oc.ProductID IS NULL;


-- =========================================================================
-- INVENTORY MANAGEMENT
-- =========================================================================

-- Query 9: Current stock levels with low-stock alert
-- Flags products with 20 or fewer units remaining so staff can reorder.
-- -------------------------------------------------------------------------
SELECT
    p.ProductID,
    p.ProductName,
    pc.CategoryName,
    p.Quantity AS stock_on_hand,
    CASE
        WHEN p.Quantity = 0  THEN 'OUT OF STOCK'
        WHEN p.Quantity <= 20 THEN 'LOW STOCK'
        ELSE 'In Stock'
    END AS stock_status
FROM Product p
JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
ORDER BY p.Quantity ASC;


-- Query 10: Employee product tracking summary
-- Shows how many products each employee is responsible for and their total stock.
-- -------------------------------------------------------------------------
SELECT
    e.EmployeeID,
    CONCAT(e.Fname, ' ', e.Lname) AS employee_name,
    e.JobPosition,
    COUNT(et.ProductID)            AS products_tracked,
    SUM(p.Quantity)                AS total_stock_managed
FROM Employee e
LEFT JOIN EmployeeTracks et ON e.EmployeeID = et.EmployeeID
LEFT JOIN Product p         ON et.ProductID  = p.ProductID
GROUP BY e.EmployeeID, e.Fname, e.Lname, e.JobPosition
ORDER BY products_tracked DESC;
