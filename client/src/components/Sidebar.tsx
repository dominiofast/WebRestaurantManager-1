import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Home, UtensilsCrossed, ClipboardList, LogOut, Shield, Store, Globe, ShoppingCart, Bot, Settings, ChevronDown, ChevronRight, Plug, User, Users, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const getNavigationItems = (userRole: string) => {
  const baseItems = [
    {
      href: "/",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/menu",
      icon: UtensilsCrossed,
      label: "Cardápio",
    },
    {
      href: "/orders",
      icon: ClipboardList,
      label: "Pedidos",
    },
    {
      href: "/pdv",
      icon: ShoppingCart,
      label: "Pedidos (PDV)",
    },
  ];

  // Add AI Agent and Customers for managers
  if (userRole === 'manager') {
    baseItems.push({
      href: "/customers",
      icon: Users,
      label: "Clientes",
    });
    baseItems.push({
      href: "/ai-agent",
      icon: Bot,
      label: "Agente de IA",
    });
  }

  // Only show menu manager for owners and super admins (multi-store management)
  if (userRole === 'owner' || userRole === 'super_admin') {
    baseItems.push({
      href: "/menu-manager",
      icon: Globe,
      label: "Gestor de Cardápio",
    });
  }

  return baseItems;
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isSuperAdmin } = useAuth();
  const [configExpanded, setConfigExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isManager = user?.role === 'manager';

  const handleLogout = async () => {
    try {
      localStorage.removeItem('restaurantUser');
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      localStorage.removeItem('restaurantUser');
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-navy text-white hover:bg-navy/80"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-navy text-white flex-shrink-0 flex flex-col transition-all duration-300 z-50",
        "fixed lg:relative inset-y-0 left-0",
        isCollapsed 
          ? "w-16 lg:w-16" 
          : "w-64 lg:w-64",
        isCollapsed && "hidden lg:flex",
        !isCollapsed && "flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-semibold">DomínioMenu.AI</h1>
              <p className="text-white/70 text-sm mt-1">
                {isSuperAdmin ? "Super Administração" : (user?.restaurantName || "Sistema de Gestão")}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-white hover:bg-white/10"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {getNavigationItems(user?.role || '').map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center rounded-lg transition-colors cursor-pointer group",
                      isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-3 space-x-3",
                      isActive
                        ? "bg-coral text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          
            {/* Configurações - Submenu recolhível para managers */}
            {isManager && (
              <div className="space-y-1">
                <div
                  onClick={() => setConfigExpanded(!configExpanded)}
                  className={cn(
                    "flex items-center rounded-lg transition-colors cursor-pointer group",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-3 space-x-3",
                    "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? "Configurações" : undefined}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium flex-1">Configurações</span>
                      {configExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </div>
              
              {/* Submenu */}
              {configExpanded && (
                <div className="ml-6 space-y-1">
                  <Link href="/config/profile">
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                        location === "/config/profile"
                          ? "bg-coral text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">Perfil</span>
                    </div>
                  </Link>
                  <Link href="/config/integrations">
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                        location === "/config/integrations"
                          ? "bg-coral text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Plug className="w-4 h-4" />
                      <span className="font-medium text-sm">Integrações</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
          
            {/* Super Admin Navigation */}
            {isSuperAdmin && (
              <Link href="/admin">
                <div
                  className={cn(
                    "flex items-center rounded-lg transition-colors cursor-pointer group",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-3 space-x-3",
                    location === "/admin"
                      ? "bg-coral text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? "Administração" : undefined}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">Administração</span>}
                </div>
              </Link>
            )}
            
            {/* Store Management - Available for super admin and owners */}
            {(isSuperAdmin || user?.role === 'owner') && (
              <Link href="/stores">
                <div
                  className={cn(
                    "flex items-center rounded-lg transition-colors cursor-pointer group",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-3 space-x-3",
                    location === "/stores"
                      ? "bg-coral text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? "Gestão de Lojas" : undefined}
                >
                  <Store className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">Gestão de Lojas</span>}
                </div>
              </Link>
            )}
          </div>
        </nav>

        <Separator className="bg-white/10" />

        {/* User Profile */}
        <div className={cn("p-4", isCollapsed && "px-2")}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.ownerName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {user?.ownerName || 'Usuário'}
                </p>
                <p className="text-white/70 text-xs truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "justify-start text-white/80 hover:text-white hover:bg-white/10",
              isCollapsed ? "w-full px-3" : "w-full"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
