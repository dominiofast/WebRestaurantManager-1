import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Save } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function StoreImageUpload() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // Buscar dados da loja
  const { data: store } = useQuery({
    queryKey: ['/api/manager/store'],
  });

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
        title: "Sucesso",
        description: "Imagens da loja atualizadas com sucesso!",
      });
      // Limpar previews
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview("");
      setBannerPreview("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar imagens da loja.",
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

  const handleSave = async () => {
    try {
      const updates: any = {};

      // Upload logo se selecionado
      if (logoFile) {
        const logoResult = await uploadMutation.mutateAsync(logoFile);
        updates.logoUrl = logoResult.imageUrl;
      }

      // Upload banner se selecionado
      if (bannerFile) {
        const bannerResult = await uploadMutation.mutateAsync(bannerFile);
        updates.bannerUrl = bannerResult.imageUrl;
      }

      // Atualizar loja se há mudanças
      if (Object.keys(updates).length > 0) {
        await updateStoreMutation.mutateAsync(updates);
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

  const currentLogo = logoPreview || (store as any)?.logoUrl;
  const currentBanner = bannerPreview || (store as any)?.bannerUrl;

  return (
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
          <Label>Logo da Loja (Recomendado: 200x200px)</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {currentLogo ? (
                <img src={currentLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo-input')?.click()}
                disabled={uploadMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Logo
              </Button>
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
          <Label>Banner da Loja (Recomendado: 1200x400px)</Label>
          <div className="space-y-3">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {currentBanner ? (
                <img src={currentBanner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum banner selecionado</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => document.getElementById('banner-input')?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Banner
            </Button>
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

        {/* Save Button */}
        {(logoFile || bannerFile) && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={uploadMutation.isPending || updateStoreMutation.isPending}
              className="w-full"
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
  );
}