-- greengrow data analysis queries
-- run after database_creation_queries.sql and data_loading_queries.sql

use greengrow;

-- q1 full product list with category
select p.ProductID, p.ProductName, c.CategoryName, p.ProductCost, p.Quantity as stockonhand
from Product p join ProductCategory c on p.CategoryID=c.CategoryID
order by c.CategoryName, p.ProductName;

-- q2 top 5 best selling products by units sold
select p.ProductID, p.ProductName, sum(oc.Quantity) as totalunitssold,
	sum(oc.LineTotal) as revenue
from OrderContains oc join Product p on oc.ProductID=p.ProductID
group by p.ProductID, p.ProductName
order by totalunitssold desc
limit 5;

-- q3 revenue by product category
select c.CategoryName, count(distinct p.ProductID) as distinctproductssold,
	sum(oc.Quantity) as unitssold, sum(oc.LineTotal) as categoryrevenue
from ProductCategory c join Product p on p.CategoryID=c.CategoryID
	join OrderContains oc on oc.ProductID=p.ProductID
group by c.CategoryID, c.CategoryName
order by categoryrevenue desc;

-- q4 top customers by total spending (only those over $50)
select u.UserID, concat(u.Fname, ' ', u.Lname) as customername,
	min(ue.UserEmail) as email, count(o.OrderID) as ordercount,
	sum(o.OrderTotal) as totalspent
from `User` u join UserEmail ue on ue.UserID=u.UserID
	join `Order` o on o.UserID=u.UserID
group by u.UserID, u.Fname, u.Lname
having sum(o.OrderTotal) > 50
order by totalspent desc;

-- q5 store overview using subqueries
select
	(select count(*) from `Order`) as totalorders,
	(select sum(OrderTotal) from `Order`) as totalrevenue,
	(select avg(OrderTotal) from `Order`) as avgordervalue,
	(select count(*) from `User`) as totalcustomers,
	(select sum(Quantity) from Product) as totalunitsinstock;

-- q6 low stock products (less than 10 units)
select p.ProductID, p.ProductName, c.CategoryName, p.Quantity as unitsonhand
from Product p join ProductCategory c on c.CategoryID=p.CategoryID
where p.Quantity < 10
order by p.Quantity asc;

-- q7 products that have never been ordered (left join)
select p.ProductID, p.ProductName, p.Quantity as unitsonhand
from Product p left join OrderContains oc on oc.ProductID=p.ProductID
where oc.ProductID is null
order by p.ProductName;

-- q8 employee product tracking summary
select e.EmployeeID, concat(e.Fname, ' ', e.Lname) as empname,
	e.JobPosition, count(et.ProductID) as productstracked
from Employee e left join EmployeeTracks et on et.EmployeeID=e.EmployeeID
group by e.EmployeeID, e.Fname, e.Lname, e.JobPosition
order by productstracked desc;

-- q9 customers who have more than one email on file
select u.UserID, concat(u.Fname, ' ', u.Lname) as customername,
	count(ue.UserEmail) as emailcount
from `User` u join UserEmail ue on ue.UserID=u.UserID
group by u.UserID, u.Fname, u.Lname
having count(ue.UserEmail) > 1;

-- q10 monthly sales using date functions
select date_format(OrderDate, '%Y-%m') as ordermonth,
	count(*) as totalorders, sum(OrderTotal) as monthlyrevenue
from `Order`
group by date_format(OrderDate, '%Y-%m')
order by ordermonth;

-- q11 avg order value and avg items per order
select count(distinct o.OrderID) as totalorders,
	round(avg(o.OrderTotal), 2) as avgordervalue,
	round(sum(oc.Quantity) / count(distinct o.OrderID), 2) as avgitemsperorder
from `Order` o join OrderContains oc on o.OrderID=oc.OrderID;

-- q12 repeat vs one-time buyers using subqueries and union
with customer_orders as
(
	select u.UserID, count(o.OrderID) as ordercount
	from `User` u left join `Order` o on u.UserID=o.UserID
	group by u.UserID
)
select 'One-Time Buyer' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount = 1
	union
select 'Repeat Buyer' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount = 2
	union
select 'Loyal Customer (3+)' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount >= 3
order by numcustomers desc;
