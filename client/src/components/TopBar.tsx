import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function TopBar() {
  const { user } = useAuth();

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

  const { time, date } = getCurrentDateTime();

  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Bem-vindo, {user?.firstName || "Usuário"}!
          </h2>
          <p className="text-muted-foreground text-sm">
            Gerencie seu restaurante de forma eficiente
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
}
