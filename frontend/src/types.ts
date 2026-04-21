// Type definitions that mirror the C# DTOs in backend/Dtos/Dtos.cs
export interface Category {
  categoryID: number;
  categoryName: string;
}

export interface Product {
  productID: number;
  productName: string;
  productDescription: string | null;
  productCost: number;
  quantity: number;
  categoryID: number;
  categoryName: string | null;
}

export interface OrderLine {
  productID: number;
  productName: string | null;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  orderID: number;
  orderDate: string;
  orderTotal: number;
  orderConfirmation: string;
  userID: number;
  lines: OrderLine[];
}

export interface User {
  userID: number;
  fname: string;
  lname: string;
  emails: string[];
  phones: string[];
}

export interface Employee {
  employeeID: number;
  fname: string;
  lname: string;
  jobPosition: string;
  phones: string[];
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalEmployees: number;
  totalOrders: number;
  totalRevenue: number;
  totalInventoryUnits: number;
  topProducts: { productID: number; productName: string; totalSold: number; revenue: number }[];
  lowStock: { productID: number; productName: string; quantity: number; categoryName: string }[];
  categoryBreakdown: { categoryName: string; productCount: number; totalStock: number }[];
  employeeTracking: { employeeID: number; name: string; jobPosition: string; productsTracked: number }[];
  recentOrders: {
    orderID: number;
    orderConfirmation: string;
    orderDate: string;
    total: number;
    customer: string;
    itemCount: number;
  }[];
}

export interface AuthedUser {
  kind: "user" | "employee";
  id: number;
  fname: string;
  lname: string;
  email?: string;
  jobPosition?: string;
}
