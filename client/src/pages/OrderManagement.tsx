import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Truck, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Package, 
  Eye,
  MessageCircle,
  Plus,
  Search
} from "lucide-react";

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: number;
    menuItem: {
      name: string;
      price: string;
    };
    quantity: number;
  }>;
}

const statusConfig = {
  pending: {
    label: "Aguardando Entrega",
    icon: Clock,
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-800",
    iconColor: "text-red-600"
  },
  in_delivery: {
    label: "Saiu para Entrega", 
    icon: Truck,
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-600"
  },
  delivered: {
    label: "Entregue",
    icon: CheckCircle,
    color: "bg-green-50 border-green-200", 
    badge: "bg-green-100 text-green-800",
    iconColor: "text-green-600"
  }
};

function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (orderId: number, status: string) => void }) {
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'in_delivery';
      case 'in_delivery': return 'delivered';
      default: return currentStatus;
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'SAIR';
      case 'in_delivery': return 'ENTREGUE';
      default: return '';
    }
  };

  return (
    <Card className={cn("mb-3 shadow-sm", config.color)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-3 w-3", config.iconColor)} />
            <Badge variant="secondary" className={config.badge}>
              #{order.id} - {order.customerName}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{order.customerAddress}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{order.customerPhone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{order.items?.length || 0} itens</span>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="text-sm font-medium mb-2">Itens:</div>
          <div className="space-y-1 text-xs text-muted-foreground max-h-20 overflow-y-auto">
            {order.items?.map((item, index) => (
              <div key={index}>
                {item.quantity}x {item.menuItem?.name} - R$ {item.menuItem?.price}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm font-semibold">
            Total: R$ {order.total}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              VER
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              CHAT
            </Button>
            
            {order.status !== 'delivered' && (
              <Button
                variant="default"
                size="sm"
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => onStatusChange(order.id, getNextStatus(order.status))}
              >
                {getActionLabel(order.status)}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-coral text-white">
              {order.customerName?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            Domínio Brands Pizza
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", { credentials: "include" });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status atualizado",
        description: "Status do pedido foi atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Filter orders based on search
  const filteredOrders = orders.filter((order: Order) =>
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone?.includes(searchTerm) ||
    order.id.toString().includes(searchTerm)
  );

  // Group orders by status
  const groupedOrders = {
    pending: filteredOrders.filter((order: Order) => order.status === 'pending'),
    in_delivery: filteredOrders.filter((order: Order) => order.status === 'in_delivery'),
    delivered: filteredOrders.filter((order: Order) => order.status === 'delivered'),
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todos os pedidos em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
            <Plus className="h-3 w-3 mr-2" />
            $ VENDA DE BALCÃO SEM CLIENTE
          </Button>
          
          <Button className="bg-green-600 hover:bg-green-700 text-sm">
            REGISTRAR ENTREGA
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Informe o telefone ou nome do cliente e tecle ENTER"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {groupedOrders.pending.length}
            </div>
            <div className="text-sm text-muted-foreground">Aguardando Entrega</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {groupedOrders.in_delivery.length}
            </div>
            <div className="text-sm text-muted-foreground">Saiu para Entrega</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {groupedOrders.delivered.length}
            </div>
            <div className="text-sm text-muted-foreground">Entregue</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredOrders.length}
            </div>
            <div className="text-sm text-muted-foreground">Total de Pedidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const statusOrders = groupedOrders[status as keyof typeof groupedOrders] || [];
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-card border">
                <Icon className={cn("h-4 w-4", config.iconColor)} />
                <h3 className="font-semibold">{config.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {statusOrders.length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {statusOrders.length === 0 ? (
                  <Card className={cn("p-4 text-center", config.color)}>
                    <p className="text-sm text-muted-foreground">
                      Nenhum pedido neste status
                    </p>
                  </Card>
                ) : (
                  statusOrders.map((order: Order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}