import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Clock, Users } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "received":
        return "default";
      case "preparing":
        return "secondary";
      case "ready":
        return "outline";
      case "delivered":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: "Recebido",
      preparing: "Em Preparo", 
      ready: "Pronto",
      delivered: "Entregue"
    };
    return labels[status] || status;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu restaurante
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Vendas Hoje"
          value={`R$ ${(stats?.todaySales || 0).toFixed(2).replace('.', ',')}`}
          icon={DollarSign}
          trend="+12.5%"
          description="vs. ontem"
        />
        <StatsCard
          title="Pedidos Hoje"
          value={stats?.todayOrders?.toString() || "0"}
          icon={ShoppingCart}
          trend="+8.2%"
          description="vs. ontem"
        />
        <StatsCard
          title="Ticket Médio"
          value={`R$ ${(stats?.avgOrderValue || 0).toFixed(2).replace('.', ',')}`}
          icon={DollarSign}
          trend="-2.1%"
          description="vs. ontem"
        />
        <StatsCard
          title="Pedidos Ativos"
          value={stats?.activeOrders?.toString() || "0"}
          icon={Clock}
          description="em andamento"
        />
      </div>

      {/* Recent Orders and Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Últimos pedidos do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                      <span className="font-medium text-coral">#{order.id}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.tableNumber ? `Mesa ${order.tableNumber}` : "Balcão"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} itens • R$ {parseFloat(order.totalAmount).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pedido encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <a 
                href="/orders" 
                className="flex items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center mr-4">
                  <ShoppingCart className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="font-medium">Novo Pedido</p>
                  <p className="text-sm text-muted-foreground">Criar um novo pedido</p>
                </div>
              </a>
              
              <a 
                href="/menu" 
                className="flex items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="font-medium">Gerenciar Cardápio</p>
                  <p className="text-sm text-muted-foreground">Adicionar ou editar itens</p>
                </div>
              </a>
              
              <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="font-medium">Pedidos Ativos</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.activeOrders || 0} pedidos aguardando
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
