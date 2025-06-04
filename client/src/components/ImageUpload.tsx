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
  className = "" 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
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

      const response = await fetch('/api/upload', {
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

  const removeImage = () => {
    setPreview("");
    onImageChange(null, "");
    
    toast({
      title: "Imagem removida",
      description: "A imagem foi removida. Salve as alterações para confirmar."
    });
  };

  const displayImage = preview || currentImageUrl;

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
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-1" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Clique para selecionar uma imagem</p>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById(`file-${label}`)?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Enviando..." : "Selecionar Arquivo"}
          </Button>
        </div>
      )}

      <Input
        id={`file-${label}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}