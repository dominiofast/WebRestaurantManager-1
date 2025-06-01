import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertMenuItemSchema, insertOrderSchema, insertCompanySchema, insertStoreSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Custom auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    console.log('Auth check - Session:', req.session);
    console.log('Auth check - userId:', req.session?.userId);
    
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      console.log('Auth check - User found:', user?.email, user?.role);
      
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      req.user = { id: user.id, role: user.role };
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: "Erro de autenticação" });
    }
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
      // Manager sees only their assigned store (implement store assignment later)
      return await storage.getStores();
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

  app.get('/api/admin/stores/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      const store = await storage.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ message: "Loja não encontrada" });
      }

      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar loja" });
    }
  });

  app.put('/api/admin/stores/:id', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const id = parseInt(req.params.id);
      const storeData = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(id, storeData);
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar loja" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
