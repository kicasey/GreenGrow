-- ============================================================================
-- GreenGrow - Database Creation Queries
-- MIS 330 Group Project - Spring 2026
-- Team: Katelyn Casey, Jabari, Carter
-- Target: MySQL 8.x
--
-- Run this script to create the GreenGrow database and all tables.
-- Usage:  mysql -u root -p < database_creation_queries.sql
-- ============================================================================

DROP DATABASE IF EXISTS greengrow;
CREATE DATABASE greengrow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greengrow;

-- -------------------------------------------------------
-- USER (strong entity)
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- EMPLOYEE (strong entity)
-- Password column added per Stage 1 feedback.
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- PRODUCT CATEGORY (strong entity)
-- -------------------------------------------------------
CREATE TABLE ProductCategory (
    CategoryID   INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- PRODUCT (strong entity)
-- Each product belongs to exactly one category.
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- ORDER (strong entity)
-- Each order is placed by exactly one User.
-- -------------------------------------------------------
CREATE TABLE `Order` (
    OrderID           INT AUTO_INCREMENT PRIMARY KEY,
    OrderDate         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    OrderTotal        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    OrderConfirmation VARCHAR(40)    NOT NULL UNIQUE,
    UserID            INT            NOT NULL,
    CONSTRAINT fk_order_user FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- ORDER CONTAINS (Order <-> Product junction table)
-- Quantity attribute added per Stage 1 feedback.
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- EMPLOYEE TRACKS (Employee <-> Product junction table)
-- -------------------------------------------------------
CREATE TABLE EmployeeTracks (
    EmployeeID INT NOT NULL,
    ProductID  INT NOT NULL,
    PRIMARY KEY (EmployeeID, ProductID),
    CONSTRAINT fk_et_emp FOREIGN KEY (EmployeeID)
        REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    CONSTRAINT fk_et_product FOREIGN KEY (ProductID)
        REFERENCES Product(ProductID) ON DELETE CASCADE
) ENGINE=InnoDB;
