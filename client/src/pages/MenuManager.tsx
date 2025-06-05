import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, EyeOff, Plus, Edit, Trash2, UtensilsCrossed, DollarSign, Upload, Settings } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MenuManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    sectionId: "",
    imageUrl: "",
    isAvailable: true,
    isPublic: true
  });

  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
    displayOrder: 0,
    isActive: true
  });

  // Fetch menu sections
  const { data: sections = [] } = useQuery({
    queryKey: ['/api/menu-sections'],
    staleTime: 1000 * 60 * 5
  });

  // Fetch menu products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/menu-products'],
    staleTime: 1000 * 60 * 5
  });

  // Filter products
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || product.sectionId.toString() === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/menu-products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "Produto criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar produto", description: error.message, variant: "destructive" });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/menu-products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "Produto atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar produto", description: error.message, variant: "destructive" });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/menu-products/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-products'] });
      toast({ title: "Produto excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir produto", description: error.message, variant: "destructive" });
    }
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/menu-sections', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-sections'] });
      setIsSectionDialogOpen(false);
      resetSectionForm();
      toast({ title: "Seção criada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar seção", description: error.message, variant: "destructive" });
    }
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/menu-sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-sections'] });
      setIsSectionDialogOpen(false);
      resetSectionForm();
      toast({ title: "Seção atualizada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar seção", description: error.message, variant: "destructive" });
    }
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      sectionId: "",
      imageUrl: "",
      isAvailable: true,
      isPublic: true
    });
    setEditingProduct(null);
  };

  const resetSectionForm = () => {
    setSectionForm({
      name: "",
      description: "",
      displayOrder: 0,
      isActive: true
    });
    setEditingSection(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      sectionId: product.sectionId.toString(),
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable,
      isPublic: product.isPublic
    });
    setIsProductDialogOpen(true);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name,
      description: section.description || "",
      displayOrder: section.displayOrder || 0,
      isActive: section.isActive
    });
    setIsSectionDialogOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...productForm,
      sectionId: parseInt(productForm.sectionId),
      price: productForm.price.replace(',', '.')
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, data: sectionForm });
    } else {
      createSectionMutation.mutate(sectionForm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Cardápio</h1>
          <p className="text-muted-foreground">
            Organize seus produtos e categorias do cardápio digital
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetSectionForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetProductForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Eye className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Públicos</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter((p: any) => p.isPublic).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite o nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="section-filter">Filtrar por categoria</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {sections.map((section: any) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Organized by Category */}
      <div className="space-y-6">
        {sections.map((section: any) => {
          const sectionProducts = filteredProducts.filter((product: any) => 
            product.sectionId === section.id
          );
          
          if (sectionProducts.length === 0 && (searchTerm || selectedSection !== "all")) {
            return null;
          }

          return (
            <Card key={section.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={section.isActive ? "default" : "secondary"}>
                      {section.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSection(section)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sectionProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum produto nesta categoria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sectionProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground">{product.description}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-green-600">R$ {product.price}</span>
                              <Badge variant={product.isAvailable ? "default" : "secondary"} className="text-xs">
                                {product.isAvailable ? "Disponível" : "Indisponível"}
                              </Badge>
                              <Badge variant={product.isPublic ? "default" : "outline"} className="text-xs">
                                {product.isPublic ? "Público" : "Privado"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Editar Produto"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            title="Deletar Produto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "Atualize as informações do produto" : "Adicione um novo produto ao cardápio"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product-name">Nome *</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do produto"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-price">Preço *</Label>
                <Input
                  id="product-price"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="29,90"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do produto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-section">Categoria *</Label>
              <Select value={productForm.sectionId} onValueChange={(value) => setProductForm(prev => ({ ...prev, sectionId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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
            <div className="grid gap-2">
              <Label>URL da Imagem</Label>
              <Input
                value={productForm.imageUrl}
                onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? "Atualizar" : "Criar"} Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {editingSection ? "Atualize as informações da categoria" : "Adicione uma nova categoria ao cardápio"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="section-name">Nome *</Label>
              <Input
                id="section-name"
                value={sectionForm.name}
                onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da categoria"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-description">Descrição</Label>
              <Textarea
                id="section-description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da categoria"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSection ? "Atualizar" : "Criar"} Categoria
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}