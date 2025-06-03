import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Globe, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Store,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AddonsModal from "@/components/AddonsModal";

interface StoreInfo {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  status: string;
  company: {
    id: number;
    name: string;
  };
}

export default function ManagerStoreDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [addonsModalOpen, setAddonsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  
  const [storeSettings, setStoreSettings] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    deliveryFee: "",
    minimumOrder: "",
    deliveryTime: "",
    openingHours: "",
    whatsapp: "",
    instagram: "",
    onlineOrders: true,
    showPrices: true,
    deliveryAvailable: true
  });

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery<StoreInfo>({
    queryKey: ['/api/manager/store'],
  });

  // Fetch store stats using store ID from manager's store
  const { data: stats } = useQuery({
    queryKey: [`/api/stores/${store?.id}/stats`],
    enabled: !!store?.id
  });

  // Fetch store menu sections
  const { data: menuSections = [] } = useQuery({
    queryKey: [`/api/stores/${store?.id}/menu-sections`],
    enabled: !!store?.id
  });

  // Fetch store products
  const { data: menuProducts = [] } = useQuery({
    queryKey: [`/api/stores/${store?.id}/menu-products`],
    enabled: !!store?.id
  });

  // Update product availability mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: number; updates: any }) => {
      const response = await fetch(`/api/stores/${store?.id}/menu-products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${store?.id}/menu-products`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/stores/${store?.id}/menu-products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${store?.id}/menu-products`] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: number) => {
      const response = await fetch(`/api/stores/${store?.id}/menu-sections/${sectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar seção');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${store?.id}/menu-sections`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${store?.id}/menu-products`] });
      toast({
        title: "Sucesso",
        description: "Seção excluída com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch store orders
  const { data: orders = [] } = useQuery({
    queryKey: [`/api/stores/${store?.id}/orders`],
    enabled: !!store?.id
  });

  // Load store data into form when store data is available
  useEffect(() => {
    if (store) {
      setStoreSettings({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deliveryFee: "5,00",
        minimumOrder: "25,00",
        deliveryTime: "30-45",
        openingHours: "18:00 - 23:00",
        whatsapp: "(95) 99999-9999",
        instagram: `@${store.slug}`,
        onlineOrders: true,
        showPrices: true,
        deliveryAvailable: true
      });
    }
  }, [store]);

  // Modal handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleCreateSection = () => {
    setSelectedSection(null);
    setSectionModalOpen(true);
  };

  const handleEditSection = (section: any) => {
    setSelectedSection(section);
    setSectionModalOpen(true);
  };

  const handleDeleteSection = (sectionId: number) => {
    if (confirm('Tem certeza que deseja excluir esta seção? Todos os produtos da seção serão removidos.')) {
      deleteSectionMutation.mutate(sectionId);
    }
  };

  const handleManageAddons = (product: any) => {
    setSelectedProduct(product);
    setAddonsModalOpen(true);
  };

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
          <p className="mt-1 text-gray-500">Você não tem uma loja associada ou não tem permissão para acessá-la.</p>
          <Button 
            className="mt-4" 
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
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
                onClick={() => setLocation('/dashboard')}
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
                Ver Cardápio Digital
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
            <TabsTrigger value="agent">Agente de IA</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
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
                    <span>Ver Cardápio</span>
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
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <Store className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gerenciamento de Cardápio</h3>
                  <p className="mb-4">Use o sistema administrativo completo para gerenciar seções e produtos</p>
                  <Button 
                    onClick={() => window.open(`/menu/${store.slug}`, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Ver Cardápio Digital
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
                <p className="text-gray-600">Acompanhe todos os pedidos da sua loja</p>
              </div>
            </div>

            {orders?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">Os pedidos aparecerão aqui quando chegarem</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders?.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Pedido #{order.id}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                          <p className="font-bold mt-1">R$ {order.total}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="agent" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Agente de IA WhatsApp</h2>
                <p className="text-gray-600">Configure o assistente virtual para atendimento automático no WhatsApp</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Configurações do Agente
                  </CardTitle>
                  <CardDescription>
                    Configure as informações básicas do seu agente de IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Nome do Agente</Label>
                    <Input
                      id="agent-name"
                      placeholder="Ex: Assistente Bella Vista"
                      defaultValue={`Assistente ${store.name}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">Número WhatsApp</Label>
                    <Input
                      id="whatsapp-number"
                      placeholder="Ex: +55 11 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personalidade do Agente</Label>
                    <Textarea
                      id="personality"
                      placeholder="Descreva como o agente deve se comportar (amigável, profissional, etc.)"
                      defaultValue="Sou um assistente virtual amigável e prestativo do restaurante. Estou aqui para ajudar com informações sobre nosso cardápio, fazer pedidos e responder dúvidas."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="agent-active" defaultChecked />
                    <Label htmlFor="agent-active">Agente Ativo</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Welcome Message */}
              <Card>
                <CardHeader>
                  <CardTitle>Mensagem de Boas-vindas</CardTitle>
                  <CardDescription>
                    Primeira mensagem que os clientes recebem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Mensagem</Label>
                    <Textarea
                      id="welcome-message"
                      placeholder="Escreva a mensagem de boas-vindas"
                      defaultValue={`Olá! 👋 Bem-vindo ao ${store.name}!\n\nSou seu assistente virtual e estou aqui para ajudar você a:\n• Ver nosso cardápio\n• Fazer pedidos\n• Tirar dúvidas\n\nComo posso ajudá-lo hoje?`}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                  <CardDescription>
                    Configure quando o agente deve responder automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opening-time">Abertura</Label>
                      <Input
                        id="opening-time"
                        type="time"
                        defaultValue="18:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closing-time">Fechamento</Label>
                      <Input
                        id="closing-time"
                        type="time"
                        defaultValue="23:00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closed-message">Mensagem fora do horário</Label>
                    <Textarea
                      id="closed-message"
                      placeholder="Mensagem quando estiver fechado"
                      defaultValue={`Obrigado por entrar em contato com o ${store.name}!\n\nNo momento estamos fechados.\nNosso horário de funcionamento é de 18h às 23h.\n\nEm breve retornaremos seu contato! 😊`}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Responses */}
              <Card>
                <CardHeader>
                  <CardTitle>Respostas Automáticas</CardTitle>
                  <CardDescription>
                    Configure respostas para perguntas frequentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">📍 Localização</p>
                      <p className="text-sm text-gray-600">{store.address || "Endereço não configurado"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">🕒 Horário</p>
                      <p className="text-sm text-gray-600">18h às 23h - Segunda a Domingo</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">🚚 Entrega</p>
                      <p className="text-sm text-gray-600">Taxa: R$ 5,00 - Pedido mínimo: R$ 25,00</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">💳 Pagamento</p>
                      <p className="text-sm text-gray-600">Dinheiro, Pix, Cartão (débito/crédito)</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Resposta Personalizada
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="text-sm text-gray-600">
                Status: <span className="text-green-600 font-medium">Agente Ativo</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Testar Agente
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Loja</CardTitle>
                <CardDescription>
                  Configure as informações básicas da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nome da Loja</Label>
                    <Input
                      id="store-name"
                      value={storeSettings.name}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Telefone</Label>
                    <Input
                      id="store-phone"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={storeSettings.whatsapp}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Endereço</Label>
                  <Textarea
                    id="store-address"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddonsModal
        isOpen={addonsModalOpen}
        onClose={() => setAddonsModalOpen(false)}
        productId={selectedProduct?.id}
        productName={selectedProduct?.name || ''}
      />
    </div>
  );
}