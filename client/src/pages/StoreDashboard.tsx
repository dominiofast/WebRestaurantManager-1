import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Store, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface StoreInfo {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  status: string;
  company: {
    name: string;
  };
}

export default function StoreDashboard() {
  const params = useParams();
  const storeId = params.id;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch store info
  const { data: store, isLoading: storeLoading } = useQuery<StoreInfo>({
    queryKey: [`/api/admin/stores/${storeId}`],
    enabled: !!storeId
  });

  // Fetch store stats
  const { data: stats } = useQuery({
    queryKey: [`/api/stores/${storeId}/stats`],
    enabled: !!storeId
  });

  // Fetch store menu sections
  const { data: menuSections = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-sections`],
    enabled: !!storeId
  });

  // Fetch store products
  const { data: menuProducts = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-products`],
    enabled: !!storeId
  });

  // Fetch store orders
  const { data: orders = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/orders`],
    enabled: !!storeId
  });

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Loja não encontrada</h3>
          <p className="mt-1 text-gray-500">A loja solicitada não existe ou você não tem permissão para acessá-la.</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.href = '/store-management'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Gestão de Lojas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/store-management'}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-600">{store.company.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                {store.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => window.open(`/menu/${store.slug}`, '_blank')}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <Globe className="h-4 w-4 mr-2" />
                Ver Cardápio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats?.todaySales || '0,00'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeOrders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats?.avgOrderValue || '0,00'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("menu")}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Adicionar Produto</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span>Ver Pedidos</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => window.open(`/menu/${store.slug}`, '_blank')}
                  >
                    <Globe className="h-6 w-6" />
                    <span>Cardápio Digital</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-6 w-6" />
                    <span>Configurações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciar Cardápio</h2>
              <div className="space-x-2">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Seção
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Seção</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.section?.name || '-'}</TableCell>
                        <TableCell>R$ {product.price}</TableCell>
                        <TableCell>
                          <Badge variant={product.available ? 'default' : 'secondary'}>
                            {product.available ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {menuProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Store className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      Nenhum produto cadastrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comece adicionando o primeiro produto ao cardápio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pedidos</h2>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os pedidos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName || order.customerPhone || 'N/A'}</TableCell>
                        <TableCell>R$ {order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' : 
                            order.status === 'preparing' ? 'default' : 
                            'secondary'
                          }>
                            {order.status === 'pending' && 'Pendente'}
                            {order.status === 'preparing' && 'Preparando'}
                            {order.status === 'ready' && 'Pronto'}
                            {order.status === 'delivered' && 'Entregue'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleTimeString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status !== 'delivered' && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Os pedidos aparecerão aqui quando forem feitos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Configurações da Loja</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="store-name">Nome da Loja</Label>
                    <Input id="store-name" defaultValue={store.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-address">Endereço</Label>
                    <Textarea id="store-address" defaultValue={store.address} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-phone">Telefone</Label>
                    <Input id="store-phone" defaultValue={store.phone} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input id="store-email" type="email" defaultValue={store.email} />
                  </div>
                  <Button>Salvar Alterações</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Cardápio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online-orders">Pedidos Online</Label>
                    <input type="checkbox" id="online-orders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-prices">Mostrar Preços</Label>
                    <input type="checkbox" id="show-prices" defaultChecked />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="delivery-fee">Taxa de Entrega</Label>
                    <Input id="delivery-fee" placeholder="0,00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="min-order">Pedido Mínimo</Label>
                    <Input id="min-order" placeholder="0,00" />
                  </div>
                  <Button>Salvar Configurações</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Gráfico de vendas será implementado aqui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Lista de produtos mais vendidos será implementada aqui</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}