-- greengrow data loading
-- run after database_creation_queries.sql

use greengrow;

-- categories
insert into ProductCategory (CategoryName) values
	('Indoor Plants'),
	('Outdoor Plants'),
	('Seeds'),
	('Tools'),
	('Fertilizer & Soil');

-- products (at least 2 per category, a couple are low stock on purpose)
insert into Product (ProductName, ProductDescription, ProductCost, Quantity, CategoryID) values
	('Monstera Deliciosa',   'Large tropical split-leaf houseplant.',        34.99,  25, 1),
	('Snake Plant',          'Low-light, low-water hardy houseplant.',       18.50,  40, 1),
	('Tomato Seeds (Pack)',  'Heirloom tomato seed pack, approx. 50 seeds.',  3.99, 200, 3),
	('Hand Trowel',          'Stainless steel garden hand trowel.',          12.00,  60, 4),
	('Organic Compost 20lb', 'Premium organic compost, 20 pound bag.',       14.75,  80, 5),
	('Lavender Plant',       'Fragrant outdoor perennial.',                   9.99,  30, 2),
	('Pruning Shears',       'Bypass pruners for stems up to 3/4 inch.',     24.50,   7, 4),
	('Basil Seeds (Pack)',   'Genovese basil, approx. 75 seeds.',             2.99,   4, 3);

-- users (bcrypt hashes, cost=10)
--   jordan.smith@example.com  / password1
--   linh.nguyen@example.com   / password2
--   miguel.garcia@example.com / password3
--   alex.rivera@example.com   / password4
insert into `User` (Lname, Fname, Password) values
	('Smith',  'Jordan', '$2b$10$vwB6A0DyxIqyLaxRhJg57.glEvEtJqmaWtoANAz5JC5cxYddD4u7S'),
	('Nguyen', 'Linh',   '$2b$10$2ds7CJjGNSWdBX8vdwLfiuqcEyyNCE4eC8Qovv6BUuzVxLgaf733q'),
	('Garcia', 'Miguel', '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y'),
	('Rivera', 'Alex',   '$2b$10$dGIZLb54OOWp51y9MB5/H.z1DwHUXI/Hhd/RCBpceyfSrPh2FSf0y');

-- jordan has two emails to show the multi-valued attribute
insert into UserEmail (UserEmail, UserID) values
	('jordan.smith@example.com',     1),
	('jordan.s.backup@example.com',  1),
	('linh.nguyen@example.com',      2),
	('miguel.garcia@example.com',    3),
	('alex.rivera@example.com',      4);

insert into UserPhone (UserPhoneNum, UserID) values
	('205-555-0101', 1),
	('205-555-0102', 2),
	('205-555-0103', 3),
	('205-555-0104', 4);

-- employees (bcrypt hashes)
--   Priya Patel    / admin1
--   Marcus Johnson / admin2
--   Hana Kim       / admin3
insert into Employee (Lname, Fname, JobPosition, Password) values
	('Patel',   'Priya',  'Inventory Manager', '$2b$10$MQIlBuuMLf9jkuUfNa.j7OTIQ.oEhlMSn3Wv1eQgK7cc9lscmmrpS'),
	('Johnson', 'Marcus', 'Floor Associate',   '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm'),
	('Kim',     'Hana',   'Store Lead',        '$2b$10$Q0NpvJBGVO../xpM3uZhe.6O5WiDZeswQWFd7p7g3i3iIilPjgcCm');

insert into EmployeePhone (EmployeePhone, EmployeeID) values
	('205-555-0201', 1),
	('205-555-0202', 2),
	('205-555-0203', 3);

-- employee tracks (hana overlaps priya on two products for the many-to-many)
insert into EmployeeTracks (EmployeeID, ProductID) values
	(1, 1), (1, 2), (1, 5), (1, 7),
	(2, 3), (2, 4), (2, 6), (2, 8),
	(3, 1), (3, 7);

-- orders
insert into `Order` (OrderDate, OrderTotal, OrderConfirmation, UserID) values
	('2026-03-14 10:15:00', 73.48, 'GG-2026-0001', 1),
	('2026-03-21 14:02:00',  9.99, 'GG-2026-0002', 2),
	('2026-04-02 09:30:00', 52.49, 'GG-2026-0003', 3),
	('2026-04-10 17:45:00', 29.48, 'GG-2026-0004', 1),
	('2026-04-18 12:00:00', 64.47, 'GG-2026-0005', 4);

-- order line items (quantity column is the stage 1 feedback addition)
insert into OrderContains (OrderID, ProductID, Quantity, LineTotal) values
	(1, 1, 1, 34.99),
	(1, 4, 1, 12.00),
	(1, 3, 3, 11.97),
	(1, 5, 1, 14.52),
	(2, 6, 1,  9.99),
	(3, 2, 1, 18.50),
	(3, 7, 1, 24.50),
	(3, 8, 3,  9.49),
	(4, 8, 2,  5.98),
	(4, 5, 1, 14.75),
	(4, 3, 2,  8.75),
	(5, 1, 1, 34.99),
	(5, 6, 2, 19.98),
	(5, 7, 1,  9.50);

-- quick check
select 'ProductCategory' as tbl, count(*) as cnt from ProductCategory
	union all select 'Product',        count(*) from Product
	union all select 'User',           count(*) from `User`
	union all select 'UserEmail',      count(*) from UserEmail
	union all select 'UserPhone',      count(*) from UserPhone
	union all select 'Employee',       count(*) from Employee
	union all select 'EmployeePhone',  count(*) from EmployeePhone
	union all select 'EmployeeTracks', count(*) from EmployeeTracks
	union all select 'Order',          count(*) from `Order`
	union all select 'OrderContains',  count(*) from OrderContains;
