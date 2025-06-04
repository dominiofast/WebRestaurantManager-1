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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Search, Eye, EyeOff, Plus, Edit, Trash2, UtensilsCrossed, DollarSign, Upload, Settings, Copy, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MenuManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [selectedProductForAddons, setSelectedProductForAddons] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("groups");
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [newAddons, setNewAddons] = useState<Array<{name: string, price: string, description: string}>>([]);
  const [editingAddons, setEditingAddons] = useState<Array<{id?: number, name: string, price: string, description: string, isNew?: boolean}>>([]);
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

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    isRequired: false,
    allowMultiple: false,
    maxSelections: "1"
  });

  // Buscar seções do cardápio
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ["/api/menu-sections"],
  });

  // Buscar produtos do cardápio
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/menu-products"],
  });

  // Buscar grupos de adicionais para produto selecionado
  const { data: addonGroups = [] } = useQuery({
    queryKey: [`/api/menu-products/${selectedProductForAddons?.id}/addon-groups`],
    enabled: !!selectedProductForAddons
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

  // Mutation para criar grupo de addon com adicionais
  const createGroupWithAddonsMutation = useMutation({
    mutationFn: async (data: {group: typeof groupForm, addons: typeof newAddons}) => {
      // Primeiro criar o grupo
      const groupResponse = await apiRequest('POST', '/api/addon-groups', {
        ...data.group,
        productId: selectedProductForAddons?.id
      });
      
      console.log('Grupo criado:', groupResponse);
      
      // Depois criar os adicionais um por um com verificação
      if (data.addons.length > 0) {
        for (const addon of data.addons) {
          if (addon.name && addon.price) { // Só criar se tiver nome e preço
            const addonData = {
              name: addon.name,
              description: addon.description || "",
              price: addon.price,
              groupId: groupResponse.id
            };
            
            console.log('Criando adicional:', addonData);
            
            try {
              await apiRequest('POST', '/api/addons', addonData);
            } catch (error) {
              console.error('Erro ao criar adicional:', addon, error);
              throw error;
            }
          }
        }
      }
      
      return groupResponse;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Grupo e adicionais criados!" });
      setGroupForm({ name: "", description: "", isRequired: false, maxSelections: 1 });
      setNewAddons([]);
      setActiveTab("groups");
      queryClient.invalidateQueries({ queryKey: ["/api/menu-products", selectedProductForAddons?.id, "addon-groups"] });
    },
    onError: (error) => {
      console.error('Erro na criação:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao criar grupo ou adicionais. Verifique os dados.",
        variant: "destructive" 
      });
    }
  });

  // Mutation para copiar grupo para outro produto
  const copyGroupMutation = useMutation({
    mutationFn: async (data: {groupId: number, targetProductId: number}) => {
      // Buscar grupo original com adicionais
      const originalGroup = addonGroups.find((g: any) => g.id === data.groupId);
      if (!originalGroup) throw new Error("Grupo não encontrado");
      
      // Criar novo grupo
      const newGroup = await apiRequest('POST', '/api/addon-groups', {
        name: originalGroup.name,
        description: originalGroup.description,
        isRequired: originalGroup.isRequired,
        maxSelections: originalGroup.maxSelections,
        productId: data.targetProductId
      });
      
      // Copiar adicionais
      if (originalGroup.addons && originalGroup.addons.length > 0) {
        for (const addon of originalGroup.addons) {
          await apiRequest('POST', '/api/addons', {
            name: addon.name,
            description: addon.description,
            price: addon.price,
            groupId: newGroup.id
          });
        }
      }
      
      return newGroup;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Grupo copiado com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Erro ao copiar grupo",
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

  // Mutation para deletar grupo
  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/addon-groups/${id}`),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Grupo deletado!" });
      queryClient.invalidateQueries({ queryKey: [`/api/menu-products/${selectedProductForAddons?.id}/addon-groups`] });
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Erro ao deletar grupo",
        variant: "destructive" 
      });
    }
  });

  // Mutation para editar grupo existente
  const editGroupMutation = useMutation({
    mutationFn: async (data: {group: typeof groupForm, addons: typeof editingAddons}) => {
      // Atualizar o grupo
      await apiRequest('PUT', `/api/addon-groups/${editingGroup.id}`, data.group);
      
      // Atualizar/criar/deletar adicionais
      for (const addon of data.addons) {
        if (addon.id && !addon.isNew) {
          // Atualizar adicional existente
          await apiRequest('PUT', `/api/addons/${addon.id}`, {
            name: addon.name,
            description: addon.description,
            price: addon.price
          });
        } else if (addon.isNew) {
          // Criar novo adicional
          await apiRequest('POST', '/api/addons', {
            name: addon.name,
            description: addon.description,
            price: addon.price,
            groupId: editingGroup.id
          });
        }
      }
      
      return true;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Grupo editado com sucesso!" });
      setEditingGroup(null);
      setEditingAddons([]);
      setActiveTab("groups");
      queryClient.invalidateQueries({ queryKey: [`/api/menu-products/${selectedProductForAddons?.id}/addon-groups`] });
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Erro ao editar grupo",
        variant: "destructive" 
      });
    }
  });

  // Mutation para deletar adicional
  const deleteAddonMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/addons/${id}`),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Adicional deletado!" });
      queryClient.invalidateQueries({ queryKey: [`/api/menu-products/${selectedProductForAddons?.id}/addon-groups`] });
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

  const handleManageAddons = (product: any) => {
    setSelectedProductForAddons(product);
    setActiveTab("groups");
    setIsAddonDialogOpen(true);
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

  const handleCreateGroupWithAddons = () => {
    if (!groupForm.name) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    createGroupWithAddonsMutation.mutate({
      group: groupForm,
      addons: newAddons
    });
  };

  const handleAddNewAddon = () => {
    setNewAddons(prev => [...prev, { name: "", price: "", description: "" }]);
  };

  const handleRemoveAddon = (index: number) => {
    setNewAddons(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAddon = (index: number, field: string, value: string) => {
    setNewAddons(prev => prev.map((addon, i) => 
      i === index ? { ...addon, [field]: value } : addon
    ));
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
      uploadImageMutation.mutate(file);
    }
  };

  const handleCopyGroup = (groupId: number, targetProductId: number) => {
    copyGroupMutation.mutate({ groupId, targetProductId });
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
          <p className="text-gray-600">Gerencie seções, produtos e adicionais do seu cardápio digital</p>
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

      {/* Lista de Produtos em Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos do Cardápio</CardTitle>
          <CardDescription>Lista completa dos produtos com opções de gerenciamento</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Seção</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || selectedSection !== "all" 
                        ? "Tente ajustar os filtros" 
                        : "Comece adicionando seu primeiro produto"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.section && (
                        <Badge variant="outline">{product.section.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {product.price}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isAvailable ? "default" : "secondary"}>
                        {product.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isPublic ? "default" : "outline"}>
                        {product.isPublic ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {product.isPublic ? "Público" : "Privado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageAddons(product)}
                          title="Gerenciar Adicionais"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Gerenciamento de Adicionais Melhorado */}
      <Dialog open={isAddonDialogOpen} onOpenChange={setIsAddonDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Adicionais - {selectedProductForAddons?.name}
            </DialogTitle>
            <DialogDescription>
              Gerencie grupos de adicionais e seus itens de forma simples e intuitiva
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[70vh]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="groups">Grupos Existentes</TabsTrigger>
              <TabsTrigger value="create">Criar Novo Grupo</TabsTrigger>
              <TabsTrigger value="edit-group" disabled={!editingGroup}>Editar Grupo</TabsTrigger>
              <TabsTrigger value="copy">Copiar Grupos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups" className="h-full overflow-y-auto">
              <div className="space-y-4">
                {addonGroups.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum grupo de adicionais</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie o primeiro grupo de adicionais para este produto
                      </p>
                      <Button onClick={() => setActiveTab("create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Grupo
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  addonGroups.map((group: any) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">{group.name}</CardTitle>
                            {group.description && (
                              <CardDescription>{group.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={group.isRequired ? "default" : "secondary"}>
                              {group.isRequired ? "Obrigatório" : "Opcional"}
                            </Badge>
                            <Badge variant="outline">
                              Máx: {group.maxSelections}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingGroup(group);
                                setGroupForm({
                                  name: group.name,
                                  description: group.description || "",
                                  isRequired: group.isRequired,
                                  allowMultiple: group.allowMultiple,
                                  maxSelections: group.maxSelections?.toString() || ""
                                });
                                setEditingAddons(group.addons.map((addon: any) => ({
                                  id: addon.id,
                                  name: addon.name,
                                  description: addon.description || "",
                                  price: addon.price,
                                  isNew: false
                                })));
                                setActiveTab("edit-group");
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteGroupMutation.mutate(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {group.addons && group.addons.length > 0 && (
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.addons.map((addon: any) => (
                              <div key={addon.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                <div>
                                  <span className="font-medium">{addon.name}</span>
                                  {addon.description && (
                                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                                  )}
                                </div>
                                <span className="font-semibold text-green-600">+R$ {addon.price}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="h-full overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Grupo de Adicionais</CardTitle>
                  <CardDescription>Configure o grupo e adicione múltiplos itens de uma vez</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Configurações do Grupo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="group-name">Nome do Grupo *</Label>
                      <Input
                        id="group-name"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Proteínas Extras"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group-max">Máximo de Seleções</Label>
                      <Input
                        id="group-max"
                        type="number"
                        value={groupForm.maxSelections}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, maxSelections: parseInt(e.target.value) || 1 }))}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="group-description">Descrição</Label>
                    <Textarea
                      id="group-description"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do grupo de adicionais"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="group-required"
                      checked={groupForm.isRequired}
                      onCheckedChange={(checked) => setGroupForm(prev => ({ ...prev, isRequired: checked }))}
                    />
                    <Label htmlFor="group-required">Seleção obrigatória</Label>
                  </div>

                  <Separator />

                  {/* Adicionais */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Itens do Grupo</h3>
                      <Button type="button" onClick={handleAddNewAddon} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {newAddons.map((addon, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                          <div>
                            <Label>Nome *</Label>
                            <Input
                              value={addon.name}
                              onChange={(e) => handleUpdateAddon(index, "name", e.target.value)}
                              placeholder="Ex: Bacon"
                            />
                          </div>
                          <div>
                            <Label>Preço *</Label>
                            <Input
                              value={addon.price}
                              onChange={(e) => handleUpdateAddon(index, "price", e.target.value)}
                              placeholder="5,00"
                            />
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Input
                              value={addon.description}
                              onChange={(e) => handleUpdateAddon(index, "description", e.target.value)}
                              placeholder="Opcional"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAddon(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {newAddons.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum item adicionado ainda.</p>
                        <p>Clique em "Adicionar Item" para começar.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("groups")}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateGroupWithAddons} 
                      disabled={createGroupWithAddonsMutation.isPending || !groupForm.name}
                    >
                      {createGroupWithAddonsMutation.isPending ? "Criando..." : "Criar Grupo"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit-group" className="h-full overflow-y-auto">
              {editingGroup && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Grupo: {editingGroup.name}</CardTitle>
                    <CardDescription>
                      Modifique as configurações do grupo e seus itens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Formulário do Grupo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="group-name">Nome do Grupo *</Label>
                        <Input
                          id="group-name"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                          placeholder="Ex: Escolha o sabor"
                        />
                      </div>
                      <div>
                        <Label htmlFor="group-description">Descrição</Label>
                        <Input
                          id="group-description"
                          value={groupForm.description}
                          onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                          placeholder="Descrição opcional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-required"
                          checked={groupForm.isRequired}
                          onCheckedChange={(checked) => setGroupForm({...groupForm, isRequired: !!checked})}
                        />
                        <Label htmlFor="edit-required">Obrigatório</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-multiple"
                          checked={groupForm.allowMultiple}
                          onCheckedChange={(checked) => setGroupForm({...groupForm, allowMultiple: !!checked})}
                        />
                        <Label htmlFor="edit-multiple">Múltipla seleção</Label>
                      </div>
                      <div>
                        <Label htmlFor="edit-max-selections">Máx. seleções</Label>
                        <Input
                          id="edit-max-selections"
                          type="number"
                          min="1"
                          value={groupForm.maxSelections}
                          onChange={(e) => setGroupForm({...groupForm, maxSelections: e.target.value})}
                          placeholder="Ex: 2"
                        />
                      </div>
                    </div>

                    {/* Lista de Adicionais para Edição */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-base font-semibold">Itens do Grupo</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAddons([...editingAddons, {name: "", price: "", description: "", isNew: true}])}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {editingAddons.map((addon, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-end p-3 border rounded-lg">
                            <div>
                              <Label>Nome *</Label>
                              <Input
                                value={addon.name}
                                onChange={(e) => {
                                  const updated = [...editingAddons];
                                  updated[index] = {...updated[index], name: e.target.value};
                                  setEditingAddons(updated);
                                }}
                                placeholder="Ex: Calabresa"
                              />
                            </div>
                            <div>
                              <Label>Preço</Label>
                              <Input
                                value={addon.price}
                                onChange={(e) => {
                                  const updated = [...editingAddons];
                                  updated[index] = {...updated[index], price: e.target.value};
                                  setEditingAddons(updated);
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label>Descrição</Label>
                              <Input
                                value={addon.description}
                                onChange={(e) => {
                                  const updated = [...editingAddons];
                                  updated[index] = {...updated[index], description: e.target.value};
                                  setEditingAddons(updated);
                                }}
                                placeholder="Opcional"
                              />
                            </div>
                            <div className="flex gap-1">
                              {addon.id && !addon.isNew && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    deleteAddonMutation.mutate(addon.id!);
                                    setEditingAddons(editingAddons.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAddons(editingAddons.filter((_, i) => i !== index))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {editingAddons.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Nenhum item no grupo.</p>
                          <p>Clique em "Adicionar Item" para adicionar novos itens.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setActiveTab("groups");
                        setEditingGroup(null);
                        setEditingAddons([]);
                      }}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => editGroupMutation.mutate({group: groupForm, addons: editingAddons})}
                        disabled={editGroupMutation.isPending || !groupForm.name}
                      >
                        {editGroupMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="copy" className="h-full overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Copiar Grupos para Outros Produtos</CardTitle>
                  <CardDescription>Selecione um grupo para copiar e o produto de destino</CardDescription>
                </CardHeader>
                <CardContent>
                  {addonGroups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum grupo disponível para copiar.</p>
                      <p>Crie grupos primeiro na aba "Criar Novo Grupo".</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addonGroups.map((group: any) => (
                        <Card key={group.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{group.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {group.addons?.length || 0} itens
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Select onValueChange={(productId) => handleCopyGroup(group.id, parseInt(productId))}>
                                <SelectTrigger className="w-64">
                                  <SelectValue placeholder="Selecionar produto destino" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products
                                    .filter((p: any) => p.id !== selectedProductForAddons?.id)
                                    .map((product: any) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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