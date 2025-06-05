import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  restaurantName: varchar("restaurant_name"),
  role: varchar("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  imageUrl: varchar("image_url"),
  available: boolean("available").default(true),
  availableOnDigitalMenu: boolean("available_on_digital_menu").default(true),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number"),
  status: varchar("status").notNull().default("received"), // received, preparing, ready, delivered
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  observations: text("observations"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  status: varchar("status").default("active"),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stores table
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  status: varchar("status").default("active"),
  managerId: varchar("manager_id").references(() => users.id),
  slug: varchar("slug").unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  bannerUrl: varchar("banner_url"),
  openingHours: text("opening_hours"),
  deliveryFee: varchar("delivery_fee").default("0"),
  minimumOrder: varchar("minimum_order").default("0"),
  estimatedDeliveryTime: varchar("estimated_delivery_time").default("30-45 min"),
  // Theme customization fields
  primaryColor: varchar("primary_color").default("#FF6B35"),
  secondaryColor: varchar("secondary_color").default("#F7931E"),
  darkMode: boolean("dark_mode").default(false),
  fontFamily: varchar("font_family").default("Inter"),
  showBanner: boolean("show_banner").default(true),
  showLogo: boolean("show_logo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu sections table
export const menuSections = pgTable("menu_sections", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu products table
export const menuProducts = pgTable("menu_products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull(),
  sectionId: integer("section_id").references(() => menuSections.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price").notNull(),
  originalPrice: varchar("original_price"),
  imageUrl: varchar("image_url"),
  isAvailable: boolean("is_available").default(true),
  isPromotion: boolean("is_promotion").default(false),
  displayOrder: integer("display_order").default(0),
  preparationTime: varchar("preparation_time").default("15-20 min"),
  calories: integer("calories"),
  allergens: text("allergens"),
  ingredients: text("ingredients"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Addon groups table
export const addonGroups = pgTable("addon_groups", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => menuProducts.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(false),
  minSelections: integer("min_selections").default(0),
  maxSelections: integer("max_selections").default(1),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Addons table
export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => addonGroups.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price").default("0"),
  isAvailable: boolean("is_available").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => menuProducts.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: varchar("unit_price").notNull(),
  selectedAddons: text("selected_addons"),
  specialInstructions: text("special_instructions"),
  subtotal: varchar("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital orders table
export const digitalOrders = pgTable("digital_orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull(),
  orderNumber: varchar("order_number").notNull().unique(),
  customerName: varchar("customer_name").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  customerEmail: varchar("customer_email"),
  deliveryAddress: text("delivery_address"),
  orderType: varchar("order_type").notNull(),
  status: varchar("status").notNull().default("pending"),
  items: text("items").notNull(),
  subtotal: varchar("subtotal").notNull(),
  deliveryFee: varchar("delivery_fee").default("0"),
  total: varchar("total").notNull(),
  paymentMethod: varchar("payment_method"),
  specialInstructions: text("special_instructions"),
  estimatedDeliveryTime: varchar("estimated_delivery_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Instances table - each store can have its own instance
export const whatsappInstances = pgTable("whatsapp_instances", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull().unique(),
  instanceKey: varchar("instance_key", { length: 100 }).notNull(),
  apiToken: varchar("api_token", { length: 100 }).notNull(),
  apiHost: varchar("api_host", { length: 255 }).notNull().default("apinocode01.megaapi.com.br"),
  status: varchar("status", { length: 20 }).notNull().default("disconnected"), // disconnected, connecting, connected
  qrCode: text("qr_code"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  isActive: boolean("is_active").default(true),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Agents table for WhatsApp integration
export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id, { onDelete: "cascade" }).notNull().unique(),
  whatsappInstanceId: integer("whatsapp_instance_id").references(() => whatsappInstances.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  personality: text("personality"),
  isActive: boolean("is_active").default(true),
  welcomeMessage: text("welcome_message"),
  menuPrompt: text("menu_prompt"),
  orderPrompt: text("order_prompt"),
  businessHours: jsonb("business_hours"),
  autoResponses: jsonb("auto_responses"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table - each store manages its own customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Customer interactions table - track all interactions with customers
export const customerInteractions = pgTable("customer_interactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  storeId: integer("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'whatsapp', 'order', 'call', 'email', 'note'
  message: text("message"),
  metadata: jsonb("metadata"), // additional data specific to interaction type
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuSectionSchema = createInsertSchema(menuSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuProductSchema = createInsertSchema(menuProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonGroupSchema = createInsertSchema(addonGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonSchema = createInsertSchema(addons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDigitalOrderSchema = createInsertSchema(digitalOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhatsappInstanceSchema = createInsertSchema(whatsappInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerInteractionSchema = createInsertSchema(customerInteractions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertMenuSection = z.infer<typeof insertMenuSectionSchema>;
export type MenuSection = typeof menuSections.$inferSelect;
export type InsertMenuProduct = z.infer<typeof insertMenuProductSchema>;
export type MenuProduct = typeof menuProducts.$inferSelect;
export type InsertAddonGroup = z.infer<typeof insertAddonGroupSchema>;
export type AddonGroup = typeof addonGroups.$inferSelect;
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertDigitalOrder = z.infer<typeof insertDigitalOrderSchema>;
export type DigitalOrder = typeof digitalOrders.$inferSelect;
export type InsertWhatsappInstance = z.infer<typeof insertWhatsappInstanceSchema>;
export type WhatsappInstance = typeof whatsappInstances.$inferSelect;
export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomerInteraction = z.infer<typeof insertCustomerInteractionSchema>;
export type CustomerInteraction = typeof customerInteractions.$inferSelect;

// Extended types for API responses
export type MenuItemWithCategory = MenuItem & {
  category: Category;
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    menuItem: MenuItem;
  })[];
};

export type StoreWithCompany = Store & {
  company: Company;
  manager?: User;
};

export type CompanyWithStores = Company & {
  stores: Store[];
  owner?: User;
};

// Digital menu types
export type MenuProductWithSection = MenuProduct & {
  section: MenuSection;
  addons?: AddonGroupWithAddons[];
};

export type AddonGroupWithAddons = AddonGroup & {
  addons: Addon[];
};

export type MenuSectionWithProducts = MenuSection & {
  products: MenuProduct[];
};

export type StoreWithMenu = Store & {
  company: Company;
  sections: MenuSectionWithProducts[];
};

export type DigitalOrderWithItems = DigitalOrder & {
  store: Store;
  parsedItems: {
    product: MenuProduct;
    quantity: number;
    unitPrice: string;
    selectedAddons: any[];
    specialInstructions?: string;
    subtotal: string;
  }[];
};

// Customer extended types
export type CustomerWithInteractions = Customer & {
  interactions: CustomerInteraction[];
};

export type CustomerWithStats = Customer & {
  recentInteractions: CustomerInteraction[];
  orderHistory: any[];
};
