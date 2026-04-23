
-- ============================================================================
-- GreenGrow :: data_analysis_queries.sql
-- MIS 330 Group Project - Spring 2026
--
-- Purpose: Twelve analysis queries that answer realistic business questions
-- against the GreenGrow database. Each query is labelled with (a) the
-- question it answers, (b) the SQL features it exercises, and (c) the
-- tables it touches. Collectively they cover:
--   * INNER JOIN across 2+ tables
--   * LEFT JOIN to find "missing" rows
--   * GROUP BY with multiple aggregates (COUNT, SUM, AVG, MAX)
--   * HAVING
--   * Subqueries (both scalar and IN)
--   * GROUP_CONCAT (MySQL string aggregation)
--   * Date functions (DATE, MONTH)
--   * ORDER BY + LIMIT for "top N" reports
-- ============================================================================

USE greengrow;

-- ----------------------------------------------------------------------------
-- 1. Full product catalog with category name.
--    Question:  "What are we selling, and what shelf is each item on?"
--    Features:  INNER JOIN, ORDER BY.
--    Tables:    Product, ProductCategory.
-- ----------------------------------------------------------------------------
SELECT p.ProductID,
       p.ProductName,
       c.CategoryName,
       p.ProductCost,
       p.Quantity AS StockOnHand
FROM Product p
INNER JOIN ProductCategory c ON c.CategoryID = p.CategoryID
ORDER BY c.CategoryName, p.ProductName;

-- ----------------------------------------------------------------------------
-- 2. Top 5 best-selling products (by total units sold).
--    Question:  "Which SKUs are flying off the shelf?"
--    Features:  INNER JOIN, GROUP BY, SUM, ORDER BY DESC, LIMIT.
--    Tables:    Product, OrderContains.
--    Notes:     Exercises the OrderContains.Quantity column added in Stage 1 feedback.
-- ----------------------------------------------------------------------------
SELECT p.ProductID,
       p.ProductName,
       SUM(oc.Quantity)  AS TotalUnitsSold,
       SUM(oc.LineTotal) AS RevenueFromProduct
FROM OrderContains oc
INNER JOIN Product p ON p.ProductID = oc.ProductID
GROUP BY p.ProductID, p.ProductName
ORDER BY TotalUnitsSold DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- 3. Revenue by product category.
--    Question:  "Which category is actually making us money?"
--    Features:  3-way INNER JOIN, GROUP BY, SUM.
--    Tables:    ProductCategory, Product, OrderContains.
-- ----------------------------------------------------------------------------
SELECT c.CategoryName,
       COUNT(DISTINCT p.ProductID) AS DistinctProductsSold,
       SUM(oc.Quantity)            AS UnitsSold,
       SUM(oc.LineTotal)           AS CategoryRevenue
FROM ProductCategory c
INNER JOIN Product       p  ON p.CategoryID  = c.CategoryID
INNER JOIN OrderContains oc ON oc.ProductID = p.ProductID
GROUP BY c.CategoryID, c.CategoryName
ORDER BY CategoryRevenue DESC;

-- ----------------------------------------------------------------------------
-- 4. Top customers by lifetime spend (with email for contact).
--    Question:  "Who are our VIPs? Only customers who've spent > $50."
--    Features:  4-way JOIN across User, Order, UserEmail; GROUP BY; HAVING.
--    Tables:    User, UserEmail, Order.
-- ----------------------------------------------------------------------------
SELECT u.UserID,
       CONCAT(u.Fname, ' ', u.Lname) AS CustomerName,
       MIN(ue.UserEmail)             AS PrimaryEmail,
       COUNT(o.OrderID)              AS OrderCount,
       SUM(o.OrderTotal)             AS LifetimeSpend
FROM `User` u
INNER JOIN UserEmail ue ON ue.UserID  = u.UserID
INNER JOIN `Order`   o  ON o.UserID   = u.UserID
GROUP BY u.UserID, u.Fname, u.Lname
HAVING SUM(o.OrderTotal) > 50
ORDER BY LifetimeSpend DESC;

-- ----------------------------------------------------------------------------
-- 5. Overall store KPIs on one row.
--    Question:  "Give me the one-liner for the exec dashboard."
--    Features:  Multiple scalar subqueries in a single SELECT.
--    Tables:    Order, Product, `User`.
-- ----------------------------------------------------------------------------
SELECT
    (SELECT COUNT(*)   FROM `Order`)                       AS TotalOrders,
    (SELECT SUM(OrderTotal) FROM `Order`)                  AS TotalRevenue,
    (SELECT AVG(OrderTotal) FROM `Order`)                  AS AvgOrderValue,
    (SELECT COUNT(*)   FROM `User`)                        AS TotalCustomers,
    (SELECT SUM(Quantity) FROM Product)                    AS TotalUnitsInStock;

-- ----------------------------------------------------------------------------
-- 6. Low-stock alert (fewer than 10 units on hand).
--    Question:  "What do we need to reorder right now?"
--    Features:  INNER JOIN, WHERE, ORDER BY.
--    Tables:    Product, ProductCategory.
-- ----------------------------------------------------------------------------
SELECT p.ProductID,
       p.ProductName,
       c.CategoryName,
       p.Quantity AS UnitsOnHand
FROM Product p
INNER JOIN ProductCategory c ON c.CategoryID = p.CategoryID
WHERE p.Quantity < 10
ORDER BY p.Quantity ASC;

-- ----------------------------------------------------------------------------
-- 7. Products that have NEVER been ordered.
--    Question:  "Which SKUs are dead weight — zero sales to date?"
--    Features:  LEFT JOIN + IS NULL pattern ("anti-join").
--    Tables:    Product, OrderContains.
-- ----------------------------------------------------------------------------
SELECT p.ProductID,
       p.ProductName,
       p.Quantity AS UnitsOnHand
FROM Product p
LEFT JOIN OrderContains oc ON oc.ProductID = p.ProductID
WHERE oc.ProductID IS NULL
ORDER BY p.ProductName;

-- ----------------------------------------------------------------------------
-- 8. Employee-to-product tracking summary.
--    Question:  "Which employee watches which products, and how many each?"
--    Features:  3-way JOIN, GROUP BY, COUNT, GROUP_CONCAT (MySQL).
--    Tables:    Employee, EmployeeTracks, Product.
-- ----------------------------------------------------------------------------
SELECT e.EmployeeID,
       CONCAT(e.Fname, ' ', e.Lname) AS EmployeeName,
       e.JobPosition,
       COUNT(et.ProductID)           AS ProductsTracked,
       GROUP_CONCAT(p.ProductName ORDER BY p.ProductName SEPARATOR ', ') AS TrackedItems
FROM Employee e
LEFT JOIN EmployeeTracks et ON et.EmployeeID = e.EmployeeID
LEFT JOIN Product        p  ON p.ProductID   = et.ProductID
GROUP BY e.EmployeeID, e.Fname, e.Lname, e.JobPosition
ORDER BY ProductsTracked DESC;

-- ----------------------------------------------------------------------------
-- 9. Customers with more than one email on file (multi-valued attribute demo).
--    Question:  "Who has multiple contact emails we should dedupe?"
--    Features:  GROUP BY, HAVING.
--    Tables:    User, UserEmail.
-- ----------------------------------------------------------------------------
SELECT u.UserID,
       CONCAT(u.Fname, ' ', u.Lname) AS CustomerName,
       COUNT(ue.UserEmail)           AS EmailCount,
       GROUP_CONCAT(ue.UserEmail SEPARATOR '; ') AS Emails
FROM `User` u
INNER JOIN UserEmail ue ON ue.UserID = u.UserID
GROUP BY u.UserID, u.Fname, u.Lname
HAVING COUNT(ue.UserEmail) > 1;

-- ----------------------------------------------------------------------------
-- 10. Monthly sales trend.
--     Question:  "How did each month perform this year?"
--     Features:  Date functions (YEAR/MONTH), GROUP BY, SUM, COUNT.
--     Tables:    Order.
-- ----------------------------------------------------------------------------
SELECT YEAR(OrderDate)  AS OrderYear,
       MONTH(OrderDate) AS OrderMonth,
       COUNT(*)         AS OrdersPlaced,
       SUM(OrderTotal)  AS MonthlyRevenue
FROM `Order`
GROUP BY YEAR(OrderDate), MONTH(OrderDate)
ORDER BY OrderYear, OrderMonth;

-- ----------------------------------------------------------------------------
-- 11. Products that appear in more than one order (repeat sellers).
--     Question:  "Which items are consistently re-bought?"
--     Features:  Subquery in WHERE with IN, aggregation over junction table.
--     Tables:    Product, OrderContains.
-- ----------------------------------------------------------------------------
SELECT p.ProductID,
       p.ProductName,
       (SELECT COUNT(DISTINCT oc.OrderID)
          FROM OrderContains oc
         WHERE oc.ProductID = p.ProductID) AS OrdersFeaturedIn
FROM Product p
WHERE p.ProductID IN (
    SELECT oc.ProductID
    FROM OrderContains oc
    GROUP BY oc.ProductID
    HAVING COUNT(DISTINCT oc.OrderID) > 1
)
ORDER BY OrdersFeaturedIn DESC, p.ProductName;

-- ----------------------------------------------------------------------------
-- 12. Detailed order report — customer, order header, every line item.
--     Question:  "Show me a printable receipt for every order."
--     Features:  5-way INNER JOIN, ORDER BY multiple keys.
--     Tables:    Order, User, UserEmail, OrderContains, Product, ProductCategory.
-- ----------------------------------------------------------------------------
SELECT o.OrderConfirmation,
       o.OrderDate,
       CONCAT(u.Fname, ' ', u.Lname) AS Customer,
       MIN(ue.UserEmail)             AS CustomerEmail,
       p.ProductName,
       c.CategoryName,
       oc.Quantity,
       oc.LineTotal,
       o.OrderTotal
FROM `Order` o
INNER JOIN `User`         u  ON u.UserID     = o.UserID
INNER JOIN UserEmail      ue ON ue.UserID    = u.UserID
INNER JOIN OrderContains  oc ON oc.OrderID   = o.OrderID
INNER JOIN Product        p  ON p.ProductID  = oc.ProductID
INNER JOIN ProductCategory c ON c.CategoryID = p.CategoryID
GROUP BY o.OrderID, o.OrderConfirmation, o.OrderDate, u.Fname, u.Lname,
         p.ProductID, p.ProductName, c.CategoryName, oc.Quantity,
         oc.LineTotal, o.OrderTotal
ORDER BY o.OrderDate DESC, o.OrderConfirmation, p.ProductName;
