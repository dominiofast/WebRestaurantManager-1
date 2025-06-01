import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Store, TrendingUp, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatsCard from "@/components/StatsCard";

export default function SuperAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    email: "",
    firstName: "",
    lastName: "",
    restaurantName: ""
  });
  const { toast } = useToast();

  // Buscar todos os restaurantes
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/admin/restaurants'],
    queryFn: async () => {
      const res = await fetch('/api/admin/restaurants');
      if (!res.ok) throw new Error('Erro ao buscar restaurantes');
      return res.json();
    }
  });

  // Buscar estatísticas globais
  const { data: globalStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/global-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/global-stats');
      if (!res.ok) throw new Error('Erro ao buscar estatísticas');
      return res.json();
    }
  });

  // Mutação para criar novo restaurante
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: typeof newRestaurant) => {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Erro ao criar restaurante');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Restaurante criado com sucesso!"
      });
      setIsDialogOpen(false);
      setNewRestaurant({ email: "", firstName: "", lastName: "", restaurantName: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar restaurante",
        variant: "destructive"
      });
    }
  });

  const handleCreateRestaurant = () => {
    if (!newRestaurant.email || !newRestaurant.firstName || 
        !newRestaurant.lastName || !newRestaurant.restaurantName) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    createRestaurantMutation.mutate(newRestaurant);
  };

  if (restaurantsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Administração</h1>
          <p className="text-gray-600">Gerencie todos os restaurantes da plataforma</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Restaurante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Restaurante</DialogTitle>
              <DialogDescription>
                Adicione um novo restaurante à plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restaurante.com"
                  value={newRestaurant.email}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    placeholder="João"
                    value={newRestaurant.firstName}
                    onChange={(e) => setNewRestaurant(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    placeholder="Silva"
                    value={newRestaurant.lastName}
                    onChange={(e) => setNewRestaurant(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="restaurantName">Nome do Restaurante</Label>
                <Input
                  id="restaurantName"
                  placeholder="Restaurante do João"
                  value={newRestaurant.restaurantName}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, restaurantName: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRestaurant}
                disabled={createRestaurantMutation.isPending}
              >
                {createRestaurantMutation.isPending ? "Criando..." : "Criar Restaurante"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Globais */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Restaurantes"
            value={globalStats.totalRestaurants.toString()}
            icon={Store}
            description="Restaurantes ativos na plataforma"
          />
          <StatsCard
            title="Vendas Hoje"
            value={`R$ ${globalStats.totalSales.toFixed(2)}`}
            icon={DollarSign}
            description="Vendas de todos os restaurantes hoje"
          />
          <StatsCard
            title="Pedidos Hoje"
            value={globalStats.totalOrders.toString()}
            icon={TrendingUp}
            description="Total de pedidos hoje"
          />
          <StatsCard
            title="Média por Restaurante"
            value={`R$ ${globalStats.avgSalesPerRestaurant.toFixed(2)}`}
            icon={Users}
            description="Vendas médias por restaurante"
          />
        </div>
      )}

      {/* Lista de Restaurantes */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Cadastrados</CardTitle>
          <CardDescription>
            {restaurants.length} restaurantes na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {restaurants.map((restaurant: any) => (
              <div
                key={restaurant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {restaurant.restaurantName || 'Nome não informado'}
                    </h3>
                    <p className="text-gray-600">
                      {restaurant.firstName} {restaurant.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{restaurant.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Criado em: {new Date(restaurant.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Status: Ativo
                  </div>
                </div>
              </div>
            ))}
            
            {restaurants.length === 0 && (
              <div className="text-center py-8">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nenhum restaurante cadastrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando o primeiro restaurante à plataforma.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}