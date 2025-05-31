import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import NewOrderModal from "@/components/modals/NewOrderModal";

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
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

  const { data: orders } = useQuery({
    queryKey: ["/api/orders", selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === "all" ? "/api/orders" : `/api/orders?status=${selectedStatus}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
  });

  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu-items"],
    retry: false,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      received: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: "delivered"
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e gerencie todos os pedidos
          </p>
        </div>
        <Button 
          onClick={() => setIsNewOrderModalOpen(true)}
          className="btn-coral"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Status</CardTitle>
          <CardDescription>
            Visualize pedidos por status de preparação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="received">Recebidos</TabsTrigger>
              <TabsTrigger value="preparing">Em Preparo</TabsTrigger>
              <TabsTrigger value="ready">Prontos</TabsTrigger>
              <TabsTrigger value="delivered">Entregues</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders?.map((order: any) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={(id, status) => {
              const nextStatus = getNextStatus(status);
              if (nextStatus !== status) {
                updateOrderStatusMutation.mutate({ id, status: nextStatus });
              }
            }}
          />
        )) || (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {selectedStatus === "all" 
                ? "Nenhum pedido encontrado" 
                : `Nenhum pedido com status "${selectedStatus}" encontrado`}
            </p>
          </div>
        )}
      </div>

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={menuItems || []}
      />
    </div>
  );
}
