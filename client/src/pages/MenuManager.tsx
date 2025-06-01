import { useState } from "react";
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
import { Globe, Search, Eye, EyeOff, Plus, Edit, Trash2, UtensilsCrossed, DollarSign } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MenuManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    available: true,
    availableOnDigitalMenu: true
  });

  // Buscar itens do cardápio
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["/api/menu-items"],
  });

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Mutation para atualizar disponibilidade no cardápio digital
  const updateDigitalMenuMutation = useMutation({
    mutationFn: async ({ itemId, available }: { itemId: number; available: boolean }) => {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableOnDigitalMenu: available,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Sucesso",
        description: "Disponibilidade atualizada no cardápio digital",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar disponibilidade",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar/editar item
  const itemMutation = useMutation({
    mutationFn: async (data: typeof itemForm) => {
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categoryId: parseInt(data.categoryId),
          price: data.price
        })
      });
      
      if (!response.ok) throw new Error('Erro ao salvar item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: editingItem ? "Item atualizado!" : "Item criado!"
      });
      setIsItemDialogOpen(false);
      setEditingItem(null);
      setItemForm({
        name: "", description: "", price: "", categoryId: "", 
        imageUrl: "", available: true, availableOnDigitalMenu: true
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar item",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar item');
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Item deletado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    }
  });

  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                          (item.category && item.category.id.toString() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleToggleDigitalMenu = (itemId: number, currentStatus: boolean) => {
    updateDigitalMenuMutation.mutate({
      itemId,
      available: !currentStatus,
    });
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      categoryId: item.categoryId?.toString() || "",
      imageUrl: item.imageUrl || "",
      available: item.available ?? true,
      availableOnDigitalMenu: item.availableOnDigitalMenu ?? true
    });
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) {
      toast({
        title: "Erro",
        description: "Nome, preço e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    itemMutation.mutate(itemForm);
  };

  const digitalMenuItems = menuItems.filter((item: any) => item.availableOnDigitalMenu);
  const totalItems = menuItems.length;

  if (isLoading) {
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
          <p className="text-gray-600">Gerencie todos os aspectos do seu cardápio em um só lugar</p>
        </div>
        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item" : "Novo Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Edite os dados do item" : "Adicione um novo item ao cardápio"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item-name">Nome do Item *</Label>
                <Input
                  id="item-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Hambúrguer Artesanal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-description">Descrição</Label>
                <Textarea
                  id="item-description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do item"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-price">Preço *</Label>
                <Input
                  id="item-price"
                  value={itemForm.price}
                  onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="29,90"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-category">Categoria *</Label>
                <Select value={itemForm.categoryId} onValueChange={(value) => setItemForm(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-image">URL da Imagem</Label>
                <Input
                  id="item-image"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="item-available"
                  checked={itemForm.available}
                  onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, available: checked }))}
                />
                <Label htmlFor="item-available">Disponível no sistema</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="item-digital"
                  checked={itemForm.availableOnDigitalMenu}
                  onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, availableOnDigitalMenu: checked }))}
                />
                <Label htmlFor="item-digital">Visível no cardápio público</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveItem} disabled={itemMutation.isPending}>
                {itemMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <UtensilsCrossed className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Itens</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visíveis ao Público</p>
              <p className="text-2xl font-bold text-gray-900">{digitalMenuItems.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <EyeOff className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Itens Ocultos</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems - digitalMenuItems.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalItems > 0 ? 
                  (menuItems.reduce((acc: number, item: any) => acc + parseFloat(item.price?.replace(',', '.') || '0'), 0) / totalItems).toFixed(2).replace('.', ',') 
                  : '0,00'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item: any) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video relative bg-gray-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {item.availableOnDigitalMenu && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Globe className="w-3 h-3 mr-1" />
                    Público
                  </Badge>
                )}
                {!item.available && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Indisponível
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-green-600">R$ {item.price}</span>
              </div>
              
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              
              {item.category && (
                <Badge variant="outline" className="mb-3">
                  {item.category.name}
                </Badge>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={item.availableOnDigitalMenu}
                    onCheckedChange={() => handleToggleDigitalMenu(item.id, item.availableOnDigitalMenu)}
                    disabled={updateDigitalMenuMutation.isPending}
                  />
                  <Label className="text-sm">
                    {item.availableOnDigitalMenu ? "Público" : "Privado"}
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    disabled={deleteItemMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca" 
              : "Adicione o primeiro item ao seu cardápio"}
          </p>
        </div>
      )}
    </div>
  );
}