-- greengrow database creation
-- MIS 330 group project spring 2026

drop database if exists greengrow;
create database greengrow character set utf8mb4 collate utf8mb4_unicode_ci;
use greengrow;

-- user table
create table `User` (
	UserID      int auto_increment primary key,
	Lname       varchar(60)  not null,
	Fname       varchar(60)  not null,
	Password    varchar(255) not null,
	CreatedAt   datetime     not null default current_timestamp
) engine=InnoDB;

-- user emails (multi-valued)
create table UserEmail (
	UserEmail   varchar(120) not null,
	UserID      int          not null,
	primary key (UserEmail, UserID),
	constraint fk_useremail_user foreign key (UserID)
		references `User`(UserID) on delete cascade
) engine=InnoDB;

-- user phones (multi-valued)
create table UserPhone (
	UserPhoneNum varchar(20) not null,
	UserID       int         not null,
	primary key (UserPhoneNum, UserID),
	constraint fk_userphone_user foreign key (UserID)
		references `User`(UserID) on delete cascade
) engine=InnoDB;

-- employee table (password added per stage 1 feedback)
create table Employee (
	EmployeeID  int auto_increment primary key,
	Lname       varchar(60)  not null,
	Fname       varchar(60)  not null,
	JobPosition varchar(80)  not null,
	Password    varchar(255) not null,
	CreatedAt   datetime     not null default current_timestamp
) engine=InnoDB;

-- employee phones (multi-valued)
create table EmployeePhone (
	EmployeePhone varchar(20) not null,
	EmployeeID    int         not null,
	primary key (EmployeePhone, EmployeeID),
	constraint fk_empphone_emp foreign key (EmployeeID)
		references Employee(EmployeeID) on delete cascade
) engine=InnoDB;

-- product category
create table ProductCategory (
	CategoryID   int auto_increment primary key,
	CategoryName varchar(80) not null unique
) engine=InnoDB;

-- product (each product belongs to one category)
create table Product (
	ProductID          int auto_increment primary key,
	ProductName        varchar(120)   not null,
	ProductDescription varchar(1000)  null,
	ProductCost        decimal(10, 2) not null,
	Quantity           int            not null default 0,
	CategoryID         int            not null,
	constraint fk_product_category foreign key (CategoryID)
		references ProductCategory(CategoryID)
) engine=InnoDB;

-- order table (each order placed by one user)
create table `Order` (
	OrderID           int auto_increment primary key,
	OrderDate         datetime       not null default current_timestamp,
	OrderTotal        decimal(10, 2) not null default 0.00,
	OrderConfirmation varchar(40)    not null unique,
	UserID            int            not null,
	constraint fk_order_user foreign key (UserID)
		references `User`(UserID)
) engine=InnoDB;

-- order contains (order <-> product, many to many)
-- quantity added per stage 1 feedback
create table OrderContains (
	OrderID   int            not null,
	ProductID int            not null,
	Quantity  int            not null default 1,
	LineTotal decimal(10, 2) not null default 0.00,
	primary key (OrderID, ProductID),
	constraint fk_oc_order foreign key (OrderID)
		references `Order`(OrderID) on delete cascade,
	constraint fk_oc_product foreign key (ProductID)
		references Product(ProductID)
) engine=InnoDB;

-- employee tracks (employee <-> product, many to many)
create table EmployeeTracks (
	EmployeeID int not null,
	ProductID  int not null,
	primary key (EmployeeID, ProductID),
	constraint fk_et_emp foreign key (EmployeeID)
		references Employee(EmployeeID) on delete cascade,
	constraint fk_et_product foreign key (ProductID)
		references Product(ProductID) on delete cascade
) engine=InnoDB;

show tables;
