-- ============================================================================
-- GreenGrow Database Schema
-- MIS 330 Group Project - Spring 2026
-- Target: MySQL 8.x
--
-- Teacher feedback addressed:
--   * Employee table now has Password column
--   * OrderContains (Contains relationship) now has Quantity attribute
-- ============================================================================

DROP DATABASE IF EXISTS greengrow;
CREATE DATABASE greengrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greengrow;

-- ----------------------------------------------------------------------------
-- USER (strong entity)
-- ----------------------------------------------------------------------------
CREATE TABLE `User` (
    UserID      INT AUTO_INCREMENT PRIMARY KEY,
    Lname       VARCHAR(60)  NOT NULL,
    Fname       VARCHAR(60)  NOT NULL,
    Password    VARCHAR(255) NOT NULL,
    CreatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Multi-valued attribute: User email addresses
CREATE TABLE UserEmail (
    UserEmail   VARCHAR(120) NOT NULL,
    UserID      INT          NOT NULL,
    PRIMARY KEY (UserEmail, UserID),
    CONSTRAINT fk_useremail_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Multi-valued attribute: User phone numbers
CREATE TABLE UserPhone (
    UserPhoneNum VARCHAR(20) NOT NULL,
    UserID       INT         NOT NULL,
    PRIMARY KEY (UserPhoneNum, UserID),
    CONSTRAINT fk_userphone_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- EMPLOYEE (strong entity)
-- Password column added per Stage 1 feedback.
-- ----------------------------------------------------------------------------
CREATE TABLE Employee (
    EmployeeID  INT AUTO_INCREMENT PRIMARY KEY,
    Lname       VARCHAR(60)  NOT NULL,
    Fname       VARCHAR(60)  NOT NULL,
    JobPosition VARCHAR(80)  NOT NULL,
    Password    VARCHAR(255) NOT NULL,
    CreatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Multi-valued attribute: Employee phone numbers
CREATE TABLE EmployeePhone (
    EmployeePhone VARCHAR(20) NOT NULL,
    EmployeeID    INT         NOT NULL,
    PRIMARY KEY (EmployeePhone, EmployeeID),
    CONSTRAINT fk_empphone_emp FOREIGN KEY (EmployeeID)
        REFERENCES Employee(EmployeeID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- PRODUCT CATEGORY (strong entity)
-- ----------------------------------------------------------------------------
CREATE TABLE ProductCategory (
    CategoryID   INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- PRODUCT (strong entity)
-- Each product is IN exactly one category (CategoryID FK, NOT NULL).
-- ----------------------------------------------------------------------------
CREATE TABLE Product (
    ProductID          INT AUTO_INCREMENT PRIMARY KEY,
    ProductName        VARCHAR(120)   NOT NULL,
    ProductDescription VARCHAR(1000)  NULL,
    ProductCost        DECIMAL(10, 2) NOT NULL,
    Quantity           INT            NOT NULL DEFAULT 0,
    CategoryID         INT            NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (CategoryID)
        REFERENCES ProductCategory(CategoryID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- ORDER (strong entity)
-- Each order is placed by exactly one User.
-- Using backticks because ORDER is a reserved word.
-- ----------------------------------------------------------------------------
CREATE TABLE `Order` (
    OrderID           INT AUTO_INCREMENT PRIMARY KEY,
    OrderDate         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    OrderTotal        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    OrderConfirmation VARCHAR(40)    NOT NULL UNIQUE,
    UserID            INT            NOT NULL,
    CONSTRAINT fk_order_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- CONTAINS (Order <-> Product, many-to-many)
-- Quantity added per Stage 1 feedback.
-- ----------------------------------------------------------------------------
CREATE TABLE OrderContains (
    OrderID    INT            NOT NULL,
    ProductID  INT            NOT NULL,
    Quantity   INT            NOT NULL DEFAULT 1,
    LineTotal  DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (OrderID, ProductID),
    CONSTRAINT fk_oc_order FOREIGN KEY (OrderID)
        REFERENCES `Order`(OrderID) ON DELETE CASCADE,
    CONSTRAINT fk_oc_product FOREIGN KEY (ProductID)
        REFERENCES Product(ProductID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- TRACKS (Employee <-> Product, many-to-many)
-- ----------------------------------------------------------------------------
CREATE TABLE EmployeeTracks (
    EmployeeID INT NOT NULL,
    ProductID  INT NOT NULL,
    PRIMARY KEY (EmployeeID, ProductID),
    CONSTRAINT fk_et_emp FOREIGN KEY (EmployeeID)
        REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    CONSTRAINT fk_et_product FOREIGN KEY (ProductID)
        REFERENCES Product(ProductID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO ProductCategory (CategoryName) VALUES
    ('Indoor Plants'),
    ('Outdoor Plants'),
    ('Seeds'),
    ('Tools'),
    ('Fertilizer & Soil');

INSERT INTO Product (ProductName, ProductDescription, ProductCost, Quantity, CategoryID) VALUES
    ('Monstera Deliciosa',  'Large tropical split-leaf houseplant.',        34.99, 25, 1),
    ('Snake Plant',         'Low-light, low-water hardy houseplant.',       18.50, 40, 1),
    ('Tomato Seeds (Pack)', 'Heirloom tomato seed pack, approx. 50 seeds.',  3.99, 200, 3),
    ('Hand Trowel',         'Stainless steel garden hand trowel.',          12.00, 60, 4),
    ('Organic Compost 20lb','Premium organic compost, 20 pound bag.',       14.75, 80, 5),
    ('Lavender Plant',      'Fragrant outdoor perennial.',                   9.99, 30, 2);

-- Passwords below are real BCrypt hashes generated with cost=10.
-- Cleartext for demo purposes:
--   jordan.smith@example.com  / password1
--   linh.nguyen@example.com   / password2
--   miguel.garcia@example.com / password3
--   Employee 1 (Priya Patel)    / admin1
--   Employee 2 (Marcus Johnson) / admin2
INSERT INTO `User` (Lname, Fname, Password) VALUES
    ('Smith',   'Jordan',  '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
    ('Nguyen',  'Linh',    '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q'),
    ('Garcia',  'Miguel',  '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y');

INSERT INTO UserEmail (UserEmail, UserID) VALUES
    ('jordan.smith@example.com', 1),
    ('linh.nguyen@example.com',  2),
    ('miguel.garcia@example.com',3);

INSERT INTO UserPhone (UserPhoneNum, UserID) VALUES
    ('205-555-0101', 1),
    ('205-555-0102', 2),
    ('205-555-0103', 3);

INSERT INTO Employee (Lname, Fname, JobPosition, Password) VALUES
    ('Patel',    'Priya',   'Inventory Manager', '$2b$10$MQIlBuuMLf9jkuUfNa.j7OTIQ.oEhlMSn3Wv1eQgK7cc9lscmmrpS'),
    ('Johnson',  'Marcus',  'Floor Associate',   '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm');

INSERT INTO EmployeePhone (EmployeePhone, EmployeeID) VALUES
    ('205-555-0201', 1),
    ('205-555-0202', 2);

INSERT INTO EmployeeTracks (EmployeeID, ProductID) VALUES
    (1, 1), (1, 2), (1, 5),
    (2, 3), (2, 4), (2, 6);

INSERT INTO `Order` (OrderTotal, OrderConfirmation, UserID) VALUES
    (53.49, 'GG-2026-0001', 1),
    ( 9.99, 'GG-2026-0002', 2);

INSERT INTO OrderContains (OrderID, ProductID, Quantity, LineTotal) VALUES
    (1, 1, 1, 34.99),
    (1, 4, 1, 12.00),
    (1, 3, 1,  3.99),
    (1, 5, 1,  2.51),
    (2, 6, 1,  9.99);
