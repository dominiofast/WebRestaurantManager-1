import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import MenuManagementDragDrop from "@/components/MenuManagementDragDrop";
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
  Eye,
  Sliders
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ImageUpload from "@/components/ImageUpload";
import ProductModal from "@/components/ProductModal";
import SectionModal from "@/components/SectionModal";
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
    name: string;
  };
}

export default function StoreDashboard({ storeId: propStoreId }: { storeId?: number }) {
  const params = useParams();
  const { user } = useAuth();
  // Use prop storeId if provided, otherwise use URL parameter or default for managers
  const storeId = propStoreId?.toString() || params.id || '11';
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
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    inscricaoEstadual: "",
    cep: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    cnae: "",
    padrao: "",
    descricaoCnae: "",
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

  // Update product availability mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: number; updates: any }) => {
      const response = await fetch(`/api/stores/${storeId}/menu-products/${productId}`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-products`] });
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
    queryKey: [`/api/stores/${storeId}/orders`],
    enabled: !!storeId
  });

  // Update store settings mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar informações da loja');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Informações da loja atualizadas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/stores/${storeId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load store data into form when store data is available
  useEffect(() => {
    if (store) {
      setStoreSettings({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        cnpj: "47.375.928/0001-87",
        razaoSocial: "DOMINIO PIZZAS E BURGERS GOURMET LTDA",
        nomeFantasia: store.name || "",
        inscricaoEstadual: "0000000013430",
        cep: "70051-900",
        numero: "2638",
        complemento: "",
        bairro: "Centro",
        cidade: "Brasília",
        estado: "DF",
        pais: "Brasil",
        cnae: "56201",
        padrao: "medio",
        descricaoCnae: "56201-1/04 - Fornecimento de alimentos preparados preponderantemente para consumo domiciliar",
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

  const handleSaveSettings = () => {
    updateStoreMutation.mutate(storeSettings);
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

            {/* Organize products by sections */}
            {menuSections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Nenhuma seção cadastrada
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando seções para organizar seu cardápio.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {menuSections.map((section: any) => {
                  const sectionProducts = menuProducts.filter((product: any) => product.sectionId === section.id);
                  
                  return (
                    <Card key={section.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{section.name}</CardTitle>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {sectionProducts.length} {sectionProducts.length === 1 ? 'produto' : 'produtos'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {sectionProducts.length === 0 ? (
                          <div className="text-center py-6 border-t">
                            <p className="text-sm text-gray-500">Nenhum produto nesta seção</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sectionProducts.map((product: any) => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {product.imageUrl && (
                                        <img 
                                          src={product.imageUrl} 
                                          alt={product.name}
                                          className="w-10 h-10 rounded-lg object-cover"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium">{product.name}</p>
                                        {product.description && (
                                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">R$ {product.price}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateProductMutation.mutate({
                                        productId: product.id,
                                        updates: { available: !product.available }
                                      })}
                                      disabled={updateProductMutation.isPending}
                                      className="p-0 h-auto"
                                    >
                                      <Badge 
                                        variant={product.available ? 'default' : 'secondary'}
                                        className="cursor-pointer hover:opacity-80"
                                      >
                                        {product.available ? 'Disponível' : 'Indisponível'}
                                      </Badge>
                                    </Button>
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
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Products without section */}
                {(() => {
                  const orphanProducts = menuProducts.filter((product: any) => !product.sectionId);
                  if (orphanProducts.length === 0) return null;
                  
                  return (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg text-amber-600">Produtos sem Seção</CardTitle>
                          <Badge variant="outline" className="border-amber-200 text-amber-600">
                            {orphanProducts.length} {orphanProducts.length === 1 ? 'produto' : 'produtos'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produto</TableHead>
                              <TableHead>Preço</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orphanProducts.map((product: any) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {product.imageUrl && (
                                      <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="w-10 h-10 rounded-lg object-cover"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium">{product.name}</p>
                                      {product.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">R$ {product.price}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateProductMutation.mutate({
                                      productId: product.id,
                                      updates: { isAvailable: !product.isAvailable }
                                    })}
                                    disabled={updateProductMutation.isPending}
                                    className="p-0 h-auto"
                                  >
                                    <Badge 
                                      variant={product.isAvailable ? 'default' : 'secondary'}
                                      className="cursor-pointer hover:opacity-80"
                                    >
                                      {product.isAvailable ? 'Disponível' : 'Indisponível'}
                                    </Badge>
                                  </Button>
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
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Informações da Loja</h2>
              <Button onClick={handleSaveSettings} disabled={updateStoreMutation.isPending}>
                <Settings className="h-4 w-4 mr-2" />
                {updateStoreMutation.isPending ? "Salvando..." : "Salvar Todas as Alterações"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo e Banner da Loja */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Logo e Banner</CardTitle>
                  <p className="text-sm text-gray-600">Configure as imagens que aparecerão no cardápio digital</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="logo">Logo da Loja</Label>
                    <ImageUpload
                      currentImage={storeSettings.logoUrl}
                      onImageChange={(logoUrl) => setStoreSettings({...storeSettings, logoUrl})}
                      className="h-32"
                    />
                    <p className="text-xs text-gray-500">Recomendado: 200x200px, formato quadrado</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="banner">Banner da Loja</Label>
                    <ImageUpload
                      currentImage={storeSettings.bannerUrl}
                      onImageChange={(bannerUrl) => setStoreSettings({...storeSettings, bannerUrl})}
                      className="h-24"
                    />
                    <p className="text-xs text-gray-500">Recomendado: 1200x400px, formato retangular</p>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Loja */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Informações da Loja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input id="codigo" defaultValue="2502" disabled className="bg-gray-50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="razao-social">Razão Social *</Label>
                    <Input 
                      id="razao-social" 
                      value={storeSettings.razaoSocial}
                      onChange={(e) => setStoreSettings({...storeSettings, razaoSocial: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ/CPF *</Label>
                    <Input 
                      id="cnpj" 
                      value={storeSettings.cnpj}
                      onChange={(e) => setStoreSettings({...storeSettings, cnpj: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefone1">Telefone 1 *</Label>
                    <Input 
                      id="telefone1" 
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input id="cep" defaultValue="70051-900" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endereco">Endereço *</Label>
                    <Input id="endereco" defaultValue="AV PORTO VELHO" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" defaultValue="Centro" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select defaultValue="DF">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="AL">AL</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="DF">DF</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                        <SelectItem value="GO">GO</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="PB">PB</SelectItem>
                        <SelectItem value="PR">PR</SelectItem>
                        <SelectItem value="PE">PE</SelectItem>
                        <SelectItem value="PI">PI</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="RN">RN</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                        <SelectItem value="RO">RO</SelectItem>
                        <SelectItem value="RR">RR</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="SE">SE</SelectItem>
                        <SelectItem value="TO">TO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pais">País</Label>
                    <Input id="pais" defaultValue="Brasil" />
                  </div>
                </CardContent>
              </Card>

              {/* Informações Fiscais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Informações Fiscais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome-fantasia">Nome Fantasia *</Label>
                    <Input id="nome-fantasia" defaultValue="DOMINIO PIZZAS - LACUBA" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inscricao-estadual">Inscrição Estadual *</Label>
                    <Input id="inscricao-estadual" defaultValue="0000000013430" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefone2">Telefone 2</Label>
                    <Input id="telefone2" defaultValue="(95) 99232-4060" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input id="numero" defaultValue="2638" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" defaultValue="Caracaí" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnae">CNAE</Label>
                    <Select defaultValue="56201">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a atividade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="56201">56201 - Restaurantes e estabelecimentos de bebidas, com serviço completo</SelectItem>
                        <SelectItem value="56202">56202 - Lanchonetes, casas de chá, de sucos e similares</SelectItem>
                        <SelectItem value="56203">56203 - Bares e outros estabelecimentos especializados em servir bebidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="padrao">Padrão</Label>
                    <Select defaultValue="medio">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="luxo">Luxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao-cnae">Descrição CNAE</Label>
                    <Textarea 
                      id="descricao-cnae" 
                      defaultValue="56201-1/04 - Fornecimento de alimentos preparados preponderantemente para consumo domiciliar"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Configurações do Cardápio Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="online-orders">Pedidos Online</Label>
                      <input type="checkbox" id="online-orders" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-prices">Mostrar Preços</Label>
                      <input type="checkbox" id="show-prices" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="delivery-available">Entrega Disponível</Label>
                      <input type="checkbox" id="delivery-available" defaultChecked className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label>
                      <Input id="delivery-fee" placeholder="5,00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="min-order">Pedido Mínimo (R$)</Label>
                      <Input id="min-order" placeholder="25,00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="delivery-time">Tempo de Entrega (min)</Label>
                      <Input id="delivery-time" placeholder="30-45" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="opening-hours">Horário de Funcionamento</Label>
                      <Input id="opening-hours" placeholder="18:00 - 23:00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="whatsapp">WhatsApp para Pedidos</Label>
                      <Input id="whatsapp" placeholder="(95) 99999-9999" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="@bellavista.centro" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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