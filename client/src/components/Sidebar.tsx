import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Home, UtensilsCrossed, ClipboardList, LogOut, Shield, Store, Globe, ShoppingCart, Bot, Settings, ChevronDown, ChevronRight, Plug } from "lucide-react";
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

  // Add AI Agent for managers
  if (userRole === 'manager') {
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
    <div className="bg-navy text-white w-64 flex-shrink-0 hidden lg:flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-semibold">DomínioMenu.AI</h1>
        <p className="text-white/70 text-sm mt-1">
          {isSuperAdmin ? "Super Administração" : (user?.restaurantName || "Sistema de Gestão")}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {getNavigationItems(user?.role || '').map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-coral text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
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
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors cursor-pointer",
                  "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium flex-1">Configurações</span>
                {configExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
              
              {/* Submenu */}
              {configExpanded && (
                <div className="ml-6 space-y-1">
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
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors cursor-pointer",
                  location === "/admin"
                    ? "bg-coral text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Administração</span>
              </div>
            </Link>
          )}
          
          {/* Store Management - Available for super admin and owners */}
          {(isSuperAdmin || user?.role === 'owner') && (
            <Link href="/stores">
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors cursor-pointer",
                  location === "/stores"
                    ? "bg-coral text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Gestão de Lojas</span>
              </div>
            </Link>
          )}
        </div>
      </nav>

      <Separator className="bg-white/10" />

      {/* User Profile */}
      <div className="p-4">
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
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
