-- ============================================================================
-- GreenGrow :: database_creation_queries.sql
-- MIS 330 Group Project - Spring 2026
-- Target: MySQL 8.x
--
-- Purpose: Create the `greengrow` database and every table defined in the
-- Stage 1 ERD / relational schema. This file contains CREATE statements
-- ONLY. Data loading and analysis queries live in separate files so they
-- can be graded / re-run independently.
--
-- Stage 1 teacher feedback addressed:
--   * Employee has a Password column (BCrypt hash, VARCHAR(255)).
--   * OrderContains (the Contains relationship) has a Quantity column.
--
-- Entities:     User, Employee, ProductCategory, Product, Order
-- Multi-valued: UserEmail, UserPhone, EmployeePhone
-- Relationships: OrderContains (Order <-> Product), EmployeeTracks (Employee <-> Product)
-- ============================================================================

DROP DATABASE IF EXISTS greengrow;
CREATE DATABASE greengrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greengrow;

-- ----------------------------------------------------------------------------
-- USER  (strong entity — customers of the store)
-- ----------------------------------------------------------------------------
CREATE TABLE `User` (
    UserID    INT AUTO_INCREMENT PRIMARY KEY,
    Lname     VARCHAR(60)  NOT NULL,
    Fname     VARCHAR(60)  NOT NULL,
    Password  VARCHAR(255) NOT NULL,           -- BCrypt hash
    CreatedAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Multi-valued attribute: a user can have multiple email addresses.
CREATE TABLE UserEmail (
    UserEmail VARCHAR(120) NOT NULL,
    UserID    INT          NOT NULL,
    PRIMARY KEY (UserEmail, UserID),
    CONSTRAINT fk_useremail_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Multi-valued attribute: a user can have multiple phone numbers.
CREATE TABLE UserPhone (
    UserPhoneNum VARCHAR(20) NOT NULL,
    UserID       INT         NOT NULL,
    PRIMARY KEY (UserPhoneNum, UserID),
    CONSTRAINT fk_userphone_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- EMPLOYEE  (strong entity — staff who manage inventory)
-- Password added per Stage 1 feedback.
-- ----------------------------------------------------------------------------
CREATE TABLE Employee (
    EmployeeID  INT AUTO_INCREMENT PRIMARY KEY,
    Lname       VARCHAR(60)  NOT NULL,
    Fname       VARCHAR(60)  NOT NULL,
    JobPosition VARCHAR(80)  NOT NULL,
    Password    VARCHAR(255) NOT NULL,          -- BCrypt hash
    CreatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Multi-valued attribute: employee phone numbers.
CREATE TABLE EmployeePhone (
    EmployeePhone VARCHAR(20) NOT NULL,
    EmployeeID    INT         NOT NULL,
    PRIMARY KEY (EmployeePhone, EmployeeID),
    CONSTRAINT fk_empphone_emp FOREIGN KEY (EmployeeID)
        REFERENCES Employee(EmployeeID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- PRODUCT CATEGORY  (strong entity — classification for products)
-- ----------------------------------------------------------------------------
CREATE TABLE ProductCategory (
    CategoryID   INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- PRODUCT  (strong entity — items for sale)
-- Each Product is IN exactly one ProductCategory (total / many-to-one).
-- ----------------------------------------------------------------------------
CREATE TABLE Product (
    ProductID          INT AUTO_INCREMENT PRIMARY KEY,
    ProductName        VARCHAR(120)   NOT NULL,
    ProductDescription VARCHAR(1000)  NULL,
    ProductCost        DECIMAL(10, 2) NOT NULL,
    Quantity           INT            NOT NULL DEFAULT 0,  -- stock on hand
    CategoryID         INT            NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (CategoryID)
        REFERENCES ProductCategory(CategoryID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- ORDER  (strong entity — a purchase placed by one User)
-- Back-ticked because ORDER is a reserved word in SQL.
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
-- ORDER CONTAINS  (relationship: Order <-> Product, many-to-many)
-- Quantity added per Stage 1 feedback. LineTotal is a snapshot of what the
-- line cost at the time of checkout (price * qty, minus any rounding).
-- ----------------------------------------------------------------------------
CREATE TABLE OrderContains (
    OrderID   INT            NOT NULL,
    ProductID INT            NOT NULL,
    Quantity  INT            NOT NULL DEFAULT 1,
    LineTotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (OrderID, ProductID),
    CONSTRAINT fk_oc_order FOREIGN KEY (OrderID)
        REFERENCES `Order`(OrderID) ON DELETE CASCADE,
    CONSTRAINT fk_oc_product FOREIGN KEY (ProductID)
        REFERENCES Product(ProductID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- EMPLOYEE TRACKS  (relationship: Employee <-> Product, many-to-many)
-- Records which employee is responsible for re-stocking / monitoring each
-- product. One product can be tracked by multiple employees, and one
-- employee can track multiple products.
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

-- Confirm everything exists.
SHOW TABLES;
