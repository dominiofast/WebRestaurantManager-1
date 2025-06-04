import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Search, Eye, EyeOff, Plus, Edit, Trash2, UtensilsCrossed, DollarSign, Upload, ImageIcon } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  // Buscar seções do cardápio
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ["/api/menu-sections"],
  });

  // Buscar produtos do cardápio
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/menu-products"],
  });

  // Mutation para upload de imagem
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload da imagem');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProductForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem",
        variant: "destructive"
      });
    }
  });

  // Mutation para criar/editar produto
  const productMutation = useMutation({
    mutationFn: (data: typeof productForm) => {
      const url = editingProduct ? `/api/menu-products/${editingProduct.id}` : '/api/menu-products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      return apiRequest(method, url, {
        ...data,
        sectionId: parseInt(data.sectionId),
        price: data.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: editingProduct ? "Produto atualizado!" : "Produto criado!"
      });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: "", description: "", price: "", sectionId: "", 
        imageUrl: "", isAvailable: true, isPublic: true
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-products"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  });

  // Mutation para criar/editar seção
  const sectionMutation = useMutation({
    mutationFn: (data: typeof sectionForm) => {
      const url = editingSection ? `/api/menu-sections/${editingSection.id}` : '/api/menu-sections';
      const method = editingSection ? 'PUT' : 'POST';
      
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: editingSection ? "Seção atualizada!" : "Seção criada!"
      });
      setIsSectionDialogOpen(false);
      setEditingSection(null);
      setSectionForm({ name: "", description: "", displayOrder: 0, isActive: true });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-sections"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar seção",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/menu-products/${id}`),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Produto deletado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-products"] });
    }
  });

  // Mutation para deletar seção
  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/menu-sections/${id}`),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Seção deletada!" });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-sections"] });
    }
  });

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || 
                          (product.section && product.section.id.toString() === selectedSection);
    return matchesSearch && matchesSection;
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      sectionId: product.sectionId?.toString() || "",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable ?? true,
      isPublic: product.isPublic ?? true
    });
    setIsProductDialogOpen(true);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name || "",
      description: section.description || "",
      displayOrder: section.displayOrder || 0,
      isActive: section.isActive ?? true
    });
    setIsSectionDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.sectionId) {
      toast({
        title: "Erro",
        description: "Nome, preço e seção são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    productMutation.mutate(productForm);
  };

  const handleSaveSection = () => {
    if (!sectionForm.name) {
      toast({
        title: "Erro",
        description: "Nome da seção é obrigatório",
        variant: "destructive"
      });
      return;
    }
    sectionMutation.mutate(sectionForm);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      setUploadingImage(true);
      uploadImageMutation.mutate(file);
    }
  };

  const publicProducts = products.filter((product: any) => product.isPublic);
  const totalProducts = products.length;

  if (isLoadingSections || isLoadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestor de Cardápio</h1>
          <p className="text-gray-600">Gerencie seções e produtos do seu cardápio digital</p>
        </div>
        <div className="flex gap-2">
          {/* Botão Nova Seção */}
          <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Seção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSection ? "Editar Seção" : "Nova Seção"}
                </DialogTitle>
                <DialogDescription>
                  {editingSection ? "Edite os dados da seção" : "Adicione uma nova seção ao cardápio"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="section-name">Nome da Seção *</Label>
                  <Input
                    id="section-name"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Hambúrgueres"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section-description">Descrição</Label>
                  <Textarea
                    id="section-description"
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da seção"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section-order">Ordem de Exibição</Label>
                  <Input
                    id="section-order"
                    type="number"
                    value={sectionForm.displayOrder}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="section-active"
                    checked={sectionForm.isActive}
                    onCheckedChange={(checked) => setSectionForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="section-active">Seção ativa</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSection} disabled={sectionMutation.isPending}>
                  {sectionMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão Novo Produto */}
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Edite os dados do produto" : "Adicione um novo produto ao cardápio"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-name">Nome do Produto *</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Hambúrguer Artesanal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-description">Descrição</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada do produto"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Preço *</Label>
                  <Input
                    id="product-price"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="29,90"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-section">Seção *</Label>
                  <Select value={productForm.sectionId} onValueChange={(value) => setProductForm(prev => ({ ...prev, sectionId: value }))}>
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
                
                {/* Upload de Imagem */}
                <div className="grid gap-2">
                  <Label>Imagem do Produto</Label>
                  <div className="flex gap-2">
                    <Input
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="URL da imagem ou faça upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadImageMutation.isPending}
                    >
                      {uploadImageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {productForm.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={productForm.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="product-available"
                    checked={productForm.isAvailable}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="product-available">Disponível no sistema</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="product-public"
                    checked={productForm.isPublic}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="product-public">Visível no cardápio público</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={productMutation.isPending}>
                  {productMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <UtensilsCrossed className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Públicos</p>
              <p className="text-2xl font-bold text-gray-900">{publicProducts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Seções</p>
              <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
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
              <Label htmlFor="section-filter">Filtrar por seção</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as seções</SelectItem>
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

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedSection !== "all" 
                    ? "Tente ajustar os filtros" 
                    : "Comece adicionando seu primeiro produto"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              {product.imageUrl && (
                <div className="aspect-video relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant={product.isAvailable ? "default" : "secondary"} className="text-xs">
                      {product.isAvailable ? "Disponível" : "Indisponível"}
                    </Badge>
                    <Badge variant={product.isPublic ? "default" : "outline"} className="text-xs">
                      {product.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Badge>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">R$ {product.price}</span>
                      {product.section && (
                        <Badge variant="outline" className="text-xs">
                          {product.section.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lista de Seções */}
      <Card>
        <CardHeader>
          <CardTitle>Seções do Cardápio</CardTitle>
          <CardDescription>Gerencie as seções do seu cardápio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section: any) => (
              <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{section.name}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={section.isActive ? "default" : "secondary"} className="text-xs">
                      {section.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                    <span className="text-xs text-gray-500">Ordem: {section.displayOrder}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSection(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSectionMutation.mutate(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}