-- ============================================================================
-- GreenGrow - Data Loading Queries
-- MIS 330 Group Project - Spring 2026
-- Team: Katelyn Casey, Jabari, Carter
--
-- Run this AFTER database_creation_queries.sql.
-- Every table contains at least 5 rows of sample data.
-- Usage:  mysql -u root -p greengrow < data_loading_queries.sql
-- ============================================================================

USE greengrow;

-- -------------------------------------------------------
-- PRODUCT CATEGORIES (5 rows)
-- -------------------------------------------------------
INSERT INTO ProductCategory (CategoryName) VALUES
    ('Indoor Plants'),
    ('Outdoor Plants'),
    ('Seeds'),
    ('Tools'),
    ('Fertilizer & Soil');

-- -------------------------------------------------------
-- PRODUCTS (10 rows, at least 2 per category)
-- -------------------------------------------------------
INSERT INTO Product (ProductName, ProductDescription, ProductCost, Quantity, CategoryID) VALUES
    ('Monstera Deliciosa',   'Large tropical split-leaf houseplant.',         34.99, 25, 1),
    ('Snake Plant',          'Low-light, low-water hardy houseplant.',        18.50, 40, 1),
    ('Tomato Seeds (Pack)',  'Heirloom tomato seed pack, approx. 50 seeds.',   3.99, 200, 3),
    ('Hand Trowel',          'Stainless steel garden hand trowel.',           12.00, 60, 4),
    ('Organic Compost 20lb', 'Premium organic compost, 20 pound bag.',        14.75, 80, 5),
    ('Lavender Plant',       'Fragrant outdoor perennial.',                    9.99, 30, 2),
    ('Pothos (Golden)',      'Trailing vine, excellent air purifier.',        12.99, 35, 1),
    ('Rose Bush (Red)',      'Classic red hybrid tea rose bush.',             22.50, 15, 2),
    ('Basil Seeds (Pack)',   'Sweet basil herb seed pack, approx. 100.',      2.49, 300, 3),
    ('Pruning Shears',       'Bypass pruning shears, ergonomic grip.',        19.95, 45, 4);

-- -------------------------------------------------------
-- USERS (5 rows)
-- Passwords are BCrypt hashes (cost=10).
-- Cleartext:
--   jordan.smith@example.com  / password1
--   linh.nguyen@example.com   / password2
--   miguel.garcia@example.com / password3
--   taylor.jones@example.com  / password4
--   alex.lee@example.com      / password5
-- -------------------------------------------------------
INSERT INTO `User` (Lname, Fname, Password) VALUES
    ('Smith',   'Jordan',  '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
    ('Nguyen',  'Linh',    '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q'),
    ('Garcia',  'Miguel',  '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y'),
    ('Jones',   'Taylor',  '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
    ('Lee',     'Alex',    '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q');

-- -------------------------------------------------------
-- USER EMAILS (5 rows)
-- -------------------------------------------------------
INSERT INTO UserEmail (UserEmail, UserID) VALUES
    ('jordan.smith@example.com',  1),
    ('linh.nguyen@example.com',   2),
    ('miguel.garcia@example.com', 3),
    ('taylor.jones@example.com',  4),
    ('alex.lee@example.com',      5);

-- -------------------------------------------------------
-- USER PHONES (5 rows)
-- -------------------------------------------------------
INSERT INTO UserPhone (UserPhoneNum, UserID) VALUES
    ('205-555-0101', 1),
    ('205-555-0102', 2),
    ('205-555-0103', 3),
    ('205-555-0104', 4),
    ('205-555-0105', 5);

-- -------------------------------------------------------
-- EMPLOYEES (5 rows)
-- Cleartext:
--   Employee 1 (Priya Patel)      / admin1
--   Employee 2 (Marcus Johnson)   / admin2
--   Employee 3 (Sofia Rivera)     / admin3
--   Employee 4 (Derek Kim)        / admin4
--   Employee 5 (Nia Washington)   / admin5
-- -------------------------------------------------------
INSERT INTO Employee (Lname, Fname, JobPosition, Password) VALUES
    ('Patel',      'Priya',  'Inventory Manager', '$2b$10$MQIlBuuMLf9jkuUfNa.j7OTIQ.oEhlMSn3Wv1eQgK7cc9lscmmrpS'),
    ('Johnson',    'Marcus', 'Floor Associate',   '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm'),
    ('Rivera',     'Sofia',  'Sales Lead',        '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
    ('Kim',        'Derek',  'Warehouse Staff',   '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q'),
    ('Washington', 'Nia',    'Customer Support',  '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y');

-- -------------------------------------------------------
-- EMPLOYEE PHONES (5 rows)
-- -------------------------------------------------------
INSERT INTO EmployeePhone (EmployeePhone, EmployeeID) VALUES
    ('205-555-0201', 1),
    ('205-555-0202', 2),
    ('205-555-0203', 3),
    ('205-555-0204', 4),
    ('205-555-0205', 5);

-- -------------------------------------------------------
-- EMPLOYEE TRACKS (8 rows - which employees manage which products)
-- -------------------------------------------------------
INSERT INTO EmployeeTracks (EmployeeID, ProductID) VALUES
    (1, 1), (1, 2), (1, 7),
    (2, 3), (2, 9),
    (3, 6), (3, 8),
    (4, 4), (4, 5), (4, 10),
    (5, 1), (5, 6);

-- -------------------------------------------------------
-- ORDERS (6 rows)
-- -------------------------------------------------------
INSERT INTO `Order` (OrderDate, OrderTotal, OrderConfirmation, UserID) VALUES
    ('2026-03-01 10:15:00', 53.49, 'GG-2026-0001', 1),
    ('2026-03-05 14:30:00',  9.99, 'GG-2026-0002', 2),
    ('2026-03-10 09:00:00', 47.48, 'GG-2026-0003', 3),
    ('2026-03-18 16:45:00', 26.74, 'GG-2026-0004', 4),
    ('2026-04-02 11:20:00', 72.47, 'GG-2026-0005', 1),
    ('2026-04-10 13:00:00', 15.98, 'GG-2026-0006', 5);

-- -------------------------------------------------------
-- ORDER CONTAINS (12 rows - line items for the orders above)
-- -------------------------------------------------------
INSERT INTO OrderContains (OrderID, ProductID, Quantity, LineTotal) VALUES
    (1, 1, 1, 34.99),
    (1, 4, 1, 12.00),
    (1, 3, 1,  3.99),
    (1, 5, 1,  2.51),
    (2, 6, 1,  9.99),
    (3, 2, 1, 18.50),
    (3, 10, 1, 19.95),
    (3, 9, 1,  2.49),
    (3, 3, 1,  3.99),
    (4, 7, 1, 12.99),
    (4, 5, 1, 14.75),
    (5, 1, 2, 69.98),
    (5, 9, 1,  2.49),
    (6, 6, 1,  9.99),
    (6, 3, 1,  3.99);
