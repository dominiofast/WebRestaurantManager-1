import { Bell, LogOut, User, Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopBar() {
  const { user } = useAuth();

  // Buscar informações da loja para obter o slug
  const { data: store } = useQuery({
    queryKey: ['/api/store-by-manager'],
    enabled: !!user
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return { time, date };
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('restaurantUser');
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      localStorage.removeItem('restaurantUser');
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleOpenDigitalMenu = () => {
    // Usar slug da loja se disponível
    if (store?.slug) {
      window.open(`/menu/${store.slug}`, '_blank');
    } else {
      alert('Slug da loja não encontrado. Verifique as configurações da loja.');
    }
  };

  const { time, date } = getCurrentDateTime();

  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Bem-vindo, {user?.ownerName || "Usuário"}!
          </h2>
          <p className="text-muted-foreground text-sm">
            Gerencie seu restaurante de forma eficiente
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Digital Menu Button */}
          <Button 
            onClick={handleOpenDigitalMenu}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-sm font-medium"
          >
            <Menu className="w-4 h-4 mr-2" />
            Cardápio Digital
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">3</span>
            </span>
          </Button>
          
          {/* Date and Time */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{time}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
