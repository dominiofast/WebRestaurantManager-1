import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleImageUploadProps {
  label: string;
  storeId: number;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

export default function SimpleImageUpload({ label, storeId, currentImageUrl, onImageUploaded }: SimpleImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "Imagem muito grande. Máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', storeId.toString());
      formData.append('type', label.toLowerCase().includes('logo') ? 'logo' : 'banner');

      const response = await fetch('/api/upload-store-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload');
      }

      const data = await response.json();
      onImageUploaded(data.url);
      setUploaded(true);
      
      toast({
        title: "Sucesso",
        description: `${label} salvo com sucesso!`,
      });

      // Reset uploaded status after 3 seconds
      setTimeout(() => setUploaded(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const inputId = `upload-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      
      {preview ? (
        <div className="mb-4">
          <img 
            src={preview} 
            alt={label} 
            className="w-full h-48 object-cover rounded-lg border"
          />
          {uploaded ? (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Imagem salva com sucesso!
            </p>
          ) : uploading ? (
            <p className="text-sm text-blue-600 mt-2">Salvando imagem...</p>
          ) : (
            <p className="text-sm text-gray-600 mt-2">Imagem carregada - clique em "Escolher" para salvar</p>
          )}
        </div>
      ) : (
        <div 
          className="w-full h-48 border-4 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <ImageIcon className="w-12 h-12 text-blue-500 mb-4" />
          <p className="text-xl font-bold text-blue-700 mb-2">CLIQUE AQUI</p>
          <p className="text-blue-600">para adicionar {label.toLowerCase()}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={() => document.getElementById(inputId)?.click()}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3"
        size="lg"
      >
        <Upload className="w-5 h-5 mr-2" />
        Escolher {label}
      </Button>

      <Input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}