import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Store, Building2, Edit, Trash2, Phone, Mail, MapPin, Users, ExternalLink, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function StoreManagement() {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingStore, setEditingStore] = useState<any>(null);
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    status: "active"
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    companyId: "",
    address: "",
    phone: "",
    email: "",
    status: "active"
  });

  const { toast } = useToast();

  // Buscar todas as empresas
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: async () => {
      const res = await fetch('/api/admin/companies');
      if (!res.ok) throw new Error('Erro ao buscar empresas');
      return res.json();
    }
  });

  // Buscar todas as lojas
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['/api/admin/stores'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stores');
      if (!res.ok) throw new Error('Erro ao buscar lojas');
      return res.json();
    }
  });

  // Mutação para criar/editar empresa
  const companyMutation = useMutation({
    mutationFn: async (data: typeof companyForm) => {
      const url = editingCompany ? `/api/admin/companies/${editingCompany.id}` : '/api/admin/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar empresa');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: editingCompany ? "Empresa atualizada!" : "Empresa criada!"
      });
      setIsCompanyDialogOpen(false);
      setEditingCompany(null);
      setCompanyForm({ name: "", description: "", email: "", phone: "", address: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar empresa",
        variant: "destructive"
      });
    }
  });

  // Mutação para criar/editar loja
  const storeMutation = useMutation({
    mutationFn: async (data: typeof storeForm) => {
      const url = editingStore ? `/api/admin/stores/${editingStore.id}` : '/api/admin/stores';
      const method = editingStore ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId: parseInt(data.companyId) })
      });
      
      if (!response.ok) throw new Error('Erro ao salvar loja');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: editingStore ? "Loja atualizada!" : "Loja criada!"
      });
      setIsStoreDialogOpen(false);
      setEditingStore(null);
      setStoreForm({ name: "", companyId: "", address: "", phone: "", email: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stores'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar loja",
        variant: "destructive"
      });
    }
  });

  // Mutação para deletar empresa
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar empresa');
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Empresa deletada!" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stores'] });
    }
  });

  // Mutação para deletar loja
  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/stores/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar loja');
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Loja deletada!" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stores'] });
    }
  });

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name || "",
      description: company.description || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      status: company.status || "active"
    });
    setIsCompanyDialogOpen(true);
  };

  const handleEditStore = (store: any) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name || "",
      companyId: store.companyId?.toString() || "",
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      status: store.status || "active"
    });
    setIsStoreDialogOpen(true);
  };

  const handleSaveCompany = () => {
    if (!companyForm.name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return;
    }
    companyMutation.mutate(companyForm);
  };

  const handleSaveStore = () => {
    if (!storeForm.name || !storeForm.companyId) {
      toast({
        title: "Erro",
        description: "Nome da loja e empresa são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    storeMutation.mutate(storeForm);
  };

  if (companiesLoading || storesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Lojas</h1>
          <p className="text-gray-600">Gerencie empresas e suas lojas</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter((store: any) => store.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Lojas/Empresa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.length > 0 ? (stores.length / companies.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Empresas e Lojas */}
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="stores">Lojas</TabsTrigger>
        </TabsList>

        {/* Tab de Empresas */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCompany ? "Editar Empresa" : "Nova Empresa"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCompany ? "Edite os dados da empresa" : "Cadastre uma nova empresa"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company-name">Nome da Empresa *</Label>
                    <Input
                      id="company-name"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Grupo Alimentar ABC"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company-description">Descrição</Label>
                    <Textarea
                      id="company-description"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição da empresa"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company-address">Endereço</Label>
                    <Textarea
                      id="company-address"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Endereço completo da empresa"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company-status">Status</Label>
                    <Select value={companyForm.status} onValueChange={(value) => setCompanyForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCompany} disabled={companyMutation.isPending}>
                    {companyMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lojas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company: any) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.email || '-'}</TableCell>
                      <TableCell>{company.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {stores.filter((store: any) => store.companyId === company.id).length}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCompany(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar esta empresa? Todas as lojas serão removidas também.')) {
                                deleteCompanyMutation.mutate(company.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {companies.length === 0 && (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Nenhuma empresa cadastrada
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando a primeira empresa.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Lojas */}
        <TabsContent value="stores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lojas Cadastradas</h2>
            <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={companies.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Loja
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingStore ? "Editar Loja" : "Nova Loja"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStore ? "Edite os dados da loja" : "Cadastre uma nova loja"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="store-company">Empresa *</Label>
                    <Select value={storeForm.companyId} onValueChange={(value) => setStoreForm(prev => ({ ...prev, companyId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-name">Nome da Loja *</Label>
                    <Input
                      id="store-name"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Loja Shopping Center"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-address">Endereço</Label>
                    <Textarea
                      id="store-address"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Endereço completo da loja"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-phone">Telefone</Label>
                    <Input
                      id="store-phone"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="loja@empresa.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-status">Status</Label>
                    <Select value={storeForm.status} onValueChange={(value) => setStoreForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsStoreDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveStore} disabled={storeMutation.isPending}>
                    {storeMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store: any) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>{store.company?.name || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{store.address || '-'}</TableCell>
                      <TableCell>{store.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                          {store.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/menu/${store.slug}`, '_blank')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStore(store)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar esta loja?')) {
                                deleteStoreMutation.mutate(store.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {stores.length === 0 && (
                <div className="text-center py-8">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Nenhuma loja cadastrada
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {companies.length === 0 
                      ? "Cadastre uma empresa primeiro para adicionar lojas."
                      : "Comece criando a primeira loja."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}