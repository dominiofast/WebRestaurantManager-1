import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Settings,
  Eye,
  Globe,
  Save
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

export default function StoreConfig() {
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState({
    logoUrl: "",
    bannerUrl: "",
    primaryColor: "#ff6b35",
    secondaryColor: "#2563eb",
    showLogo: true,
    showBanner: true,
    darkMode: false
  });

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  // Load store data into form when store data is available
  useEffect(() => {
    if (store) {
      setStoreSettings({
        logoUrl: (store as any).logoUrl || "",
        bannerUrl: (store as any).bannerUrl || "",
        primaryColor: "#ff6b35",
        secondaryColor: "#2563eb",
        showLogo: true,
        showBanner: true,
        darkMode: false
      });
    }
  }, [store]);

  // Update store settings mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch(`/api/stores/${store?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar loja');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
      toast({
        title: "Configurações salvas",
        description: "A aparência da loja foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da loja.",
        variant: "destructive"
      });
    }
  });

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Loja não encontrada</h3>
          <p className="mt-1 text-gray-500">Você não tem uma loja associada ou não tem permissão para acessá-la.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aparência da Loja</h1>
            <p className="text-gray-600 mt-1">Configure a identidade visual do seu cardápio digital</p>
          </div>
          <Button 
            onClick={() => updateStoreMutation.mutate(storeSettings)}
            disabled={updateStoreMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateStoreMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Logo e Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600 text-lg">Logo da Loja</CardTitle>
              <CardDescription>
                Adicione o logo que aparecerá no cabeçalho do cardápio digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                currentImage={storeSettings.logoUrl}
                onImageChange={(logoUrl) => setStoreSettings(prev => ({...prev, logoUrl}))}
                className="h-32 w-32 mx-auto"
                accept="image/*"
                maxSize={2}
              />
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-600 font-medium">Especificações recomendadas:</p>
                <p className="text-xs text-gray-500">• Tamanho: 200x200px (formato quadrado)</p>
                <p className="text-xs text-gray-500">• Formato: PNG ou JPEG</p>
                <p className="text-xs text-gray-500">• Tamanho máximo: 2MB</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-600 text-lg">Banner da Loja</CardTitle>
              <CardDescription>
                Adicione um banner promocional para destacar ofertas especiais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                currentImage={storeSettings.bannerUrl}
                onImageChange={(bannerUrl) => setStoreSettings(prev => ({...prev, bannerUrl}))}
                className="h-24 w-full"
                accept="image/*"
                maxSize={3}
              />
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">Especificações recomendadas:</p>
                <p className="text-xs text-gray-500">• Tamanho: 1200x400px (formato retangular)</p>
                <p className="text-xs text-gray-500">• Formato: PNG ou JPEG</p>
                <p className="text-xs text-gray-500">• Tamanho máximo: 3MB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opções de Personalização */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-600 text-lg">Cores do Tema</CardTitle>
              <CardDescription>Personalize as cores do seu cardápio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Principal</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="primary-color"
                    type="color"
                    value={storeSettings.primaryColor}
                    onChange={(e) => setStoreSettings(prev => ({...prev, primaryColor: e.target.value}))}
                    className="w-16 h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={storeSettings.primaryColor}
                    onChange={(e) => setStoreSettings(prev => ({...prev, primaryColor: e.target.value}))}
                    className="flex-1"
                    placeholder="#ff6b35"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={storeSettings.secondaryColor}
                    onChange={(e) => setStoreSettings(prev => ({...prev, secondaryColor: e.target.value}))}
                    className="w-16 h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={storeSettings.secondaryColor}
                    onChange={(e) => setStoreSettings(prev => ({...prev, secondaryColor: e.target.value}))}
                    className="flex-1"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600 text-lg">Configurações de Exibição</CardTitle>
              <CardDescription>Configure como os elementos aparecem no cardápio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Mostrar Logo</Label>
                  <p className="text-xs text-gray-500">Exibir logo no cabeçalho do cardápio</p>
                </div>
                <Switch 
                  checked={storeSettings.showLogo}
                  onCheckedChange={(checked) => setStoreSettings(prev => ({...prev, showLogo: checked}))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Mostrar Banner</Label>
                  <p className="text-xs text-gray-500">Exibir banner promocional no topo</p>
                </div>
                <Switch 
                  checked={storeSettings.showBanner}
                  onCheckedChange={(checked) => setStoreSettings(prev => ({...prev, showBanner: checked}))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Modo Escuro</Label>
                  <p className="text-xs text-gray-500">Tema escuro para o cardápio</p>
                </div>
                <Switch 
                  checked={storeSettings.darkMode}
                  onCheckedChange={(checked) => setStoreSettings(prev => ({...prev, darkMode: checked}))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview do Cardápio */}
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-600 text-lg">Pré-visualização</CardTitle>
            <CardDescription>Veja como seu cardápio aparecerá para os clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Cardápio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/menu/${store.slug}`, '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>Visualize as mudanças em tempo real no seu cardápio digital</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}