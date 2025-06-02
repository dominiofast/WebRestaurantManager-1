import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ImageUpload from "./ImageUpload";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  storeId: string;
}

export default function ProductModal({ isOpen, onClose, product, storeId }: ProductModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    sectionId: "",
    imageUrl: "",
    isAvailable: true,
    isPromotion: false,
    preparationTime: "15-20 min",
    calories: "",
    allergens: "",
    ingredients: "",
    tags: ""
  });

  // Fetch sections for the dropdown
  const { data: sections = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-sections`],
    enabled: !!storeId
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        sectionId: product.sectionId?.toString() || "",
        imageUrl: product.imageUrl || "",
        isAvailable: product.isAvailable ?? true,
        isPromotion: product.isPromotion ?? false,
        preparationTime: product.preparationTime || "15-20 min",
        calories: product.calories?.toString() || "",
        allergens: product.allergens || "",
        ingredients: product.ingredients || "",
        tags: product.tags || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        sectionId: "",
        imageUrl: "",
        isAvailable: true,
        isPromotion: false,
        preparationTime: "15-20 min",
        calories: "",
        allergens: "",
        ingredients: "",
        tags: ""
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = product 
        ? `/api/stores/${storeId}/menu-products/${product.id}`
        : `/api/stores/${storeId}/menu-products`;
      
      const payload = {
        ...data,
        sectionId: parseInt(data.sectionId),
        calories: data.calories ? parseInt(data.calories) : null
      };

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar produto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-products`] });
      toast({ 
        title: "Sucesso", 
        description: product ? "Produto atualizado!" : "Produto criado!" 
      });
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar o produto",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sectionId) {
      toast({
        title: "Erro",
        description: "Nome, preço e seção são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {product ? "Atualize as informações do produto" : "Adicione um novo produto ao cardápio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Pizza Margherita"
                required
              />
            </div>

            {/* Seção */}
            <div className="space-y-2">
              <Label htmlFor="section">Seção *</Label>
              <Select value={formData.sectionId} onValueChange={(value) => handleInputChange("sectionId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma seção" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section: any) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Ex: 32.90"
                required
              />
            </div>

            {/* Preço Original */}
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Preço Original (promocional)</Label>
              <Input
                id="originalPrice"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                placeholder="Ex: 39.90"
              />
            </div>

            {/* Tempo de Preparo */}
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Tempo de Preparo</Label>
              <Input
                id="preparationTime"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange("preparationTime", e.target.value)}
                placeholder="Ex: 15-20 min"
              />
            </div>

            {/* Calorias */}
            <div className="space-y-2">
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) => handleInputChange("calories", e.target.value)}
                placeholder="Ex: 450"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          {/* Ingredientes */}
          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredientes</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => handleInputChange("ingredients", e.target.value)}
              placeholder="Liste os ingredientes..."
              rows={2}
            />
          </div>

          {/* Alérgenos */}
          <div className="space-y-2">
            <Label htmlFor="allergens">Alérgenos</Label>
            <Input
              id="allergens"
              value={formData.allergens}
              onChange={(e) => handleInputChange("allergens", e.target.value)}
              placeholder="Ex: Glúten, Lactose"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="Ex: Vegetariano, Picante, Novo"
            />
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <ImageUpload
              currentImage={formData.imageUrl}
              onImageChange={(imageUrl) => handleInputChange("imageUrl", imageUrl)}
              className="h-32"
            />
          </div>

          {/* Switches */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleInputChange("isAvailable", checked)}
              />
              <Label htmlFor="available">Disponível</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="promotion"
                checked={formData.isPromotion}
                onCheckedChange={(checked) => handleInputChange("isPromotion", checked)}
              />
              <Label htmlFor="promotion">Em Promoção</Label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : product ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}