import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string | null;
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

  // Verificar se há uma imagem válida
  const hasImage = preview || (currentImageUrl && currentImageUrl.trim() !== "" && currentImageUrl !== "null" && currentImageUrl !== "undefined");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', storeId?.toString() || '');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload');
      }

      const data = await response.json();
      onImageChange(file, data.url);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: currentImageUrl,
          storeId: storeId 
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir');
      }

      setPreview("");
      onImageChange(null, "");
      
      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso!",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const fileInputId = `file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor={fileInputId}>{label}</Label>
      
      {hasImage ? (
        <div className="relative group">
          <img
            src={preview || currentImageUrl!}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
            >
              <X className="w-4 h-4 mr-2" />
              {deleting ? "Removendo..." : "Remover"}
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-4 border-dashed border-orange-300 rounded-xl p-12 text-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer bg-gray-50 min-h-[250px] flex items-center justify-center"
          onClick={() => document.getElementById(fileInputId)?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-orange-600" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-800">Clique para Adicionar Imagem</p>
              <p className="text-gray-600">Arraste e solte ou clique no botão abaixo</p>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={uploading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(fileInputId)?.click();
              }}
            >
              <Upload className="w-5 h-5 mr-2" />
              {uploading ? "Enviando..." : "Escolher Arquivo"}
            </Button>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            )}
          </div>
        </div>
      )}

      <Input
        id={fileInputId}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}