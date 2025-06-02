import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

export default function AddonsModal({ isOpen, onClose, productId, productName }: AddonsModalProps) {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingAddon, setEditingAddon] = useState<any>(null);

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    isRequired: false,
    minSelection: 0,
    maxSelection: 1
  });

  const [addonForm, setAddonForm] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true
  });

  // Fetch addon groups for this product
  const { data: addonGroups = [], refetch } = useQuery({
    queryKey: [`/api/products/${productId}/addons`],
    enabled: isOpen && !!productId
  });

  // Create/Update addon group
  const groupMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingGroup 
        ? `/api/addon-groups/${editingGroup.id}`
        : `/api/addon-groups`;
      
      const payload = editingGroup 
        ? data 
        : { ...data, productId };

      const response = await fetch(url, {
        method: editingGroup ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar grupo');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Sucesso", description: "Grupo de adicionais salvo!" });
      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupForm({ name: "", description: "", isRequired: false, minSelection: 0, maxSelection: 1 });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao salvar grupo", variant: "destructive" });
    }
  });

  // Create/Update addon
  const addonMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingAddon 
        ? `/api/addons/${editingAddon.id}`
        : `/api/addons`;
      
      const payload = editingAddon 
        ? data 
        : { ...data, groupId: selectedGroup.id };

      const response = await fetch(url, {
        method: editingAddon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar adicional');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Sucesso", description: "Adicional salvo!" });
      setShowAddonForm(false);
      setEditingAddon(null);
      setAddonForm({ name: "", description: "", price: "", isAvailable: true });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao salvar adicional", variant: "destructive" });
    }
  });

  // Delete addon group
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/addon-groups/${groupId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao excluir grupo');
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Sucesso", description: "Grupo excluído!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir grupo", variant: "destructive" });
    }
  });

  // Delete addon
  const deleteAddonMutation = useMutation({
    mutationFn: async (addonId: number) => {
      const response = await fetch(`/api/addons/${addonId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao excluir adicional');
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Sucesso", description: "Adicional excluído!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir adicional", variant: "destructive" });
    }
  });

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", description: "", isRequired: false, minSelection: 0, maxSelection: 1 });
    setShowGroupForm(true);
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      isRequired: group.isRequired,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection
    });
    setShowGroupForm(true);
  };

  const handleCreateAddon = (group: any) => {
    setSelectedGroup(group);
    setEditingAddon(null);
    setAddonForm({ name: "", description: "", price: "", isAvailable: true });
    setShowAddonForm(true);
  };

  const handleEditAddon = (addon: any, group: any) => {
    setSelectedGroup(group);
    setEditingAddon(addon);
    setAddonForm({
      name: addon.name,
      description: addon.description || "",
      price: addon.price,
      isAvailable: addon.isAvailable
    });
    setShowAddonForm(true);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    groupMutation.mutate(groupForm);
  };

  const handleAddonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonForm.name || !addonForm.price) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios", variant: "destructive" });
      return;
    }
    addonMutation.mutate(addonForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Adicionais - {productName}</DialogTitle>
          <DialogDescription>
            Configure grupos de adicionais e opções para este produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Group Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Grupos de Adicionais</h3>
            <Button onClick={handleCreateGroup}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </div>

          {/* Group Form */}
          {showGroupForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingGroup ? "Editar Grupo" : "Novo Grupo"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGroupSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Grupo *</Label>
                      <Input
                        value={groupForm.name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Tamanho da Pizza"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={groupForm.description}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição opcional"
                      />
                    </div>
                    <div>
                      <Label>Seleção Mínima</Label>
                      <Input
                        type="number"
                        min="0"
                        value={groupForm.minSelection}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, minSelection: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Seleção Máxima</Label>
                      <Input
                        type="number"
                        min="1"
                        value={groupForm.maxSelection}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, maxSelection: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={groupForm.isRequired}
                      onCheckedChange={(checked) => setGroupForm(prev => ({ ...prev, isRequired: checked }))}
                    />
                    <Label>Obrigatório</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={groupMutation.isPending}>
                      {groupMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowGroupForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Addon Form */}
          {showAddonForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingAddon ? "Editar Adicional" : "Novo Adicional"} - {selectedGroup?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddonSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        value={addonForm.name}
                        onChange={(e) => setAddonForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Grande"
                      />
                    </div>
                    <div>
                      <Label>Preço *</Label>
                      <Input
                        value={addonForm.price}
                        onChange={(e) => setAddonForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Ex: 5.00"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={addonForm.description}
                        onChange={(e) => setAddonForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição opcional"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={addonForm.isAvailable}
                      onCheckedChange={(checked) => setAddonForm(prev => ({ ...prev, isAvailable: checked }))}
                    />
                    <Label>Disponível</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addonMutation.isPending}>
                      {addonMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddonForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Addon Groups List */}
          <div className="space-y-4">
            {addonGroups.map((group: any) => (
              <Card key={group.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.description && <p className="text-sm text-gray-600">{group.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {group.isRequired && <Badge variant="destructive">Obrigatório</Badge>}
                      <Badge variant="outline">
                        {group.minSelection}-{group.maxSelection} seleções
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditGroup(group)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteGroupMutation.mutate(group.id)}
                        disabled={deleteGroupMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Adicionais</h4>
                    <Button variant="outline" size="sm" onClick={() => handleCreateAddon(group)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {group.addons && group.addons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.addons.map((addon: any) => (
                        <div key={addon.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <span className="font-medium">{addon.name}</span>
                            <span className="text-green-600 ml-2">+R$ {addon.price}</span>
                            {!addon.isAvailable && <Badge variant="secondary" className="ml-2">Indisponível</Badge>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditAddon(addon, group)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteAddonMutation.mutate(addon.id)}
                              disabled={deleteAddonMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum adicional cadastrado</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {addonGroups.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900">Nenhum grupo de adicionais</h3>
              <p className="text-gray-500">Crie grupos para organizar os adicionais deste produto</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}