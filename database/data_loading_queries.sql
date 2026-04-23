-- ============================================================================
-- GreenGrow :: data_loading_queries.sql
-- MIS 330 Group Project - Spring 2026
--
-- Purpose: Populate every table created in database_creation_queries.sql
-- with realistic demo data. Insert order matters because of FK constraints:
--   1) ProductCategory   -> Product
--   2) User              -> UserEmail, UserPhone, Order
--   3) Employee          -> EmployeePhone, EmployeeTracks
--   4) Product           -> OrderContains, EmployeeTracks
--   5) Order             -> OrderContains
--
-- Passwords below are real BCrypt (cost=10) hashes — the running app can
-- authenticate against this data. The cleartext is documented next to each
-- hash for grading / demo purposes only.
-- ============================================================================

USE greengrow;

-- ----------------------------------------------------------------------------
-- ProductCategory  (5 rows)
-- ----------------------------------------------------------------------------
INSERT INTO ProductCategory (CategoryName) VALUES
    ('Indoor Plants'),
    ('Outdoor Plants'),
    ('Seeds'),
    ('Tools'),
    ('Fertilizer & Soil');

-- ----------------------------------------------------------------------------
-- Product  (8 rows — spans every category, two rows are low-stock on purpose
-- so the "low stock alert" analysis query has data to find)
-- ----------------------------------------------------------------------------
INSERT INTO Product (ProductName, ProductDescription, ProductCost, Quantity, CategoryID) VALUES
    ('Monstera Deliciosa',   'Large tropical split-leaf houseplant.',        34.99,  25, 1),
    ('Snake Plant',          'Low-light, low-water hardy houseplant.',       18.50,  40, 1),
    ('Tomato Seeds (Pack)',  'Heirloom tomato seed pack, approx. 50 seeds.',  3.99, 200, 3),
    ('Hand Trowel',          'Stainless steel garden hand trowel.',          12.00,  60, 4),
    ('Organic Compost 20lb', 'Premium organic compost, 20 pound bag.',       14.75,  80, 5),
    ('Lavender Plant',       'Fragrant outdoor perennial.',                   9.99,  30, 2),
    ('Pruning Shears',       'Bypass pruners for stems up to 3/4 inch.',     24.50,   7, 4),  -- low stock
    ('Basil Seeds (Pack)',   'Genovese basil, approx. 75 seeds.',             2.99,   4, 3);  -- low stock

-- ----------------------------------------------------------------------------
-- User  (4 rows — BCrypt hashes of password1..password4)
--   jordan.smith@example.com  / password1
--   linh.nguyen@example.com   / password2
--   miguel.garcia@example.com / password3
--   alex.rivera@example.com   / password4
-- ----------------------------------------------------------------------------
INSERT INTO `User` (Lname, Fname, Password) VALUES
    ('Smith',  'Jordan', '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
    ('Nguyen', 'Linh',   '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q'),
    ('Garcia', 'Miguel', '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y'),
    ('Rivera', 'Alex',   '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y');

-- Multi-valued: Jordan has two email addresses to exercise the relationship.
INSERT INTO UserEmail (UserEmail, UserID) VALUES
    ('jordan.smith@example.com',     1),
    ('jordan.s.backup@example.com',  1),
    ('linh.nguyen@example.com',      2),
    ('miguel.garcia@example.com',    3),
    ('alex.rivera@example.com',      4);

INSERT INTO UserPhone (UserPhoneNum, UserID) VALUES
    ('205-555-0101', 1),
    ('205-555-0102', 2),
    ('205-555-0103', 3),
    ('205-555-0104', 4);

-- ----------------------------------------------------------------------------
-- Employee  (3 rows — BCrypt hashes of admin1..admin3)
--   Priya Patel    / admin1
--   Marcus Johnson / admin2
--   Hana Kim       / admin3
-- ----------------------------------------------------------------------------
INSERT INTO Employee (Lname, Fname, JobPosition, Password) VALUES
    ('Patel',   'Priya',  'Inventory Manager', '$2b$10$MQIlBuuMLf9jkuUfNa.j7OTIQ.oEhlMSn3Wv1eQgK7cc9lscmmrpS'),
    ('Johnson', 'Marcus', 'Floor Associate',   '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm'),
    ('Kim',     'Hana',   'Store Lead',        '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm');

INSERT INTO EmployeePhone (EmployeePhone, EmployeeID) VALUES
    ('205-555-0201', 1),
    ('205-555-0202', 2),
    ('205-555-0203', 3);

-- ----------------------------------------------------------------------------
-- EmployeeTracks  (which employees monitor which products)
-- Hana (#3) overlaps Priya on two products to exercise the many-to-many.
-- ----------------------------------------------------------------------------
INSERT INTO EmployeeTracks (EmployeeID, ProductID) VALUES
    (1, 1), (1, 2), (1, 5), (1, 7),   -- Priya: Monstera, Snake, Compost, Shears
    (2, 3), (2, 4), (2, 6), (2, 8),   -- Marcus: Tomato, Trowel, Lavender, Basil
    (3, 1), (3, 7);                    -- Hana: Monstera, Shears (overlaps)

-- ----------------------------------------------------------------------------
-- Order  (5 rows across multiple users and dates so the analysis queries
-- have variety to aggregate over)
-- ----------------------------------------------------------------------------
INSERT INTO `Order` (OrderDate, OrderTotal, OrderConfirmation, UserID) VALUES
    ('2026-03-14 10:15:00', 73.48, 'GG-2026-0001', 1),  -- Jordan
    ('2026-03-21 14:02:00',  9.99, 'GG-2026-0002', 2),  -- Linh
    ('2026-04-02 09:30:00', 52.49, 'GG-2026-0003', 3),  -- Miguel
    ('2026-04-10 17:45:00', 29.48, 'GG-2026-0004', 1),  -- Jordan (repeat customer)
    ('2026-04-18 12:00:00', 64.47, 'GG-2026-0005', 4);  -- Alex

-- ----------------------------------------------------------------------------
-- OrderContains  (Quantity column is the Stage 1 feedback demo)
-- Line totals reconcile to the OrderTotal stored on the parent row.
-- ----------------------------------------------------------------------------
INSERT INTO OrderContains (OrderID, ProductID, Quantity, LineTotal) VALUES
    -- Order 1 (Jordan): Monstera + Trowel + 3x Tomato Seeds + Compost  -> 73.48
    (1, 1, 1, 34.99),
    (1, 4, 1, 12.00),
    (1, 3, 3, 11.97),
    (1, 5, 1, 14.52),
    -- Order 2 (Linh): Lavender -> 9.99
    (2, 6, 1,  9.99),
    -- Order 3 (Miguel): Snake + Shears + 3x Basil Seeds -> 52.49
    (3, 2, 1, 18.50),
    (3, 7, 1, 24.50),
    (3, 8, 3,  9.49),
    -- Order 4 (Jordan): 2x Basil + Compost + 2x Tomato -> 29.48
    (4, 8, 2,  5.98),
    (4, 5, 1, 14.75),
    (4, 3, 2,  8.75),
    -- Order 5 (Alex): Monstera + 2x Lavender + Shears(sale) -> 64.47
    (5, 1, 1, 34.99),
    (5, 6, 2, 19.98),
    (5, 7, 1,  9.50);

-- ----------------------------------------------------------------------------
-- Sanity: how many rows landed in each table?
-- ----------------------------------------------------------------------------
SELECT 'ProductCategory' AS table_name, COUNT(*) AS row_count FROM ProductCategory
UNION ALL SELECT 'Product',        COUNT(*) FROM Product
UNION ALL SELECT 'User',           COUNT(*) FROM `User`
UNION ALL SELECT 'UserEmail',      COUNT(*) FROM UserEmail
UNION ALL SELECT 'UserPhone',      COUNT(*) FROM UserPhone
UNION ALL SELECT 'Employee',       COUNT(*) FROM Employee
UNION ALL SELECT 'EmployeePhone',  COUNT(*) FROM EmployeePhone
UNION ALL SELECT 'EmployeeTracks', COUNT(*) FROM EmployeeTracks
UNION ALL SELECT 'Order',          COUNT(*) FROM `Order`
UNION ALL SELECT 'OrderContains',  COUNT(*) FROM OrderContains;
