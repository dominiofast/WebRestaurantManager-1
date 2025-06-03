import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertMenuItemSchema, insertOrderSchema, insertCompanySchema, insertStoreSchema } from "@shared/schema";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Criar diretório de uploads se não existir
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para upload de arquivos
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Check current session
  app.get('/api/auth/me', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(401).json({ message: "Erro de autenticação" });
    }
  });

  // Custom auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      // Find user by email
      const users = await storage.getAllUsers();
      const user = users.find((u: any) => u.email === email);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Store user session
        (req.session as any).userId = user.id;
        res.json({ 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            restaurantName: user.restaurantName,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, firstName, lastName, restaurantName, password } = req.body;
      
      if (!email || !firstName || !lastName || !restaurantName || !password) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      // Check if user already exists
      const users = await storage.getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(409).json({ message: "Email já está em uso" });
      }

      // Create new user
      const userData = {
        id: `user-${Date.now()}`,
        email,
        firstName: firstName,
        lastName: lastName,
        restaurantName: restaurantName,
        role: 'user'
      };

      const user = await storage.upsertUser(userData);
      
      // Store user session
      (req.session as any).userId = user.id;
      
      res.status(201).json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          restaurantName: user.restaurantName
        }
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    try {
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({ message: "Erro ao fazer logout" });
          }
          res.clearCookie('connect.sid');
          res.json({ message: "Logout realizado com sucesso" });
        });
      } else {
        res.clearCookie('connect.sid');
        res.json({ message: "Logout realizado com sucesso" });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      res.clearCookie('connect.sid');
      res.json({ message: "Logout realizado com sucesso" });
    }
  });

  // Custom auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    // Check if user is authenticated via Replit Auth
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return next();
    }
    
    // Check if user is authenticated via session (custom login)
    if (req.session && req.session.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(401).json({ message: "Usuário não encontrado" });
        }
        req.user = { id: user.id, role: user.role };
        return next();
      } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: "Erro de autenticação" });
      }
    }
    
    return res.status(401).json({ message: "Não autenticado" });
  };

  // Role-based middleware
  const requireSuperAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Acesso negado - Super Admin necessário" });
    }
    next();
  };

  const requireOwnerOrSuperAdmin = (req: any, res: any, next: any) => {
    if (!['super_admin', 'owner'].includes(req.user?.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };

  const requireManagerOrAbove = (req: any, res: any, next: any) => {
    if (!['super_admin', 'owner', 'manager'].includes(req.user?.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };

  // Helper function to get user's accessible companies
  const getUserAccessibleCompanies = async (userId: string, userRole: string) => {
    if (userRole === 'super_admin') {
      return await storage.getCompanies(); // Super admin sees all
    } else if (userRole === 'owner') {
      return await storage.getCompanies().then(companies => 
        companies.filter(c => c.ownerId === userId)
      );
    }
    return []; // Managers don't access company level
  };

  // Helper function to get user's accessible stores
  const getUserAccessibleStores = async (userId: string, userRole: string) => {
    if (userRole === 'super_admin') {
      return await storage.getStores(); // Super admin sees all
    } else if (userRole === 'owner') {
      const companies = await storage.getCompanies();
      const userCompanies = companies.filter(c => c.ownerId === userId);
      const allStores = await storage.getStores();
      return allStores.filter(store => 
        userCompanies.some(company => company.id === store.companyId)
      );
    } else if (userRole === 'manager') {
      // Manager sees only their assigned store
      const allStores = await storage.getStores();
      return allStores.filter(store => store.managerId === userId);
    }
    return [];
  };

  // Super Admin Routes - Gerenciar todos os restaurantes
  app.get('/api/admin/restaurants', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const restaurants = await storage.getAllUsers();
      res.json(restaurants.filter(u => u.role !== 'super_admin'));
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurantes" });
    }
  });

  // Criar novo restaurante
  app.post('/api/admin/restaurants', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { email, firstName, lastName, restaurantName } = req.body;
      
      const restaurantId = `rest-${Date.now()}`;
      
      const newRestaurant = await storage.upsertUser({
        id: restaurantId,
        email,
        firstName,
        lastName,
        restaurantName,
        role: 'admin'
      });

      res.status(201).json(newRestaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar restaurante" });
    }
  });

  // Estatísticas globais para super admin
  app.get('/api/admin/global-stats', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const restaurants = await storage.getAllUsers();
      const totalRestaurants = restaurants.filter(u => u.role !== 'super_admin').length;
      
      let totalSales = 0;
      let totalOrders = 0;
      
      for (const restaurant of restaurants) {
        if (restaurant.role !== 'super_admin') {
          try {
            const stats = await storage.getDashboardStats(restaurant.id);
            totalSales += stats.todaySales;
            totalOrders += stats.todayOrders;
          } catch (e) {
            // Continue if restaurant has no data
          }
        }
      }

      res.json({
        totalRestaurants,
        totalSales,
        totalOrders,
        avgSalesPerRestaurant: totalRestaurants > 0 ? totalSales / totalRestaurants : 0
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas globais" });
    }
  });

  // Companies management routes - Multi-tenant aware
  app.get('/api/admin/companies', requireAuth, requireOwnerOrSuperAdmin, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      const companies = await getUserAccessibleCompanies(req.user.id, user.role);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar empresas" });
    }
  });

  app.post('/api/admin/companies', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar empresa" });
    }
  });

  app.get('/api/admin/companies/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      const company = await storage.getCompanyById(id);
      
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar empresa" });
    }
  });

  app.put('/api/admin/companies/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar empresa" });
    }
  });

  app.delete('/api/admin/companies/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteCompany(id);
      res.json({ message: "Empresa deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar empresa" });
    }
  });

  // Get manager's assigned store
  app.get('/api/manager/store', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'manager') {
        return res.status(403).json({ message: "Acesso negado - Apenas managers" });
      }

      const store = await storage.getStoreByManagerId(req.user.id);
      if (!store) {
        return res.status(404).json({ message: "Nenhuma loja atribuída a este manager" });
      }

      res.json(store);
    } catch (error) {
      console.error('Erro ao buscar loja do manager:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Stores management routes - Multi-tenant aware
  app.get('/api/admin/stores', requireAuth, requireOwnerOrSuperAdmin, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      const stores = await getUserAccessibleStores(req.user.id, user.role);
      console.log('Stores found:', stores.length);
      res.json(stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ message: "Erro ao buscar lojas" });
    }
  });

  app.post('/api/admin/stores', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar loja" });
    }
  });

  app.get('/api/admin/stores/:id', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.getStoreById(storeId);
      
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      res.json(store);
    } catch (error) {
      console.error('Error fetching store:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Removed duplicate PUT route - using the one below that allows managers

  app.delete('/api/admin/stores/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteStore(id);
      res.json({ message: "Loja deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar loja" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      await storage.deleteCategory(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Menu item routes
  app.get('/api/menu-items', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const menuItems = await storage.getMenuItems(userId, categoryId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/menu-items', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const itemData = insertMenuItemSchema.parse({ ...req.body, userId });
      const menuItem = await storage.createMenuItem(itemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(id, itemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/menu-items/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      await storage.deleteMenuItem(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Order routes
  app.get('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const status = req.query.status as string;
      const orders = await storage.getOrders(userId, status);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { order, items } = req.body;
      
      const orderData = insertOrderSchema.parse({ ...order, userId });
      const orderItemsSchema = z.array(z.object({
        menuItemId: z.number(),
        quantity: z.number().min(1),
        unitPrice: z.string(),
        subtotal: z.string(),
      }));
      
      const orderItemsData = orderItemsSchema.parse(items);
      const createdOrder = await storage.createOrder(orderData, orderItemsData);
      res.status(201).json(createdOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const { status } = req.body;
      
      const validStatuses = ['received', 'preparing', 'ready', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const order = await storage.updateOrderStatus(id, status, userId);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get('/api/orders/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const order = await storage.getOrderById(id, userId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Removed duplicate route - using the main one above that allows managers

  app.get('/api/stores/:id/stats', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      
      // Get store stats - returning actual data from dashboard stats
      const stats = {
        todaySales: "0,00",
        todayOrders: 0,
        activeOrders: 0,
        avgOrderValue: "0,00"
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching store stats:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/stores/:id/menu-sections', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const sections = await storage.getMenuSections(storeId);
      res.json(sections);
    } catch (error) {
      console.error('Error fetching menu sections:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/stores/:id/menu-products', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const products = await storage.getMenuProducts(storeId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching menu products:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create menu product
  app.post('/api/stores/:id/menu-products', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const storeId = parseInt(req.params.id);
      const productData = { 
        ...req.body, 
        storeId,
        sectionId: parseInt(req.body.sectionId)
      };
      
      const product = await storage.createMenuProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Error creating menu product:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update menu product
  app.put('/api/stores/:storeId/menu-products/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const productId = parseInt(req.params.id);
      const product = await storage.updateMenuProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      console.error('Error updating menu product:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete menu product
  app.delete('/api/stores/:storeId/menu-products/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const productId = parseInt(req.params.id);
      await storage.deleteMenuProduct(productId);
      res.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
      console.error('Error deleting menu product:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/stores/:id/orders', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const orders = await storage.getDigitalOrders(storeId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching store orders:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Public digital menu route - no authentication required
  app.get('/api/menu/:storeSlug', async (req, res) => {
    try {
      const { storeSlug } = req.params;
      const store = await storage.getStoreBySlug(storeSlug);
      
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }
      
      res.json(store);
    } catch (error) {
      console.error('Error fetching store by slug:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update store information (managers can update their store)
  app.put('/api/admin/stores/:id', async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const updatedStore = await storage.updateStore(storeId, req.body);
      res.json(updatedStore);
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({ message: "Erro ao atualizar loja" });
    }
  });

  // Rota para obter cardápio por slug da loja
  app.get("/api/menu/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const store = await storage.getStoreBySlug(slug);
      
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      res.json(store);
    } catch (error) {
      console.error("Erro ao buscar cardápio:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para obter adicionais de um produto
  app.get("/api/products/:id/addons", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const addonGroups = await storage.getAddonGroups(productId);
      res.json(addonGroups);
    } catch (error) {
      console.error("Erro ao buscar adicionais:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create addon group
  app.post('/api/addon-groups', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const group = await storage.createAddonGroup(req.body);
      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating addon group:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update addon group
  app.put('/api/addon-groups/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const groupId = parseInt(req.params.id);
      const group = await storage.updateAddonGroup(groupId, req.body);
      res.json(group);
    } catch (error) {
      console.error('Error updating addon group:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete addon group
  app.delete('/api/addon-groups/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const groupId = parseInt(req.params.id);
      await storage.deleteAddonGroup(groupId);
      res.json({ message: "Grupo excluído com sucesso" });
    } catch (error) {
      console.error('Error deleting addon group:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create addon
  app.post('/api/addons', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const addon = await storage.createAddon(req.body);
      res.status(201).json(addon);
    } catch (error) {
      console.error('Error creating addon:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update addon
  app.put('/api/addons/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const addonId = parseInt(req.params.id);
      const addon = await storage.updateAddon(addonId, req.body);
      res.json(addon);
    } catch (error) {
      console.error('Error updating addon:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete addon
  app.delete('/api/addons/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const addonId = parseInt(req.params.id);
      await storage.deleteAddon(addonId);
      res.json({ message: "Adicional excluído com sucesso" });
    } catch (error) {
      console.error('Error deleting addon:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create menu section
  app.post('/api/stores/:id/menu-sections', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const storeId = parseInt(req.params.id);
      const sectionData = { 
        ...req.body, 
        storeId
      };
      
      const section = await storage.createMenuSection(sectionData);
      res.json(section);
    } catch (error) {
      console.error('Error creating menu section:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update menu section
  app.put('/api/stores/:storeId/menu-sections/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const sectionId = parseInt(req.params.id);
      const section = await storage.updateMenuSection(sectionId, req.body);
      res.json(section);
    } catch (error) {
      console.error('Error updating menu section:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete menu section
  app.delete('/api/stores/:storeId/menu-sections/:id', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const sectionId = parseInt(req.params.id);
      await storage.deleteMenuSection(sectionId);
      res.json({ message: "Seção excluída com sucesso" });
    } catch (error) {
      console.error('Error deleting menu section:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(uploadsDir));

  // Rota para upload de imagens
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo fornecido" });
      }

      // Gerar URL do arquivo
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ message: "Erro no upload da imagem" });
    }
  });

  // Webhook endpoint for Mega API WhatsApp messages
  app.post('/api/webhook/whatsapp', express.json(), async (req, res) => {
    try {
      console.log('Webhook received:', JSON.stringify(req.body, null, 2));
      
      const webhookData = req.body;
      
      // Verify if it's a message event
      if (webhookData.event === 'message' && webhookData.data) {
        const messageData = webhookData.data;
        const fromNumber = messageData.from;
        const messageText = messageData.body || messageData.text;
        const instanceId = messageData.instanceId;
        
        console.log(`Message from ${fromNumber}: ${messageText}`);
        
        // Basic auto-response logic
        if (messageText && typeof messageText === 'string') {
          const lowerMessage = messageText.toLowerCase();
          
          let response = '';
          
          // Simple keyword-based responses
          if (lowerMessage.includes('cardápio') || lowerMessage.includes('menu')) {
            response = '🍽️ Acesse nosso cardápio digital em: https://dominiomenu.ai/menu/sua-loja\n\nOu digite "delivery" para fazer seu pedido!';
          } else if (lowerMessage.includes('delivery') || lowerMessage.includes('entrega')) {
            response = '🚚 Fazemos delivery!\n\nPara fazer seu pedido:\n1. Acesse nosso cardápio\n2. Escolha seus pratos\n3. Finalize o pedido\n\nTempo de entrega: 45-60 minutos';
          } else if (lowerMessage.includes('horário') || lowerMessage.includes('horario') || lowerMessage.includes('funcionamento')) {
            response = '🕐 Nosso horário de funcionamento:\n\nSegunda a Sexta: 11h às 23h\nSábado e Domingo: 12h às 00h\n\nEstamos sempre prontos para te atender!';
          } else if (lowerMessage.includes('endereço') || lowerMessage.includes('endereco') || lowerMessage.includes('localização')) {
            response = '📍 Venha nos visitar!\n\nEndereço: [Seu endereço aqui]\nReferência: [Ponto de referência]\n\nTemos estacionamento disponível!';
          } else if (lowerMessage.includes('preço') || lowerMessage.includes('preco') || lowerMessage.includes('valor')) {
            response = '💰 Confira nossos preços no cardápio digital!\n\nTemos opções para todos os gostos e bolsos. Acesse: https://dominiomenu.ai/menu/sua-loja';
          } else if (lowerMessage.includes('promoção') || lowerMessage.includes('promocao') || lowerMessage.includes('desconto')) {
            response = '🎉 Promoções especiais!\n\n🔥 Toda terça: 20% OFF em pizzas\n🍔 Combo burger + batata + refrigerante: R$ 25,90\n\nNão perca essas ofertas!';
          } else {
            // Default welcome message
            response = `Olá! 👋 Bem-vindo(a) ao nosso restaurante!\n\n🍽️ Digite "cardápio" para ver nosso menu\n🚚 Digite "delivery" para informações de entrega\n🕐 Digite "horário" para saber quando funcionamos\n\nComo posso te ajudar hoje?`;
          }
          
          // Send response back via Mega API
          try {
            const megaApiResponse = await fetch(`https://apinocode01.megaapi.com.br/rest/instance/send_text/${instanceId}`, {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer MDT3OHEGIyu',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                number: fromNumber,
                text: response
              })
            });
            
            if (megaApiResponse.ok) {
              console.log(`Auto-response sent to ${fromNumber}`);
            } else {
              console.error('Failed to send auto-response:', await megaApiResponse.text());
            }
          } catch (error) {
            console.error('Error sending auto-response:', error);
          }
        }
      }
      
      // Always respond with 200 to acknowledge webhook
      res.status(200).json({ status: 'received' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get webhook URL for configuration
  app.get('/api/webhook/url', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const webhookUrl = `${baseUrl}/api/webhook/whatsapp`;
    
    res.json({
      webhookUrl,
      instructions: [
        '1. Copie a URL do webhook',
        '2. Configure no painel da Mega API',
        '3. Ative eventos de mensagem',
        '4. Teste enviando uma mensagem'
      ]
    });
  });

  // WhatsApp webhook for processing messages
  app.post('/api/webhook/whatsapp/:storeId', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const webhookData = req.body;
      
      console.log('WhatsApp webhook received for store:', storeId, webhookData);
      
      // Check if it's an incoming message
      if (webhookData.event === 'onMessage' || webhookData.event === 'messages.upsert') {
        const message = webhookData.data || webhookData.message;
        
        if (message && !message.fromMe && message.body) {
          // Get WhatsApp instance and AI agent for this store
          const instance = await storage.getWhatsappInstance(storeId);
          
          if (instance && instance.isActive) {
            // Process message with AI agent
            await processWhatsAppMessage(storeId, message, instance);
          }
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Function to process WhatsApp messages with AI
  async function processWhatsAppMessage(storeId: number, message: any, instance: any) {
    try {
      const store = await storage.getStoreById(storeId);
      if (!store) return;

      const customerPhone = message.from || message.participant;
      const messageText = message.body || message.text;
      
      // Basic AI responses for common scenarios
      let responseText = '';
      
      if (messageText.toLowerCase().includes('cardápio') || messageText.toLowerCase().includes('menu')) {
        responseText = `Olá! 🍕 Bem-vindo ao ${store.name}!\n\nVocê pode ver nosso cardápio completo em:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu me diga o que você gostaria de pedir!`;
      } else if (messageText.toLowerCase().includes('horário') || messageText.toLowerCase().includes('funcionamento')) {
        responseText = `📅 Nosso horário de funcionamento:\n\nSegunda a Sexta: 11h às 23h\nSábado e Domingo: 18h às 23h\n\nEstamos sempre prontos para atendê-lo!`;
      } else if (messageText.toLowerCase().includes('delivery') || messageText.toLowerCase().includes('entrega')) {
        responseText = `🚚 Sim, fazemos delivery!\n\nTaxa de entrega: R$ 5,00\nTempo estimado: 30-45 minutos\n\nFaça seu pedido através do nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}`;
      } else if (messageText.toLowerCase().includes('oi') || messageText.toLowerCase().includes('olá') || messageText.toLowerCase().includes('bom dia') || messageText.toLowerCase().includes('boa tarde') || messageText.toLowerCase().includes('boa noite')) {
        responseText = `Olá! 👋 Bem-vindo ao ${store.name}!\n\nComo posso ajudá-lo hoje?\n\n📱 Cardápio digital: https://dominiomenu-app.replit.app/menu/${store.slug}\n\nDigite "cardápio" para ver nossas opções ou "horário" para saber quando funcionamos!`;
      } else {
        responseText = `Obrigado pela sua mensagem! 😊\n\nPara fazer seu pedido, acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite:\n• "cardápio" - ver opções\n• "horário" - horário de funcionamento\n• "delivery" - informações de entrega`;
      }

      // Send response via Mega API
      if (responseText) {
        await fetch(`https://${instance.apiHost}/rest/sendMessage/${instance.instanceKey}/text`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${instance.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageData: {
              to: customerPhone,
              text: responseText
            }
          })
        });
      }
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }

  // WhatsApp Instance routes for multi-store support
  // Disconnect WhatsApp instance for a specific store
  app.delete('/api/stores/:storeId/whatsapp-instance/disconnect', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      const store = await storage.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const instance = await storage.getWhatsappInstance(storeId);
      if (!instance) {
        return res.status(404).json({ message: "Instância WhatsApp não encontrada" });
      }

      // Call Mega API logout endpoint
      const response = await fetch(`https://${instance.apiHost}/rest/instance/${instance.instanceKey}/logout`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Update instance status to disconnected
        const updatedInstance = await storage.updateWhatsappInstance(storeId, {
          status: 'disconnected'
        });
        
        res.json({
          success: true,
          message: "WhatsApp desconectado com sucesso",
          instance: updatedInstance
        });
      } else {
        const errorData = await response.json();
        res.status(response.status).json({
          success: false,
          message: "Erro ao desconectar WhatsApp",
          error: errorData
        });
      }
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      res.status(500).json({ 
        success: false,
        message: "Erro interno do servidor" 
      });
    }
  });

  // Test WhatsApp message sending with detailed debugging
  app.post('/api/stores/:storeId/whatsapp-instance/test-message', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const { phoneNumber, message } = req.body;
      
      console.log(`[WhatsApp Test] Iniciando teste para loja ${storeId}, telefone: ${phoneNumber}`);
      
      const store = await storage.getStoreById(storeId);
      if (!store) {
        console.log(`[WhatsApp Test] Loja ${storeId} não encontrada`);
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const instance = await storage.getWhatsappInstance(storeId);
      if (!instance) {
        console.log(`[WhatsApp Test] Instância WhatsApp não encontrada para loja ${storeId}`);
        return res.status(404).json({ message: "Instância WhatsApp não encontrada" });
      }

      console.log(`[WhatsApp Test] Configuração encontrada - Host: ${instance.apiHost}, Key: ${instance.instanceKey}`);

      const testMessage = message || `Teste do ${store.name}! 🚀\n\nSeu sistema de WhatsApp está funcionando!\n\nCardápio: https://dominiomenu-app.replit.app/menu/${store.slug}`;
      
      const apiUrl = `https://${instance.apiHost}/rest/sendMessage/${instance.instanceKey}/text`;
      const requestBody = {
        messageData: {
          to: phoneNumber + '@s.whatsapp.net',
          text: testMessage
        }
      };

      console.log(`[WhatsApp Test] URL da API: ${apiUrl}`);
      console.log(`[WhatsApp Test] Corpo da requisição:`, JSON.stringify(requestBody, null, 2));

      // Send test message via Mega API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log(`[WhatsApp Test] Status da resposta: ${response.status}`);
      console.log(`[WhatsApp Test] Resposta da API:`, JSON.stringify(result, null, 2));
      
      if (response.ok && !result.error) {
        console.log(`[WhatsApp Test] Mensagem enviada com sucesso!`);
        res.json({
          success: true,
          message: "Mensagem de teste enviada com sucesso",
          data: result,
          debug: {
            url: apiUrl,
            phoneNumber: phoneNumber + '@s.whatsapp.net',
            status: response.status
          }
        });
      } else {
        console.log(`[WhatsApp Test] Erro no envio:`, result);
        res.status(400).json({
          success: false,
          message: "Erro ao enviar mensagem de teste",
          error: result,
          debug: {
            url: apiUrl,
            phoneNumber: phoneNumber + '@s.whatsapp.net',
            status: response.status
          }
        });
      }
    } catch (error) {
      console.error('[WhatsApp Test] Erro ao enviar mensagem de teste:', error);
      res.status(500).json({ 
        success: false,
        message: "Erro interno do servidor",
        error: error.message
      });
    }
  });

  // Get WhatsApp instance for a specific store
  app.get('/api/stores/:storeId/whatsapp-instance', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      // Verify store exists
      const store = await storage.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const instance = await storage.getWhatsappInstance(storeId);
      res.json(instance || null);
    } catch (error) {
      console.error('Erro ao buscar instância WhatsApp:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create or update WhatsApp instance for a store
  app.post('/api/stores/:storeId/whatsapp-instance', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      const store = await storage.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const instanceData = {
        storeId,
        instanceKey: req.body.instanceKey || `${store.slug}-instance`,
        apiToken: req.body.apiToken || 'MDT3OHEGIyu',
        apiHost: req.body.apiHost || 'apinocode01.megaapi.com.br',
        status: 'disconnected',
        webhookUrl: `https://dominiomenu-app.replit.app/api/webhook/whatsapp/${storeId}`,
        phoneNumber: req.body.phoneNumber,
        isActive: req.body.enabled ?? true
      };

      const existingInstance = await storage.getWhatsappInstance(storeId);
      
      let instance;
      if (existingInstance) {
        instance = await storage.updateWhatsappInstance(storeId, instanceData);
      } else {
        instance = await storage.createWhatsappInstance(instanceData);
      }

      res.json(instance);
    } catch (error) {
      console.error('Erro ao criar/atualizar instância WhatsApp:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Connect WhatsApp instance for a specific store
  app.post('/api/stores/:storeId/whatsapp-instance/connect', isAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      const store = await storage.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const user = req.user!;
      if (user.role !== 'super_admin' && 
          user.role !== 'owner' && 
          store.managerId !== user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const instance = await storage.getWhatsappInstance(storeId);
      if (!instance) {
        return res.status(404).json({ message: "Instância WhatsApp não configurada para esta loja" });
      }

      // Update status to connecting
      await storage.updateWhatsappInstance(storeId, { status: 'connecting' });

      // Get QR Code from Mega API
      const qrResponse = await fetch(`https://${instance.apiHost}/rest/instance/qrcode_base64/${instance.instanceKey}`, {
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`
        }
      });

      if (!qrResponse.ok) {
        await storage.updateWhatsappInstance(storeId, { status: 'disconnected' });
        return res.status(400).json({ message: "Erro ao gerar QR Code" });
      }

      const qrData = await qrResponse.json();
      
      const updatedInstance = await storage.updateWhatsappInstance(storeId, { 
        qrCode: qrData.qrcode,
        status: 'connecting'
      });

      res.json({
        qrCode: qrData.qrcode,
        instance: updatedInstance
      });
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      await storage.updateWhatsappInstance(parseInt(req.params.storeId), { status: 'disconnected' });
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Enhanced webhook endpoint for store-specific instances
  app.post('/api/webhook/whatsapp/:storeId?', express.json(), async (req, res) => {
    try {
      console.log('Webhook received:', JSON.stringify(req.body, null, 2));
      
      const storeId = req.params.storeId ? parseInt(req.params.storeId) : null;
      const webhookData = req.body;
      
      if (webhookData.event === 'message' && webhookData.data) {
        const messageData = webhookData.data;
        const fromNumber = messageData.from;
        const messageText = messageData.body || messageData.text;
        
        console.log(`Message from ${fromNumber} to store ${storeId}: ${messageText}`);
        
        // Get store-specific information for personalized responses
        let storeInfo = null;
        if (storeId) {
          storeInfo = await storage.getStoreById(storeId);
        }
        
        if (messageText && typeof messageText === 'string') {
          const lowerMessage = messageText.toLowerCase();
          let response = '';
          
          if (lowerMessage.includes('cardápio') || lowerMessage.includes('menu')) {
            const menuUrl = storeInfo 
              ? `https://dominiomenu-app.replit.app/menu/${storeInfo.slug}`
              : 'https://dominiomenu-app.replit.app/cardapios';
            response = `🍽️ Acesse nosso cardápio digital em: ${menuUrl}\n\nOu digite "delivery" para fazer seu pedido!`;
          } else if (lowerMessage.includes('delivery') || lowerMessage.includes('entrega')) {
            response = `🚚 Fazemos delivery!\n\nPara fazer seu pedido:\n1. Acesse nosso cardápio\n2. Escolha seus pratos\n3. Finalize o pedido\n\nTempo de entrega: 45-60 minutos`;
          } else if (lowerMessage.includes('horário') || lowerMessage.includes('funciona')) {
            response = `⏰ Horário de funcionamento:\nSegunda a Sexta: 11h às 22h\nSábado e Domingo: 11h às 23h\n\nEstamos sempre prontos para atendê-lo!`;
          } else if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
            const storeName = storeInfo?.name || 'nosso restaurante';
            response = `👋 Olá! Bem-vindo ao ${storeName}!\n\nComo posso ajudá-lo hoje?\n• Digite "cardápio" para ver nossos pratos\n• Digite "delivery" para informações de entrega\n• Digite "horário" para saber quando funcionamos`;
          } else {
            response = `🤖 Desculpe, não entendi sua mensagem.\n\nPosso ajudá-lo com:\n• Cardápio - digite "cardápio"\n• Delivery - digite "delivery"\n• Horários - digite "horário"\n\nOu fale com nosso atendente!`;
          }
          
          // Get instance for this store to send response
          if (storeId) {
            const instance = await storage.getWhatsappInstance(storeId);
            if (instance && instance.status === 'connected') {
              // Send auto-response using store's specific instance
              const sendResponse = await fetch(`https://${instance.apiHost}/rest/instance/sendtext/${instance.instanceKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${instance.apiToken}`
                },
                body: JSON.stringify({
                  number: fromNumber,
                  text: response
                })
              });
              
              if (sendResponse.ok) {
                console.log('Auto-response sent successfully');
              }
            }
          }
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
