import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCategorySchema, insertMenuItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Custom auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      // Find user by email and password (in production, use proper password hashing)
      const users = await storage.getAllUsers();
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // For demo purposes, check if password matches any stored value or the demo password
      if (email === 'adm@dominiomenu.com' && password === 'admin123@@') {
        // Store user session
        (req.session as any).userId = user.id;
        res.json({ 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            restaurantName: user.restaurantName
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
        first_name: firstName,
        last_name: lastName,
        restaurant_name: restaurantName,
        role: 'user'
      };

      const user = await storage.upsertUser(userData);
      
      // Store user session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          restaurantName: user.restaurant_name
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
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      req.user = { id: user.id };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Erro de autenticação" });
    }
  };

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
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.deleteCategory(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Menu item routes
  app.get('/api/menu-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const menuItems = await storage.getMenuItems(userId, categoryId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/menu-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertMenuItemSchema.parse({ ...req.body, userId });
      const menuItem = await storage.createMenuItem(itemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.deleteMenuItem(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string;
      const orders = await storage.getOrders(userId, status);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
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

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
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
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
