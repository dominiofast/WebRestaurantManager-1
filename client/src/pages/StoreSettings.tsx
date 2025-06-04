import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Store, Clock, Truck, DollarSign, Settings, Image as ImageIcon, Globe } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { apiRequest } from "@/lib/queryClient";

interface StoreData {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  description: string | null;
  deliveryFee: string;
  minimumOrder: string;
  estimatedDeliveryTime: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: string;
  slug: string;
  openingHours: string | null;
  company?: {
    id: number;
    name: string;
    description: string | null;
  };
}

export default function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    deliveryFee: "",
    minimumOrder: "",
    estimatedDeliveryTime: "",
    openingHours: "",
    status: "active"
  });

  const [logoData, setLogoData] = useState({ file: null as File | null, url: "" });
  const [bannerData, setBannerData] = useState({ file: null as File | null, url: "" });

  // Buscar dados da loja do manager
  const { data: store, isLoading, error } = useQuery<StoreData>({
    queryKey: ['/api/manager/store'],
    retry: 3,
    staleTime: 30000
  });

  // Atualizar formulário quando dados carregarem
  useEffect(() => {
    if (store && store.id) {
      setFormData({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        description: store.description || "",
        deliveryFee: store.deliveryFee || "0",
        minimumOrder: store.minimumOrder || "0",
        estimatedDeliveryTime: store.estimatedDeliveryTime || "30-45 min",
        openingHours: store.openingHours || "",
        status: store.status || "active"
      });
    }
  }, [store]);

  // Mutation para atualizar loja
  const updateStoreMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!store?.id) throw new Error("ID da loja não encontrado");
      
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar loja');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Sucesso",
        description: "Configurações da loja atualizadas com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar configurações",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (file: File | null, url: string) => {
    setLogoData({ file, url });
  };

  const handleBannerChange = (file: File | null, url: string) => {
    setBannerData({ file, url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: any = { ...formData };
    
    // Adicionar URLs das imagens se foram alteradas
    if (logoData.url) {
      updates.logo_url = logoData.url;
    }
    if (bannerData.url) {
      updates.banner_url = bannerData.url;
    }

    await updateStoreMutation.mutateAsync(updates);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar dados</h3>
                <p className="text-gray-600">Não foi possível carregar as informações da loja.</p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] })}
                  className="mt-4"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{store?.name || "Configurações da Loja"}</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todas as configurações e informações da sua loja
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={store?.status === 'active' ? 'default' : 'secondary'}>
              {store?.status === 'active' ? 'Ativa' : 'Inativa'}
            </Badge>
            {store?.slug && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {store.slug}
              </Badge>
            )}
          </div>
        </div>

        {/* Company Info */}
        {store?.company && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Empresa:</span>
                <span className="text-blue-700">{store.company.name}</span>
                {store.company.description && (
                  <span className="text-gray-600">- {store.company.description}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="delivery">Entrega & Preços</TabsTrigger>
              <TabsTrigger value="images">Imagens</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* Informações Básicas */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Informações da Loja
                  </CardTitle>
                  <CardDescription>
                    Configure as informações principais que aparecem para os clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Loja *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nome da sua loja"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, bairro, cidade - CEP"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email de Contato</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@loja.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição da Loja</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva sua loja, especialidades, diferenciais..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status === 'active'}
                      onCheckedChange={(checked) => 
                        handleInputChange('status', checked ? 'active' : 'inactive')
                      }
                    />
                    <Label htmlFor="status">Loja Ativa (visível para clientes)</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Entrega & Preços */}
            <TabsContent value="delivery" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Configurações de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="deliveryFee"
                        value={formData.deliveryFee}
                        onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedDeliveryTime">Tempo de Entrega</Label>
                      <Input
                        id="estimatedDeliveryTime"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                        placeholder="30-45 min"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Configurações de Preço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="minimumOrder">Pedido Mínimo (R$)</Label>
                      <Input
                        id="minimumOrder"
                        value={formData.minimumOrder}
                        onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Imagens */}
            <TabsContent value="images" className="space-y-6">
              <Card className="border-2 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <ImageIcon className="w-6 h-6" />
                    📸 ADICIONAR IMAGENS DA LOJA
                  </CardTitle>
                  <CardDescription className="text-orange-700 font-medium">
                    Clique nas áreas abaixo para adicionar logo e banner da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        🏪 Logo da Loja
                      </h3>
                      <ImageUpload
                        label="Logo da Loja"
                        currentImageUrl={store?.logoUrl || null}
                        onImageChange={handleLogoChange}
                        storeId={store?.id}
                        className="min-h-[250px]"
                      />
                      <p className="text-sm text-gray-600">
                        <strong>Recomendado:</strong> 200x200px, formato quadrado
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        🖼️ Banner da Loja
                      </h3>
                      <ImageUpload
                        label="Banner da Loja"
                        currentImageUrl={store?.bannerUrl || null}
                        onImageChange={handleBannerChange}
                        storeId={store?.id}
                        className="min-h-[250px]"
                      />
                      <p className="text-sm text-gray-600">
                        <strong>Recomendado:</strong> 1200x400px, formato retangular
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Instruções:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Clique na área tracejada para selecionar uma imagem</li>
                      <li>• Para remover uma imagem, passe o mouse sobre ela e clique no X</li>
                      <li>• Tamanho máximo: 5MB por imagem</li>
                      <li>• Formatos aceitos: JPG, PNG, GIF</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avançado */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="openingHours">Horário de Funcionamento</Label>
                    <Textarea
                      id="openingHours"
                      value={formData.openingHours}
                      onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      placeholder="Ex: Segunda a Sexta: 11:00 - 22:00&#10;Sábado e Domingo: 12:00 - 23:00"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Botão de Salvar */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateStoreMutation.isPending}
              className="min-w-[140px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateStoreMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}