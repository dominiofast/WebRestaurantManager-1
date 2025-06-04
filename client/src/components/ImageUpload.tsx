import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageChange: (file: File | null, url: string) => void;
  className?: string;
  storeId?: number;
}

export default function ImageUpload({ 
  label, 
  currentImageUrl, 
  onImageChange, 
  className = "",
  storeId 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Apenas arquivos de imagem são permitidos",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "Arquivo muito grande. Máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload do arquivo
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use store-specific upload endpoint if storeId is provided
      const uploadUrl = storeId ? `/api/stores/${storeId}/upload` : '/api/upload';
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const data = await response.json();
      onImageChange(file, data.imageUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive"
      });
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    setDeleting(true);
    
    try {
      // Always clear the preview and notify parent first for immediate UI feedback
      setPreview("");
      onImageChange(null, "");

      // If there's a current image from server, try to delete it
      if (currentImageUrl && storeId && currentImageUrl.includes('/api/image/')) {
        const filename = currentImageUrl.split('/api/image/')[1];
        console.log(`Attempting to delete image: ${filename} for store ${storeId}`);
        
        const response = await fetch(`/api/stores/${storeId}/images/${filename}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('Image deleted successfully from server');
          toast({
            title: "Sucesso",
            description: "Imagem excluída com sucesso."
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Failed to delete image from server:', response.status, errorData);
          
          // For legacy images (without store prefix), deletion might fail but removal is still valid
          if (!filename.startsWith(`store_${storeId}_`)) {
            toast({
              title: "Imagem removida",
              description: "Imagem removida (arquivo legado mantido no servidor)."
            });
          } else {
            toast({
              title: "Aviso",
              description: "Erro ao excluir do servidor: " + (errorData.message || "Erro desconhecido"),
              variant: "destructive"
            });
          }
        }
      } else {
        toast({
          title: "Imagem removida",
          description: "Imagem removida com sucesso."
        });
      }
    } catch (error) {
      console.error('Error during image removal:', error);
      toast({
        title: "Erro",
        description: "Erro durante a remoção: " + error.message,
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = preview || (currentImageUrl && currentImageUrl.trim() !== "" ? currentImageUrl : null);

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      
      {displayImage ? (
        <div className="relative group">
          <img
            src={displayImage}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
            onError={(e) => {
              console.error('Image load error:', e);
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuJmFtcDthdGlsZGU7byBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              disabled={uploading || deleting}
            >
              <X className="w-4 h-4 mr-1" />
              {deleting ? "Excluindo..." : "Remover"}
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-4 border-dashed border-orange-300 rounded-xl p-12 text-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer bg-gray-50"
          onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-')}`)?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-orange-600" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">Adicionar Imagem</p>
              <p className="text-gray-600">Clique aqui ou no botão abaixo</p>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={uploading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`file-${label.replace(/\s+/g, '-')}`)?.click();
              }}
            >
              <Upload className="w-5 h-5 mr-2" />
              {uploading ? "Enviando..." : "Escolher Arquivo"}
            </Button>
          </div>
        </div>
      )}

      <Input
        id={`file-${label.replace(/\s+/g, '-')}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}