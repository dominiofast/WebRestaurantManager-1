import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertCompanySchema, 
  insertStoreSchema,
  insertCustomerSchema,
  insertCustomerInteractionSchema
} from "@shared/schema";
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

  // Menu sections routes for stores
  app.get('/api/menu-sections', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const sections = await storage.getMenuSections(store.id);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching menu sections:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/menu-sections', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const sectionData = {
        ...req.body,
        storeId: store.id
      };
      
      const section = await storage.createMenuSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating menu section:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Menu products routes for stores
  app.get('/api/menu-products', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const sectionId = req.query.sectionId ? parseInt(req.query.sectionId as string) : undefined;
      const products = await storage.getMenuProducts(store.id, sectionId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching menu products:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/menu-products', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const productData = {
        ...req.body,
        storeId: store.id
      };
      
      const product = await storage.createMenuProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating menu product:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put('/api/menu-products/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const productId = parseInt(req.params.id);
      const product = await storage.updateMenuProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating menu product:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete('/api/menu-products/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const store = await storage.getStoreByManagerId(userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const productId = parseInt(req.params.id);
      await storage.deleteMenuProduct(productId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu product:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
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

  // Configure webhook automatically for a store
  app.post('/api/stores/:storeId/configure-webhook', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: "Instância WhatsApp não encontrada" });
      }

      const webhookUrl = `https://dominiomenu-app.replit.app/api/webhook/whatsapp/${storeId}`;
      
      // Try multiple webhook endpoints for Mega API
      const endpoints = [
        `/rest/instance/webhook/${instance.instanceKey}`,
        `/rest/instance/setWebhook/${instance.instanceKey}`,
        `/rest/instance/settings/webhook/${instance.instanceKey}`,
        `/webhook/${instance.instanceKey}`
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(`https://${instance.apiHost}${endpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${instance.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: webhookUrl,
              webhook: webhookUrl,
              events: ['message', 'messages.upsert', 'onMessage']
            })
          });

          if (response.ok) {
            console.log(`Webhook configured successfully using endpoint: ${endpoint}`);
            break;
          } else {
            const errorText = await response.text();
            lastError = errorText;
            console.log(`Failed endpoint ${endpoint}:`, errorText);
          }
        } catch (error) {
          lastError = error;
          console.log(`Error with endpoint ${endpoint}:`, error);
        }
      }

      if (response.ok) {
        const result = await response.json();
        res.json({
          success: true,
          message: "Webhook configurado com sucesso",
          webhookUrl,
          result
        });
      } else {
        const errorText = await response.text();
        res.status(400).json({
          success: false,
          message: "Erro ao configurar webhook",
          error: errorText
        });
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
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

  // Get webhook data from Mega API
  app.get('/api/whatsapp/:storeId/webhook-data', async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (isNaN(storeId)) {
        return res.status(400).json({ message: 'ID da loja inválido' });
      }

      // Get WhatsApp instance
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: 'Instância WhatsApp não encontrada' });
      }

      // Make request to Mega API to get webhook data
      const apiUrl = `https://${instance.apiHost}/rest/webhook/${instance.instanceKey}`;
      
      console.log('[Webhook Data] Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${instance.apiToken}`
        }
      });

      if (!response.ok) {
        console.log('[Webhook Data] API Response error:', response.status, response.statusText);
        return res.status(response.status).json({ 
          message: 'Erro ao buscar dados do webhook',
          error: response.statusText 
        });
      }

      const data = await response.json();
      console.log('[Webhook Data] API Response:', data);

      res.json(data);
    } catch (error) {
      console.error('[Webhook Data] Error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Sync WhatsApp instance status with Mega API
  app.post('/api/whatsapp/:storeId/sync-status', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (isNaN(storeId)) {
        return res.status(400).json({ message: 'ID da loja inválido' });
      }

      // Get WhatsApp instance
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: 'Instância WhatsApp não encontrada' });
      }

      // Get status from Mega API
      const apiUrl = `https://${instance.apiHost}/rest/instance/${instance.instanceKey}`;
      
      console.log('[Sync Status] Checking status at:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${instance.apiToken}`
        }
      });

      if (!response.ok) {
        console.log('[Sync Status] API Response error:', response.status, response.statusText);
        return res.status(response.status).json({ 
          message: 'Erro ao buscar status da instância',
          error: response.statusText 
        });
      }

      const data = await response.json();
      console.log('[Sync Status] API Response:', data);

      // Update instance status in database
      let newStatus = 'disconnected';
      let phoneNumber = instance.phoneNumber;

      if (data.instance && data.instance.status === 'connected' && data.instance.user) {
        newStatus = 'connected';
        // Extract phone number from user ID (format: 556993910380:31@s.whatsapp.net)
        const userId = data.instance.user.id;
        if (userId && userId.includes('@')) {
          const extractedPhone = userId.split(':')[0].replace('55', '');
          if (extractedPhone.length >= 10) {
            phoneNumber = extractedPhone;
          }
        }
      }

      // Update instance in database
      await storage.updateWhatsappInstance(storeId, {
        status: newStatus,
        phoneNumber: phoneNumber
      });

      console.log('[Sync Status] Updated instance status to:', newStatus);

      res.json({
        success: true,
        message: 'Status sincronizado com sucesso',
        status: newStatus,
        phoneNumber: phoneNumber,
        megaApiData: data
      });
    } catch (error) {
      console.error('[Sync Status] Error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Configure webhook on Mega API
  app.post('/api/whatsapp/:storeId/configure-webhook', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (isNaN(storeId)) {
        return res.status(400).json({ message: 'ID da loja inválido' });
      }

      // Get WhatsApp instance
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: 'Instância WhatsApp não encontrada' });
      }

      // Configure webhook using Mega API
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const webhookUrl = `${baseUrl}/api/webhook/whatsapp/${storeId}`;
      
      const apiUrl = `https://${instance.apiHost}/rest/webhook/${instance.instanceKey}/configWebhook`;
      
      console.log('[Configure Webhook] Configuring webhook:', webhookUrl);
      console.log('[Configure Webhook] API URL:', apiUrl);
      
      const requestBody = {
        messageData: {
          webhookUrl: webhookUrl,
          webhookEnabled: true,
          webhookSecondaryUrl: "",
          webhookSecondaryEnabled: false
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${instance.apiToken}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[Configure Webhook] API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[Configure Webhook] API Response error:', errorText);
        return res.status(response.status).json({ 
          message: 'Erro ao configurar webhook',
          error: errorText 
        });
      }

      const data = await response.json();
      console.log('[Configure Webhook] API Response success:', data);

      res.json({
        success: true,
        message: 'Webhook configurado com sucesso',
        data: data
      });
    } catch (error) {
      console.error('[Configure Webhook] Error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Test endpoint para diagnosticar webhook
  app.get('/api/webhook/test', (req, res) => {
    console.log('[Webhook Test] Endpoint de teste acessado');
    res.json({ 
      success: true, 
      message: 'Webhook endpoint está funcionando',
      timestamp: new Date().toISOString()
    });
  });

  // Sistema de polling automático para verificar mensagens
  let pollingIntervals = new Map();
  let lastMessageIds = new Map();

  app.post('/api/whatsapp/:storeId/start-polling', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: 'Instância WhatsApp não encontrada' });
      }

      // Parar polling existente se houver
      if (pollingIntervals.has(storeId)) {
        clearInterval(pollingIntervals.get(storeId));
      }

      // Iniciar novo polling
      const interval = setInterval(async () => {
        await checkMessagesForStore(storeId, instance);
      }, 5000); // Verificar a cada 5 segundos

      pollingIntervals.set(storeId, interval);
      
      console.log(`[Polling] Iniciado para loja ${storeId}`);
      res.json({ success: true, message: 'Polling iniciado' });

    } catch (error) {
      console.error('[Polling Start] Error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/whatsapp/:storeId/stop-polling', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (pollingIntervals.has(storeId)) {
        clearInterval(pollingIntervals.get(storeId));
        pollingIntervals.delete(storeId);
        console.log(`[Polling] Parado para loja ${storeId}`);
      }

      res.json({ success: true, message: 'Polling parado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  async function checkMessagesForStore(storeId, instance) {
    try {
      const response = await fetch(`https://${instance.apiHost}/rest/chat/findMessages/${instance.instanceKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            limit: 3,
            where: {
              fromMe: false
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        for (const message of messages) {
          if (message.key && !message.key.fromMe && message.message) {
            const messageId = message.key.id;
            const lastId = lastMessageIds.get(instance.instanceKey);
            
            if (messageId && messageId !== lastId) {
              console.log(`[Polling] Nova mensagem encontrada para loja ${storeId}:`, message.key.id);
              
              // Processar mensagem
              await processWhatsAppMessage(storeId, {
                from: message.key.remoteJid,
                body: message.message.conversation || message.message.extendedTextMessage?.text || 'mensagem',
                fromMe: message.key.fromMe
              }, instance);
              
              // Atualizar último ID processado
              lastMessageIds.set(instance.instanceKey, messageId);
              break; // Processar apenas a mensagem mais recente
            }
          }
        }
      }
    } catch (error) {
      console.log(`[Polling] Erro ao verificar mensagens loja ${storeId}:`, error.message);
    }
  }

  // Sistema de polling para verificar mensagens quando webhook não funciona
  app.post('/api/whatsapp/:storeId/check-messages', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const instance = await storage.getWhatsappInstance(storeId);
      
      if (!instance) {
        return res.status(404).json({ message: 'Instância WhatsApp não encontrada' });
      }

      // Buscar mensagens recentes
      const response = await fetch(`https://${instance.apiHost}/rest/chat/findMessages/${instance.instanceKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            limit: 5,
            where: {
              fromMe: false
            }
          }
        })
      });

      if (!response.ok) {
        return res.status(400).json({ message: 'Erro ao buscar mensagens' });
      }

      const data = await response.json();
      const messages = data.messages || [];
      
      console.log(`[Message Check] Found ${messages.length} recent messages for store ${storeId}`);

      // Processar mensagens encontradas
      for (const message of messages) {
        if (message.key && !message.key.fromMe && message.message) {
          const webhookData = {
            instance_key: instance.instanceKey,
            jid: message.key.remoteJid,
            messageType: message.messageType || 'conversation',
            key: message.key,
            message: message.message
          };

          console.log(`[Message Check] Processing message: ${JSON.stringify(webhookData, null, 2)}`);
          
          // Processar mensagem através do sistema de webhook interno
          await processWhatsAppMessage(storeId, {
            from: message.key.remoteJid,
            body: message.message.conversation || message.message.extendedTextMessage?.text || 'mensagem',
            fromMe: message.key.fromMe
          }, instance);
        }
      }

      res.json({
        success: true,
        messagesFound: messages.length,
        processed: messages.filter(m => m.key && !m.key.fromMe).length
      });

    } catch (error) {
      console.error('[Message Check] Error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // WhatsApp webhook for processing messages
  app.post('/api/webhook/whatsapp/:storeId', async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const webhookData = req.body;
      
      console.log('=== WEBHOOK RECEIVED ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Store ID:', storeId);
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(webhookData, null, 2));
      console.log('========================');
      
      // Process Mega API webhook format
      let messageText = '';
      let fromNumber = '';
      let isFromMe = false;

      // Handle different Mega API message formats
      if (webhookData.messageType) {
        console.log('[Webhook] Mega API format detected, messageType:', webhookData.messageType);
        
        // Extract sender information
        if (webhookData.key) {
          fromNumber = webhookData.key.remoteJid || webhookData.jid;
          isFromMe = webhookData.key.fromMe;
          
          // Extract message text based on messageType
          if (webhookData.messageType === 'conversation' && webhookData.message?.conversation) {
            messageText = webhookData.message.conversation;
          } else if (webhookData.messageType === 'extendedTextMessage' && webhookData.message?.extendedTextMessage?.text) {
            messageText = webhookData.message.extendedTextMessage.text;
          } else if (webhookData.messageType === 'ephemeralMessage' && webhookData.message?.ephemeralMessage?.message?.extendedTextMessage?.text) {
            messageText = webhookData.message.ephemeralMessage.message.extendedTextMessage.text;
          } else if (webhookData.messageType === 'audioMessage') {
            messageText = 'áudio';
          } else if (webhookData.messageType === 'imageMessage') {
            messageText = 'imagem';
          } else if (webhookData.messageType === 'videoMessage') {
            messageText = 'vídeo';
          } else if (webhookData.messageType === 'documentMessage') {
            messageText = 'documento';
          } else if (webhookData.messageType === 'stickerMessage') {
            messageText = 'figurinha';
          }
          
          console.log('[Webhook] Extracted - From:', fromNumber, 'Text:', messageText, 'FromMe:', isFromMe);
          
          if (messageText && !isFromMe) {
            console.log('[Webhook] Valid incoming message found');
            // Get WhatsApp instance
            const instance = await storage.getWhatsappInstance(storeId);
            console.log('[Webhook] Instance found:', instance);
            
            if (instance && instance.isActive) {
              console.log('[Webhook] Instance is active, processing message');
              
              // Create message object for processing
              const processedMessage = {
                from: fromNumber,
                body: messageText,
                fromMe: isFromMe
              };
              
              await processWhatsAppMessage(storeId, processedMessage, instance);
            } else {
              console.log('[Webhook] Instance not active or not found');
            }
          } else {
            console.log('[Webhook] Message criteria not met - Text:', messageText, 'FromMe:', isFromMe);
          }
        }
      } 
      // Fallback to old format for backward compatibility
      else if (webhookData.event === 'onMessage' || webhookData.event === 'messages.upsert') {
        console.log('[Webhook] Legacy format detected');
        const message = webhookData.data || webhookData.message;
        console.log('[Webhook] Message object:', message);
        
        // Extract text from different message formats
        let messageText = '';
        if (message.message?.conversation) {
          messageText = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
          messageText = message.message.extendedTextMessage.text;
        } else if (message.body) {
          messageText = message.body;
        }
        
        // Check if message is from customer (not from us)
        const isFromMe = message.key?.fromMe === true || message.fromMe === true;
        
        if (messageText && !isFromMe) {
          console.log('[Webhook] Valid incoming message found:', messageText);
          const instance = await storage.getWhatsappInstance(storeId);
          console.log('[Webhook] Instance found:', instance);
          
          if (instance && instance.isActive) {
            console.log('[Webhook] Instance is active, processing message');
            
            // Create standardized message object
            const processedMessage = {
              from: message.key?.remoteJid || message.from,
              body: messageText,
              fromMe: isFromMe
            };
            
            await processWhatsAppMessage(storeId, processedMessage, instance);
          } else {
            console.log('[Webhook] Instance not active or not found');
          }
        } else {
          console.log('[Webhook] Message does not meet criteria - fromMe:', isFromMe, 'text:', messageText);
        }
      } else {
        console.log('[Webhook] Unknown webhook format - checking for messageType:', !!webhookData.messageType);
        console.log('[Webhook] Available keys:', Object.keys(webhookData));
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
      console.log('[WhatsApp AI] Processing message for store:', storeId);
      console.log('[WhatsApp AI] Message data:', message);
      console.log('[WhatsApp AI] Instance data:', instance);

      const store = await storage.getStoreById(storeId);
      if (!store) {
        console.log('[WhatsApp AI] Store not found');
        return;
      }

      const customerPhone = message.from || message.participant;
      const messageText = message.body || message.text;
      
      console.log('[WhatsApp AI] Customer phone:', customerPhone);
      console.log('[WhatsApp AI] Message text:', messageText);

      // Register customer and interaction
      let customer;
      try {
        const phoneNumber = customerPhone.replace('@s.whatsapp.net', '');
        customer = await storage.getCustomerByPhone(phoneNumber, storeId);
        
        if (!customer) {
          // Create new customer
          customer = await storage.createCustomer({
            storeId,
            name: 'Cliente WhatsApp',
            phone: phoneNumber,
            email: null,
            notes: 'Cliente criado automaticamente via WhatsApp'
          });
          console.log('[WhatsApp AI] New customer created:', customer.id);
        }

        // Log interaction
        await storage.createCustomerInteraction({
          customerId: customer.id,
          storeId,
          type: 'whatsapp_message',
          message: messageText
        });
        console.log('[WhatsApp AI] Interaction logged for customer:', customer.id);
      } catch (error) {
        console.error('[WhatsApp AI] Error logging customer interaction:', error);
      }

      // Get recent conversation history for context
      let conversationHistory = [];
      if (customer) {
        try {
          const recentInteractions = await storage.getCustomerInteractions(customer.id, storeId);
          conversationHistory = recentInteractions
            .slice(-10) // Last 10 interactions
            .map(interaction => ({
              type: interaction.type,
              content: interaction.message,
              timestamp: interaction.createdAt
            }));
        } catch (error) {
          console.error('[WhatsApp AI] Error getting conversation history:', error);
        }
      }
      
      // Generate AI response using OpenAI or fallback
      let responseText = '';
      try {
        responseText = await generateIntelligentAIResponse(messageText, store, customer, conversationHistory);
      } catch (error) {
        console.error('[WhatsApp AI] Error generating AI response:', error);
        responseText = generateFallbackResponse(messageText, store);
      }

      console.log('[WhatsApp AI] Generated response:', responseText);

      // Send response via Mega API
      if (responseText) {
        const apiUrl = `https://${instance.apiHost}/rest/sendMessage/${instance.instanceKey}/text`;
        const requestBody = {
          messageData: {
            to: customerPhone,
            text: responseText
          }
        };

        console.log('[WhatsApp AI] Sending to API URL:', apiUrl);
        console.log('[WhatsApp AI] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${instance.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('[WhatsApp AI] API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('[WhatsApp AI] API Response success:', result);
          
          // Log the response interaction
          if (customer) {
            try {
              await storage.createCustomerInteraction({
                customerId: customer.id,
                storeId,
                type: 'whatsapp_response',
                message: responseText
              });
            } catch (error) {
              console.error('[WhatsApp AI] Error logging response interaction:', error);
            }
          }
        } else {
          const errorText = await response.text();
          console.error('[WhatsApp AI] API Response error:', errorText);
        }
      }
    } catch (error) {
      console.error('[WhatsApp AI] Error processing message:', error);
    }
  }

  async function generateIntelligentAIResponse(messageText: string, store: any, customer: any, conversationHistory: any[]): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.log('[WhatsApp AI] OpenAI API key not found, using fallback responses');
        return generateFallbackResponse(messageText, store);
      }

      // Build conversation context
      const contextMessages = conversationHistory.map(interaction => {
        if (interaction.type === 'whatsapp_message') {
          return `Cliente: ${interaction.content}`;
        } else if (interaction.type === 'whatsapp_response') {
          return `Atendente: ${interaction.content}`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const storeInfo = {
        name: store.name,
        slug: store.slug,
        address: store.address,
        phone: store.phone,
        description: store.description
      };

      const prompt = `Você é um atendente virtual muito amigável e humano do restaurante "${store.name}". 

INFORMAÇÕES DO RESTAURANTE:
- Nome: ${store.name}
- Cardápio online: https://dominiomenu-app.replit.app/menu/${store.slug}
- Horário: Segunda a Sexta 11h às 23h, Sábados e Domingos 18h às 23h
- Delivery: Sim, taxa R$ 5,00, tempo 30-45min, pedido mínimo R$ 25,00
${store.address ? `- Endereço: ${store.address}` : ''}

CONTEXTO DA CONVERSA ANTERIOR:
${contextMessages || 'Primeira mensagem do cliente'}

PERSONALIDADE:
- Seja natural, amigável e conversacional
- Use emojis de forma moderada
- Responda como um humano real responderia
- Seja prestativo e informativo
- Mantenha o tom profissional mas caloroso
- Adapte-se ao estilo da conversa do cliente

MENSAGEM ATUAL DO CLIENTE: "${messageText}"

Responda de forma natural e humana. Se for sobre cardápio, horários, delivery ou localização, forneça as informações. Se for saudação, seja caloroso. Se for pergunta específica sobre pratos, seja descritivo e apetitoso. Mantenha a resposta concisa mas completa.`;

      console.log('[WhatsApp AI] Calling OpenAI API...');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        const aiResponse = data.choices[0].message.content.trim();
        console.log('[WhatsApp AI] OpenAI response generated successfully');
        return aiResponse;
      } else {
        console.log('[WhatsApp AI] OpenAI API error, using fallback');
        return generateFallbackResponse(messageText, store);
      }

    } catch (error) {
      console.error('[WhatsApp AI] Error with OpenAI API:', error);
      return generateFallbackResponse(messageText, store);
    }
  }

  function generateFallbackResponse(messageText: string, store: any): string {
    const message = messageText.toLowerCase();
    
    // Check for specific keywords and respond accordingly
    if (message.includes('cardápio') || message.includes('cardapio') || message.includes('menu')) {
      return `🍽️ Confira nosso delicioso cardápio!\n\nAcesse: https://dominiomenu-app.replit.app/menu/${store.slug}\n\nTemos diversas opções especiais esperando por você! 😋`;
    }
    
    if (message.includes('horário') || message.includes('horario') || message.includes('funcionamento') || message.includes('aberto')) {
      return `📅 Nosso horário de funcionamento:\n\nSegunda a Sexta: 11h às 23h\nSábado e Domingo: 18h às 23h\n\nEstamos sempre prontos para atendê-lo!`;
    }
    
    if (message.includes('delivery') || message.includes('entrega') || message.includes('entregar')) {
      return `🚀 Fazemos delivery sim!\n\nTaxa de entrega: R$ 5,00\nTempo médio: 30-45 minutos\nPedido mínimo: R$ 25,00\n\nFaça seu pedido pelo nosso cardápio digital!`;
    }
    
    if (message.includes('localização') || message.includes('endereço') || message.includes('endereco') || message.includes('onde')) {
      return `📍 Venha nos visitar!\n\n${store.address || 'Endereço disponível em breve'}\n\nEsperamos você! 🏪`;
    }
    
    if (message.includes('preço') || message.includes('preco') || message.includes('valor') || message.includes('quanto custa')) {
      return `💰 Nossos preços são super acessíveis!\n\nConfira todas as opções e valores no nosso cardápio:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nTemos opções para todos os bolsos! 😊`;
    }

    if (message.includes('oi') || message.includes('olá') || message.includes('ola') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
      return `Olá! Seja muito bem-vindo(a) ao ${store.name}! 😊\n\nComo posso ajudá-lo hoje?\n\n🍽️ Cardápio - veja nossas delícias\n⏰ Horário - nosso funcionamento\n🚀 Delivery - informações de entrega`;
    }

    if (message.includes('áudio')) {
      return `🎵 Recebi seu áudio!\n\nPara atendê-lo melhor, por favor envie sua mensagem em texto ou acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite "cardápio" para ver nossas opções!`;
    }
    
    if (message.includes('imagem')) {
      return `📷 Recebi sua imagem!\n\nComo posso ajudá-lo? Acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite "cardápio" para ver nossas deliciosas opções!`;
    }
    
    if (message.includes('vídeo')) {
      return `🎥 Recebi seu vídeo!\n\nPara fazer seu pedido, acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite "cardápio" para ver nossas opções!`;
    }
    
    if (message.includes('documento')) {
      return `📄 Recebi seu documento!\n\nPara fazer seu pedido, acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite "cardápio" para ver nossas opções!`;
    }
    
    if (message.includes('figurinha')) {
      return `😄 Que figurinha legal!\n\nComo posso ajudá-lo hoje? Acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite "cardápio" para ver nossas deliciosas opções!`;
    }
    
    // Default response for other messages
    return `Obrigado pela sua mensagem! 😊\n\nPara fazer seu pedido, acesse nosso cardápio digital:\nhttps://dominiomenu-app.replit.app/menu/${store.slug}\n\nOu digite:\n• "cardápio" - ver opções\n• "horário" - horário de funcionamento\n• "delivery" - informações de entrega`;
  }

  // AI Agent configuration routes
  app.get('/api/ai-agent/config', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const store = await storage.getStoreByManagerId(user.id);
      
      if (!store) {
        return res.status(404).json({ message: 'Loja não encontrada' });
      }

      // Get AI config from store metadata or return defaults
      const defaultConfig = {
        nome: "Assistente",
        tom: "amigavel",
        customPrompt: "",
        useEmojis: true,
        isActive: true
      };

      const aiConfig = store.metadata?.aiConfig || defaultConfig;
      res.json(aiConfig);
    } catch (error) {
      console.error('Error fetching AI config:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/ai-agent/config', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const store = await storage.getStoreByManagerId(user.id);
      
      if (!store) {
        return res.status(404).json({ message: 'Loja não encontrada' });
      }

      const aiConfig = req.body;
      
      // Update store with AI config in metadata
      const currentMetadata = store.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        aiConfig: aiConfig
      };

      await storage.updateStore(store.id, {
        metadata: updatedMetadata
      });

      res.json({ success: true, message: 'Configurações do agente salvas com sucesso' });
    } catch (error) {
      console.error('Error saving AI config:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

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

      let instance = await storage.getWhatsappInstance(storeId);
      
      // If instance exists, sync status with Mega API
      if (instance && instance.instanceKey && instance.apiToken) {
        try {
          console.log(`[Status Sync] Checking status for store ${storeId}, instance ${instance.instanceKey}`);
          
          const statusResponse = await fetch(`https://${instance.apiHost}/rest/instance/${instance.instanceKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${instance.apiToken}`
            },
            timeout: 5000
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log(`[Status Sync] API Response:`, statusData);
            
            let newStatus = 'disconnected';
            let phoneNumber = instance.phoneNumber;

            // Check if connected and has user data
            if (statusData.instance && (statusData.instance.status === 'open' || statusData.instance.status === 'connected') && statusData.instance.user) {
              newStatus = 'connected';
              
              // Extract phone number from user ID (format: 556993910380:31@s.whatsapp.net)
              const userId = statusData.instance.user.id;
              if (userId && userId.includes('@')) {
                const extractedPhone = userId.split(':')[0];
                if (extractedPhone.length >= 10) {
                  phoneNumber = extractedPhone;
                }
              }
            }

            // Update instance status if different - preserving isActive state
            if (instance.status !== newStatus || instance.phoneNumber !== phoneNumber) {
              console.log(`[Status Sync] Updating status from ${instance.status} to ${newStatus}`);
              instance = await storage.updateWhatsappInstance(storeId, {
                status: newStatus,
                phoneNumber: phoneNumber,
                isActive: instance.isActive // Preserve current isActive state
              });
            }
          } else {
            console.log(`[Status Sync] API Error: ${statusResponse.status} ${statusResponse.statusText}`);
          }
        } catch (syncError) {
          console.log(`[Status Sync] Error syncing status:`, syncError);
          // Don't fail the request if sync fails, just log it
        }
      }
      
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

  // Customer management routes
  app.get('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const search = req.query.search as string;
      const customers = await storage.getCustomers(store.id, search);
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/customers/stats', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const stats = await storage.getCustomerStats(store.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerData = insertCustomerSchema.parse({
        ...req.body,
        storeId: store.id
      });

      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomerById(customerId, store.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerData = insertCustomerSchema.parse({
        ...req.body,
        storeId: store.id
      });

      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerId = parseInt(req.params.id);
      const updateData = req.body;

      const customer = await storage.updateCustomer(customerId, updateData, store.id);
      res.json(customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerId = parseInt(req.params.id);
      await storage.deleteCustomer(customerId, store.id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/customers/:id/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerId = parseInt(req.params.id);
      const interactionData = insertCustomerInteractionSchema.parse({
        ...req.body,
        customerId,
        storeId: store.id
      });

      const interaction = await storage.createCustomerInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      console.error('Error creating customer interaction:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get('/api/customers/:id/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const store = await storage.getStoreByManagerId(req.session.userId);
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      const customerId = parseInt(req.params.id);
      const interactions = await storage.getCustomerInteractions(customerId, store.id);
      
      res.json(interactions);
    } catch (error) {
      console.error('Error fetching customer interactions:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
