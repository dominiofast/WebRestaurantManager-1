import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, Store } from "lucide-react";
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
}

export default function StoreSettingsNew() {
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
    estimatedDeliveryTime: ""
  });

  const [logoData, setLogoData] = useState({ file: null as File | null, url: "" });
  const [bannerData, setBannerData] = useState({ file: null as File | null, url: "" });

  // Buscar dados da loja
  const { data: store, isLoading } = useQuery<StoreData>({
    queryKey: ['/api/manager/store']
  });

  // Atualizar form quando dados chegarem
  if (store && formData.name === "") {
    setFormData({
      name: store.name || "",
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      description: store.description || "",
      deliveryFee: store.deliveryFee || "",
      minimumOrder: store.minimumOrder || "",
      estimatedDeliveryTime: store.estimatedDeliveryTime || ""
    });
  }

  // Mutation para atualizar loja
  const updateStoreMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!store?.id) throw new Error("ID da loja não encontrado");
      return apiRequest(`/api/stores/${store.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
      toast({
        title: "Sucesso",
        description: "Configurações da loja atualizadas com sucesso"
      });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
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
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Store className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Configurações da Loja</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Gerencie as informações e configurações da sua loja
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure as informações principais da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Loja</Label>
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
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Endereço completo da loja"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@loja.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva sua loja..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
              <CardDescription>
                Configure as opções de entrega da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                  <Input
                    id="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrder">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minimumOrder"
                    value={formData.minimumOrder}
                    onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
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
              </div>
            </CardContent>
          </Card>

          {/* Imagens da Loja */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens da Loja</CardTitle>
              <CardDescription>
                Configure o logo e banner da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Logo da Loja"
                  currentImageUrl={store?.logoUrl || ""}
                  onImageChange={handleLogoChange}
                />
                <ImageUpload
                  label="Banner da Loja"
                  currentImageUrl={store?.bannerUrl || ""}
                  onImageChange={handleBannerChange}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateStoreMutation.isPending}
              className="min-w-[120px]"
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