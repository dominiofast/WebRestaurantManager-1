import {
  users,
  categories,
  menuItems,
  orders,
  orderItems,
  companies,
  stores,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemWithCategory,
  type Order,
  type InsertOrder,
  type OrderWithItems,
  type OrderItem,
  type InsertOrderItem,
  type Company,
  type InsertCompany,
  type Store,
  type InsertStore,
  type StoreWithCompany,
  type CompanyWithStores,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number, userId: string): Promise<void>;
  
  // Menu item operations
  getMenuItems(userId: string, categoryId?: number): Promise<MenuItemWithCategory[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number, userId: string): Promise<void>;
  
  // Order operations
  getOrders(userId: string, status?: string): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: number, status: string, userId: string): Promise<Order>;
  getOrderById(id: number, userId: string): Promise<OrderWithItems | undefined>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    todaySales: number;
    todayOrders: number;
    activeOrders: number;
    avgOrderValue: number;
  }>;

  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<CompanyWithStores | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  // Store operations
  getStores(): Promise<StoreWithCompany[]>;
  getStoresByCompany(companyId: number): Promise<Store[]>;
  getStoreById(id: number): Promise<StoreWithCompany | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store>;
  deleteStore(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: string): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Menu item operations
  async getMenuItems(userId: string, categoryId?: number): Promise<MenuItemWithCategory[]> {
    const query = db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        categoryId: menuItems.categoryId,
        imageUrl: menuItems.imageUrl,
        available: menuItems.available,
        userId: menuItems.userId,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          userId: categories.userId,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
      })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.userId, userId));

    if (categoryId) {
      query.where(and(eq(menuItems.userId, userId), eq(menuItems.categoryId, categoryId)));
    }

    return await query.orderBy(menuItems.name);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db
      .insert(menuItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number, userId: string): Promise<void> {
    await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, id), eq(menuItems.userId, userId)));
  }

  // Order operations
  async getOrders(userId: string, status?: string): Promise<OrderWithItems[]> {
    let query = db
      .select({
        id: orders.id,
        tableNumber: orders.tableNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        observations: orders.observations,
        userId: orders.userId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    if (status && status !== "all") {
      query = query.where(and(eq(orders.userId, userId), eq(orders.status, status)));
    }

    const ordersResult = await query.orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            subtotal: orderItems.subtotal,
            menuItem: {
              id: menuItems.id,
              name: menuItems.name,
              description: menuItems.description,
              price: menuItems.price,
              categoryId: menuItems.categoryId,
              imageUrl: menuItems.imageUrl,
              available: menuItems.available,
              userId: menuItems.userId,
              createdAt: menuItems.createdAt,
              updatedAt: menuItems.updatedAt,
            },
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [newOrder] = await db.insert(orders).values(order).returning();

    const orderItemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: newOrder.id,
    }));

    const createdItems = await db
      .insert(orderItems)
      .values(orderItemsWithOrderId)
      .returning();

    // Get menu items for response
    const itemsWithMenuItems = await Promise.all(
      createdItems.map(async (item) => {
        const [menuItem] = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.id, item.menuItemId));
        return {
          ...item,
          menuItem,
        };
      })
    );

    return {
      ...newOrder,
      items: itemsWithMenuItems,
    };
  }

  async updateOrderStatus(id: number, status: string, userId: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.userId, userId)))
      .returning();
    return updatedOrder;
  }

  async getOrderById(id: number, userId: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, userId)));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        subtotal: orderItems.subtotal,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          categoryId: menuItems.categoryId,
          imageUrl: menuItems.imageUrl,
          available: menuItems.available,
          userId: menuItems.userId,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
        },
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      items,
    };
  }

  async getDashboardStats(userId: string): Promise<{
    todaySales: number;
    todayOrders: number;
    activeOrders: number;
    avgOrderValue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales and orders
    const [todayStats] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
        avgOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          sql`${orders.createdAt} >= ${today}`,
          sql`${orders.createdAt} < ${tomorrow}`
        )
      );

    // Active orders (not delivered)
    const [activeOrdersResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          sql`${orders.status} != 'delivered'`
        )
      );

    return {
      todaySales: Number(todayStats.totalSales) || 0,
      todayOrders: Number(todayStats.totalOrders) || 0,
      activeOrders: Number(activeOrdersResult.count) || 0,
      avgOrderValue: Number(todayStats.avgOrderValue) || 0,
    };
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompanyById(id: number): Promise<CompanyWithStores | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const companyStores = await db.select().from(stores).where(eq(stores.companyId, id));
    const owner = company.ownerId ? await this.getUser(company.ownerId) : undefined;

    return {
      ...company,
      stores: companyStores,
      owner,
    };
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db.update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<void> {
    // First delete all stores of this company
    await db.delete(stores).where(eq(stores.companyId, id));
    // Then delete the company
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Store operations
  async getStores(): Promise<StoreWithCompany[]> {
    const result = await db
      .select({
        store: stores,
        company: companies,
      })
      .from(stores)
      .leftJoin(companies, eq(stores.companyId, companies.id))
      .orderBy(desc(stores.createdAt));

    return result.map(row => ({
      ...row.store,
      company: row.company!,
    }));
  }

  async getStoresByCompany(companyId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.companyId, companyId));
  }

  async getStoreById(id: number): Promise<StoreWithCompany | undefined> {
    const result = await db
      .select({
        store: stores,
        company: companies,
        manager: users,
      })
      .from(stores)
      .leftJoin(companies, eq(stores.companyId, companies.id))
      .leftJoin(users, eq(stores.managerId, users.id))
      .where(eq(stores.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.store,
      company: row.company!,
      manager: row.manager || undefined,
    };
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async updateStore(id: number, store: Partial<InsertStore>): Promise<Store> {
    const [updatedStore] = await db.update(stores)
      .set({ ...store, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return updatedStore;
  }

  async deleteStore(id: number): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }
}

export const storage = new DatabaseStorage();
