import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Save, Store, Globe, ExternalLink } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function StoreSettings() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: ""
  });

  // Buscar dados da loja
  const { data: store, isLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  // Atualizar dados quando a loja for carregada
  useEffect(() => {
    if (store) {
      console.log('Store data received:', store);
      setStoreInfo({
        name: (store as any).name || "",
        address: (store as any).address || "",
        phone: (store as any).phone || "",
        email: (store as any).email || "",
        description: (store as any).description || ""
      });
      
      // Limpar apenas previews após novos dados, não arquivos selecionados
      if (!logoFile) setLogoPreview("");
      if (!bannerFile) setBannerPreview("");
    }
  }, [store, logoFile, bannerFile]);

  // Upload de imagem
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload da imagem');
      }
      
      return response.json();
    }
  });

  // Atualizar loja
  const updateStoreMutation = useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch(`/api/stores/${(store as any)?.id}`, {
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
    onSuccess: async (data) => {
      // Force refresh the store data
      await queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
      await queryClient.refetchQueries({ queryKey: ['/api/manager/store'] });
      
      toast({
        title: "Sucesso",
        description: "Configurações da loja atualizadas com sucesso!",
      });
      
      // Limpar apenas os previews e arquivos selecionados
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview("");
      setBannerPreview("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações da loja.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (file: File, type: 'logo' | 'banner') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(result);
        } else {
          setBannerFile(file);
          setBannerPreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive"
      });
    }
  };

  const handleSaveImages = async () => {
    try {
      const updates: any = {};

      // Upload logo se selecionado
      if (logoFile) {
        const logoResult = await uploadMutation.mutateAsync(logoFile);
        updates.logo_url = logoResult.imageUrl;
      }

      // Upload banner se selecionado
      if (bannerFile) {
        const bannerResult = await uploadMutation.mutateAsync(bannerFile);
        updates.banner_url = bannerResult.imageUrl;
      }

      // Atualizar loja se há mudanças
      if (Object.keys(updates).length > 0) {
        await updateStoreMutation.mutateAsync(updates);
        
        // Limpar states e previews após sucesso
        setLogoFile(null);
        setBannerFile(null);
        setLogoPreview("");
        setBannerPreview("");
        
        // Invalidar cache para recarregar dados
        await queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
        
        toast({
          title: "Sucesso",
          description: "Imagens salvas com sucesso!",
        });
      } else {
        toast({
          title: "Aviso",
          description: "Nenhuma imagem selecionada para upload.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar imagens.",
        variant: "destructive"
      });
    }
  };

  const handleSaveInfo = async () => {
    try {
      await updateStoreMutation.mutateAsync(storeInfo);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações da loja.",
        variant: "destructive"
      });
    }
  };

  // Mostrar preview durante upload, senão mostrar imagem salva no banco
  const currentLogo = logoPreview || store?.logoUrl;
  const currentBanner = bannerPreview || store?.bannerUrl;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Store className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações da Loja</h1>
                <p className="text-gray-600">Gerencie as informações e imagens da sua loja</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(`/menu/${(store as any)?.slug}`, '_blank')}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Globe className="h-4 w-4 mr-2" />
              Ver Cardápio Digital
              <ExternalLink className="h-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Logo e Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-orange-600" />
                Logo e Banner da Loja
              </CardTitle>
              <CardDescription>
                Atualize as imagens que aparecerão no cardápio digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Logo da Loja</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {currentLogo ? (
                      <img src={currentLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-input')?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Logo
                    </Button>
                    <p className="text-xs text-gray-500">200x200px recomendado</p>
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file, 'logo');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-3">
                <Label>Banner da Loja</Label>
                <div className="space-y-3">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {currentBanner ? (
                      <img src={currentBanner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhum banner selecionado</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('banner-input')?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Banner
                    </Button>
                    <p className="text-xs text-gray-500">1200x400px recomendado</p>
                    <input
                      id="banner-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file, 'banner');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Images Button */}
              {(logoFile || bannerFile) && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSaveImages}
                    disabled={uploadMutation.isPending || updateStoreMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending || updateStoreMutation.isPending ? "Salvando..." : "Salvar Imagens"}
                  </Button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
              </p>
            </CardContent>
          </Card>

          {/* Informações da Loja */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-600" />
                Informações da Loja
              </CardTitle>
              <CardDescription>
                Atualize as informações básicas da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Loja</Label>
                <Input
                  id="name"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da sua loja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={storeInfo.address}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={storeInfo.phone}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@loja.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={storeInfo.description}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua loja..."
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveInfo}
                  disabled={updateStoreMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateStoreMutation.isPending ? "Salvando..." : "Salvar Informações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}