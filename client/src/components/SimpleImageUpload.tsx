import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon } from "lucide-react";

interface SimpleImageUploadProps {
  label: string;
  onImageSelected: (file: File) => void;
}

export default function SimpleImageUpload({ label, onImageSelected }: SimpleImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    onImageSelected(file);
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
          <p className="text-sm text-green-600 mt-2">Arquivo selecionado: {selectedFile?.name}</p>
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