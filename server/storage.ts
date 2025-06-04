import {
  users,
  categories,
  menuItems,
  orders,
  orderItems,
  companies,
  stores,
  menuSections,
  menuProducts,
  addonGroups,
  addons,
  cartItems,
  digitalOrders,
  whatsappInstances,
  customers,
  customerInteractions,
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
  type MenuSection,
  type InsertMenuSection,
  type MenuProduct,
  type InsertMenuProduct,
  type AddonGroup,
  type InsertAddonGroup,
  type Addon,
  type InsertAddon,
  type CartItem,
  type InsertCartItem,
  type DigitalOrder,
  type InsertDigitalOrder,
  type WhatsappInstance,
  type InsertWhatsappInstance,
  type Customer,
  type InsertCustomer,
  type CustomerInteraction,
  type InsertCustomerInteraction,
  type CustomerWithInteractions,
  type CustomerWithStats,
  type MenuProductWithSection,
  type AddonGroupWithAddons,
  type MenuSectionWithProducts,
  type StoreWithMenu,
  type DigitalOrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, count, ilike, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
  getStoreByManagerId(managerId: string): Promise<StoreWithCompany | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store>;
  deleteStore(id: number): Promise<void>;

  // Digital menu operations
  getStoreBySlug(slug: string): Promise<StoreWithMenu | undefined>;
  getMenuSections(storeId: number): Promise<MenuSection[]>;
  getMenuProducts(storeId: number, sectionId?: number): Promise<MenuProductWithSection[]>;
  createMenuSection(section: InsertMenuSection): Promise<MenuSection>;
  createMenuProduct(product: InsertMenuProduct): Promise<MenuProduct>;
  updateMenuSection(id: number, section: Partial<InsertMenuSection>): Promise<MenuSection>;
  updateMenuProduct(id: number, product: Partial<InsertMenuProduct>): Promise<MenuProduct>;
  deleteMenuSection(id: number): Promise<void>;
  deleteMenuProduct(id: number): Promise<void>;
  
  // Addon operations
  getAddonGroups(productId: number): Promise<AddonGroupWithAddons[]>;
  createAddonGroup(group: InsertAddonGroup): Promise<AddonGroup>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  updateAddonGroup(id: number, group: Partial<InsertAddonGroup>): Promise<AddonGroup>;
  updateAddon(id: number, addon: Partial<InsertAddon>): Promise<Addon>;
  deleteAddonGroup(id: number): Promise<void>;
  deleteAddon(id: number): Promise<void>;

  // Cart operations
  getCartItems(sessionId: string, storeId: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string, storeId: number): Promise<void>;

  // Digital order operations
  createDigitalOrder(order: InsertDigitalOrder): Promise<DigitalOrder>;
  getDigitalOrders(storeId: number, status?: string): Promise<DigitalOrderWithItems[]>;
  updateDigitalOrderStatus(id: number, status: string): Promise<DigitalOrder>;

  // WhatsApp Instance operations
  getWhatsappInstance(storeId: number): Promise<WhatsappInstance | undefined>;
  createWhatsappInstance(instance: InsertWhatsappInstance): Promise<WhatsappInstance>;
  updateWhatsappInstance(storeId: number, instance: Partial<InsertWhatsappInstance>): Promise<WhatsappInstance>;
  deleteWhatsappInstance(storeId: number): Promise<void>;

  // Customer operations
  getCustomers(storeId: number, search?: string): Promise<CustomerWithStats[]>;
  getCustomerById(id: number, storeId: number): Promise<CustomerWithInteractions | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>, storeId: number): Promise<Customer>;
  deleteCustomer(id: number, storeId: number): Promise<void>;
  getCustomerByPhone(phone: string, storeId: number): Promise<Customer | undefined>;

  // Customer interaction operations
  getCustomerInteractions(customerId: number, storeId: number): Promise<CustomerInteraction[]>;
  createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction>;
  getCustomerStats(storeId: number): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    totalInteractions: number;
  }>;
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

  // Get store managed by a specific user
  async getStoreByManagerId(managerId: string): Promise<any> {
    // Use raw SQL to ensure we get the correct data
    const result = await db.execute(sql`
      SELECT 
        s.id, s.name, s.company_id as "companyId", s.address, s.phone, s.email, 
        s.status, s.manager_id as "managerId", s.slug, s.description, 
        s.opening_hours as "openingHours", s.delivery_fee as "deliveryFee", 
        s.minimum_order as "minimumOrder", s.estimated_delivery_time as "estimatedDeliveryTime",
        s.created_at as "createdAt", s.updated_at as "updatedAt",
        s.logo_url as "logoUrl", s.banner_url as "bannerUrl",
        c.id as "company_id", c.name as "company_name", c.description as "company_description",
        c.email as "company_email", c.phone as "company_phone", c.address as "company_address",
        c.status as "company_status", c.owner_id as "company_ownerId", 
        c.created_at as "company_createdAt", c.updated_at as "company_updatedAt"
      FROM stores s
      LEFT JOIN companies c ON s.company_id = c.id
      WHERE s.manager_id = ${managerId}
      LIMIT 1
    `);

    if (result.rows.length === 0) return undefined;

    const row = result.rows[0] as any;
    
    return {
      id: row.id,
      name: row.name,
      companyId: row.companyId,
      address: row.address,
      phone: row.phone,
      email: row.email,
      status: row.status,
      managerId: row.managerId,
      slug: row.slug,
      description: row.description,
      openingHours: row.openingHours,
      deliveryFee: row.deliveryFee,
      minimumOrder: row.minimumOrder,
      estimatedDeliveryTime: row.estimatedDeliveryTime,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      logoUrl: row.logoUrl,
      bannerUrl: row.bannerUrl,
      company: {
        id: row.company_id,
        name: row.company_name,
        description: row.company_description,
        email: row.company_email,
        phone: row.company_phone,
        address: row.company_address,
        status: row.company_status,
        ownerId: row.company_ownerId,
        createdAt: row.company_createdAt,
        updatedAt: row.company_updatedAt,
      },
    };
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

  // Digital menu operations
  async getStoreBySlug(slug: string): Promise<StoreWithMenu | undefined> {
    const result = await db
      .select()
      .from(stores)
      .leftJoin(companies, eq(stores.companyId, companies.id))
      .where(eq(stores.slug, slug))
      .limit(1);

    if (!result.length) return undefined;

    const store = result[0].stores;
    const company = result[0].companies;

    const sections = await db
      .select()
      .from(menuSections)
      .where(eq(menuSections.storeId, store.id))
      .orderBy(menuSections.displayOrder);

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        const products = await db
          .select()
          .from(menuProducts)
          .where(eq(menuProducts.sectionId, section.id))
          .orderBy(menuProducts.displayOrder);

        return { ...section, products };
      })
    );

    return {
      ...store,
      company: company!,
      sections: sectionsWithProducts,
    };
  }

  async getMenuSections(storeId: number): Promise<MenuSection[]> {
    return await db
      .select()
      .from(menuSections)
      .where(eq(menuSections.storeId, storeId))
      .orderBy(menuSections.displayOrder);
  }

  async getMenuProducts(storeId: number, sectionId?: number): Promise<MenuProductWithSection[]> {
    let query = db
      .select()
      .from(menuProducts)
      .leftJoin(menuSections, eq(menuProducts.sectionId, menuSections.id))
      .where(eq(menuProducts.storeId, storeId));

    if (sectionId) {
      query = query.where(eq(menuProducts.sectionId, sectionId));
    }

    const results = await query.orderBy(menuProducts.displayOrder);

    return results.map(result => ({
      ...result.menu_products,
      section: result.menu_sections!,
    }));
  }

  async createMenuSection(section: InsertMenuSection): Promise<MenuSection> {
    const [created] = await db.insert(menuSections).values(section).returning();
    return created;
  }

  async createMenuProduct(product: InsertMenuProduct): Promise<MenuProduct> {
    const [created] = await db.insert(menuProducts).values(product).returning();
    return created;
  }

  async updateMenuSection(id: number, section: Partial<InsertMenuSection>): Promise<MenuSection> {
    const [updated] = await db
      .update(menuSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(menuSections.id, id))
      .returning();
    return updated;
  }

  async updateMenuProduct(id: number, product: Partial<InsertMenuProduct>): Promise<MenuProduct> {
    const [updated] = await db
      .update(menuProducts)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(menuProducts.id, id))
      .returning();
    return updated;
  }

  async deleteMenuSection(id: number): Promise<void> {
    await db.delete(menuSections).where(eq(menuSections.id, id));
  }

  async deleteMenuProduct(id: number): Promise<void> {
    await db.delete(menuProducts).where(eq(menuProducts.id, id));
  }

  // Addon operations
  async getAddonGroups(productId: number): Promise<AddonGroupWithAddons[]> {
    const groups = await db
      .select()
      .from(addonGroups)
      .where(eq(addonGroups.productId, productId))
      .orderBy(addonGroups.displayOrder);

    const groupsWithAddons = await Promise.all(
      groups.map(async (group) => {
        const allAddons = await db
          .select()
          .from(addons)
          .where(eq(addons.groupId, group.id))
          .orderBy(addons.displayOrder);

        return { ...group, addons: allAddons };
      })
    );

    return groupsWithAddons;
  }

  async createAddonGroup(group: InsertAddonGroup): Promise<AddonGroup> {
    const [created] = await db.insert(addonGroups).values(group).returning();
    return created;
  }

  async createAddon(addon: InsertAddon): Promise<Addon> {
    const [created] = await db.insert(addons).values(addon).returning();
    return created;
  }

  async updateAddonGroup(id: number, group: Partial<InsertAddonGroup>): Promise<AddonGroup> {
    const [updated] = await db
      .update(addonGroups)
      .set({ ...group, updatedAt: new Date() })
      .where(eq(addonGroups.id, id))
      .returning();
    return updated;
  }

  async updateAddon(id: number, addon: Partial<InsertAddon>): Promise<Addon> {
    const [updated] = await db
      .update(addons)
      .set({ ...addon, updatedAt: new Date() })
      .where(eq(addons.id, id))
      .returning();
    return updated;
  }

  async deleteAddonGroup(id: number): Promise<void> {
    await db.delete(addonGroups).where(eq(addonGroups.id, id));
  }

  async deleteAddon(id: number): Promise<void> {
    await db.delete(addons).where(eq(addons.id, id));
  }

  // Cart operations
  async getCartItems(sessionId: string, storeId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.storeId, storeId)
      ));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string, storeId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.storeId, storeId)
      ));
  }

  // Digital order operations
  async createDigitalOrder(order: InsertDigitalOrder): Promise<DigitalOrder> {
    const [created] = await db.insert(digitalOrders).values(order).returning();
    return created;
  }

  async getDigitalOrders(storeId: number, status?: string): Promise<DigitalOrderWithItems[]> {
    let query = db
      .select()
      .from(digitalOrders)
      .leftJoin(stores, eq(digitalOrders.storeId, stores.id))
      .where(eq(digitalOrders.storeId, storeId));

    if (status) {
      query = query.where(eq(digitalOrders.status, status));
    }

    const results = await query.orderBy(desc(digitalOrders.createdAt));

    return results.map(result => ({
      ...result.digital_orders,
      store: result.stores!,
      parsedItems: JSON.parse(result.digital_orders.items),
    }));
  }

  async updateDigitalOrderStatus(id: number, status: string): Promise<DigitalOrder> {
    const [updated] = await db
      .update(digitalOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(digitalOrders.id, id))
      .returning();
    return updated;
  }

  // WhatsApp Instance operations
  async getWhatsappInstance(storeId: number): Promise<WhatsappInstance | undefined> {
    const [instance] = await db
      .select()
      .from(whatsappInstances)
      .where(eq(whatsappInstances.storeId, storeId));
    return instance;
  }

  async createWhatsappInstance(instance: InsertWhatsappInstance): Promise<WhatsappInstance> {
    const [created] = await db
      .insert(whatsappInstances)
      .values(instance)
      .returning();
    return created;
  }

  async updateWhatsappInstance(storeId: number, instance: Partial<InsertWhatsappInstance>): Promise<WhatsappInstance> {
    const [updated] = await db
      .update(whatsappInstances)
      .set({ ...instance, updatedAt: new Date() })
      .where(eq(whatsappInstances.storeId, storeId))
      .returning();
    return updated;
  }

  async deleteWhatsappInstance(storeId: number): Promise<void> {
    await db
      .delete(whatsappInstances)
      .where(eq(whatsappInstances.storeId, storeId));
  }

  // Customer operations
  async getCustomers(storeId: number, search?: string): Promise<CustomerWithStats[]> {
    let query = db
      .select({
        id: customers.id,
        storeId: customers.storeId,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        notes: customers.notes,
        totalOrders: customers.totalOrders,
        totalSpent: customers.totalSpent,
        lastOrderAt: customers.lastOrderAt,
        isActive: customers.isActive,
        tags: customers.tags,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
      })
      .from(customers)
      .where(eq(customers.storeId, storeId));

    if (search) {
      query = query.where(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.phone, `%${search}%`),
          ilike(customers.email, `%${search}%`)
        )
      );
    }

    const result = await query.orderBy(desc(customers.createdAt));

    // Get recent interactions for each customer
    const customersWithStats = await Promise.all(
      result.map(async (customer) => {
        const recentInteractions = await db
          .select()
          .from(customerInteractions)
          .where(eq(customerInteractions.customerId, customer.id))
          .orderBy(desc(customerInteractions.createdAt))
          .limit(5);

        return {
          ...customer,
          recentInteractions,
          orderHistory: [], // TODO: implement order history
        };
      })
    );

    return customersWithStats;
  }

  async getCustomerById(id: number, storeId: number): Promise<CustomerWithInteractions | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.storeId, storeId)));

    if (!customer) return undefined;

    const interactions = await db
      .select()
      .from(customerInteractions)
      .where(eq(customerInteractions.customerId, id))
      .orderBy(desc(customerInteractions.createdAt));

    return {
      ...customer,
      interactions,
    };
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>, storeId: number): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.storeId, storeId)))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number, storeId: number): Promise<void> {
    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.storeId, storeId)));
  }

  async getCustomerByPhone(phone: string, storeId: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.phone, phone), eq(customers.storeId, storeId)));
    return customer;
  }

  // Customer interaction operations
  async getCustomerInteractions(customerId: number, storeId: number): Promise<CustomerInteraction[]> {
    return await db
      .select()
      .from(customerInteractions)
      .where(and(eq(customerInteractions.customerId, customerId), eq(customerInteractions.storeId, storeId)))
      .orderBy(desc(customerInteractions.createdAt));
  }

  async createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction> {
    const [newInteraction] = await db
      .insert(customerInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async getCustomerStats(storeId: number): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    totalInteractions: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalCustomers] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.storeId, storeId));

    const [newCustomersThisMonth] = await db
      .select({ count: count() })
      .from(customers)
      .where(and(
        eq(customers.storeId, storeId),
        gte(customers.createdAt, startOfMonth)
      ));

    const [activeCustomers] = await db
      .select({ count: count() })
      .from(customers)
      .where(and(
        eq(customers.storeId, storeId),
        eq(customers.isActive, true)
      ));

    const [totalInteractions] = await db
      .select({ count: count() })
      .from(customerInteractions)
      .where(eq(customerInteractions.storeId, storeId));

    return {
      totalCustomers: totalCustomers?.count || 0,
      newCustomersThisMonth: newCustomersThisMonth?.count || 0,
      activeCustomers: activeCustomers?.count || 0,
      totalInteractions: totalInteractions?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
