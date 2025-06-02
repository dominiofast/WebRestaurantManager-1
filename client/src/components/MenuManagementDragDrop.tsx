import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  DollarSign,
  Clock,
  Tag
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface MenuSection {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  products: MenuProduct[];
}

interface MenuProduct {
  id: number;
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isPromotion: boolean;
  displayOrder: number;
  tags?: string;
  sectionId: number;
}

interface MenuManagementDragDropProps {
  storeId: string;
}

export default function MenuManagementDragDrop({ storeId }: MenuManagementDragDropProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [isAddingProductOpen, setIsAddingProductOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch menu sections and products
  const { data: sections = [], isLoading } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-sections`],
    enabled: !!storeId
  });

  const { data: products = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-products`],
    enabled: !!storeId
  });

  // Combine sections with their products
  const sectionsWithProducts: MenuSection[] = sections.map((section: any) => ({
    ...section,
    products: products.filter((product: any) => product.sectionId === section.id)
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
  })).sort((a, b) => a.displayOrder - b.displayOrder);

  // Mutation to update section order
  const updateSectionOrderMutation = useMutation({
    mutationFn: async (updatedSections: { id: number; displayOrder: number }[]) => {
      await Promise.all(
        updatedSections.map(section =>
          fetch(`/api/stores/${storeId}/menu-sections/${section.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayOrder: section.displayOrder })
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-sections`] });
      toast({ title: "Ordem das seções atualizada!" });
    }
  });

  // Mutation to delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/stores/${storeId}/menu-products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-products`] });
      toast({ title: "Produto excluído com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Não foi possível excluir o produto",
        variant: "destructive"
      });
    }
  });

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Mutation to update product order
  const updateProductOrderMutation = useMutation({
    mutationFn: async (updatedProducts: { id: number; displayOrder: number }[]) => {
      await Promise.all(
        updatedProducts.map(product =>
          fetch(`/api/stores/${storeId}/menu-products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayOrder: product.displayOrder })
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-products`] });
      toast({ title: "Ordem dos produtos atualizada!" });
    }
  });

  // Handle drag end for sections
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sectionsWithProducts.findIndex(section => section.id === active.id);
      const newIndex = sectionsWithProducts.findIndex(section => section.id === over?.id);

      const newSections = arrayMove(sectionsWithProducts, oldIndex, newIndex);
      const updatedSections = newSections.map((section, index) => ({
        id: section.id,
        displayOrder: index
      }));

      updateSectionOrderMutation.mutate(updatedSections);
    }
  };

  // Handle drag end for products within a section
  const handleProductDragEnd = (event: DragEndEvent, sectionId: number) => {
    const { active, over } = event;

    const section = sectionsWithProducts.find(s => s.id === sectionId);
    if (!section || active.id === over?.id) return;

    const oldIndex = section.products.findIndex(product => product.id === active.id);
    const newIndex = section.products.findIndex(product => product.id === over?.id);

    const newProducts = arrayMove(section.products, oldIndex, newIndex);
    const updatedProducts = newProducts.map((product, index) => ({
      id: product.id,
      displayOrder: index
    }));

    updateProductOrderMutation.mutate(updatedProducts);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Cardápio</h2>
          <p className="text-gray-600">Arraste e solte para reordenar seções e produtos</p>
        </div>
        <Dialog open={isAddingSectionOpen} onOpenChange={setIsAddingSectionOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Seção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Seção</DialogTitle>
            </DialogHeader>
            <SectionForm 
              storeId={storeId} 
              onSuccess={() => setIsAddingSectionOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sections with drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext items={sectionsWithProducts.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sectionsWithProducts.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                storeId={storeId}
                onEditSection={setEditingSection}
                onAddProduct={() => {
                  setActiveSection(section.id);
                  setIsAddingProductOpen(true);
                }}
                onEditProduct={setEditingProduct}
                onProductDragEnd={handleProductDragEnd}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Product Dialog */}
      <Dialog open={isAddingProductOpen} onOpenChange={setIsAddingProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
          </DialogHeader>
          <ProductForm 
            storeId={storeId}
            sectionId={activeSection}
            onSuccess={() => setIsAddingProductOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Seção</DialogTitle>
          </DialogHeader>
          <SectionForm 
            storeId={storeId}
            section={editingSection}
            onSuccess={() => setEditingSection(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <ProductForm 
            storeId={storeId}
            product={editingProduct}
            onSuccess={() => setEditingProduct(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sortable Section Component
function SortableSection({ 
  section, 
  storeId, 
  onEditSection, 
  onAddProduct, 
  onEditProduct, 
  onProductDragEnd 
}: {
  section: MenuSection;
  storeId: string;
  onEditSection: (section: MenuSection) => void;
  onAddProduct: () => void;
  onEditProduct: (product: MenuProduct) => void;
  onProductDragEnd: (event: DragEndEvent, sectionId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{section.name}</CardTitle>
              <Badge variant={section.isActive ? "default" : "secondary"}>
                {section.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddProduct}
            >
              <Plus className="w-4 h-4 mr-1" />
              Produto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditSection(section)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {section.products.length > 0 ? (
          <DndContext
            sensors={useSensor(PointerSensor)}
            collisionDetection={closestCenter}
            onDragEnd={(event) => onProductDragEnd(event, section.id)}
          >
            <SortableContext items={section.products.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {section.products.map((product) => (
                  <SortableProduct
                    key={product.id}
                    product={product}
                    onEdit={() => onEditProduct(product)}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum produto nesta seção</p>
            <Button
              variant="outline"
              onClick={onAddProduct}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro produto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sortable Product Component
function SortableProduct({ 
  product, 
  onEdit,
  onDelete 
}: {
  product: MenuProduct;
  onEdit: () => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      {product.imageUrl ? (
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{product.name}</h4>
          {product.isPromotion && (
            <Badge variant="destructive" className="text-xs">Promoção</Badge>
          )}
          {!product.isAvailable && (
            <Badge variant="secondary" className="text-xs">Indisponível</Badge>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 truncate">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-orange-600">R$ {product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              R$ {product.originalPrice}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Section Form Component
function SectionForm({ 
  storeId, 
  section, 
  onSuccess 
}: {
  storeId: string;
  section?: MenuSection | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: section?.name || "",
    description: section?.description || "",
    isActive: section?.isActive ?? true
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = section 
        ? `/api/stores/${storeId}/menu-sections/${section.id}`
        : `/api/stores/${storeId}/menu-sections`;
      
      const response = await fetch(url, {
        method: section ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar seção');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-sections`] });
      toast({ title: section ? "Seção atualizada!" : "Seção criada!" });
      onSuccess();
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar a seção",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Seção</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Hambúrguers, Bebidas, Sobremesas"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição da seção..."
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Seção ativa</Label>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : (section ? "Atualizar" : "Criar")}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Product Form Component
function ProductForm({ 
  storeId, 
  sectionId, 
  product, 
  onSuccess 
}: {
  storeId: string;
  sectionId?: number | null;
  product?: MenuProduct | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    imageUrl: product?.imageUrl || "",
    isAvailable: product?.isAvailable ?? true,
    isPromotion: product?.isPromotion ?? false,
    tags: product?.tags || "",
    sectionId: product?.sectionId || sectionId || ""
  });

  // Fetch sections for select
  const { data: sections = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-sections`],
    enabled: !!storeId
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = product 
        ? `/api/stores/${storeId}/menu-products/${product.id}`
        : `/api/stores/${storeId}/menu-products`;
      
      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar produto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-products`] });
      toast({ title: product ? "Produto atualizado!" : "Produto criado!" });
      onSuccess();
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
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do produto"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="sectionId">Seção</Label>
          <Select
            value={formData.sectionId.toString()}
            onValueChange={(value) => setFormData({ ...formData, sectionId: parseInt(value) })}
          >
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
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do produto..."
        />
      </div>
      
      {/* Configuração de promoção */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPromotion"
            checked={formData.isPromotion}
            onCheckedChange={(checked) => setFormData({ ...formData, isPromotion: checked })}
          />
          <Label htmlFor="isPromotion" className="font-medium">Produto em promoção</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {formData.isPromotion && (
            <div>
              <Label htmlFor="originalPrice" className="text-sm font-medium">Preço Original (R$)</Label>
              <Input
                id="originalPrice"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="80.00"
                type="number"
                step="0.01"
                className="mt-1"
                required={formData.isPromotion}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="price" className="text-sm font-medium">
              {formData.isPromotion ? 'Preço Promocional (R$)' : 'Preço (R$)'}
            </Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder={formData.isPromotion ? "50.00" : "0.00"}
              type="number"
              step="0.01"
              className="mt-1"
              required
            />
          </div>
        </div>
        
        {formData.isPromotion && formData.originalPrice && formData.price && (
          <div className="text-sm text-green-600 bg-green-100 p-2 rounded font-medium">
            💰 Desconto: {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% OFF
          </div>
        )}
      </div>
      
      <ImageUpload
        currentImage={formData.imageUrl}
        onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
      />
      
      <div>
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Destaque, Mais Vendido, Especial"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isAvailable"
          checked={formData.isAvailable}
          onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
        />
        <Label htmlFor="isAvailable">Produto disponível no cardápio</Label>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : (product ? "Atualizar" : "Criar")}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}