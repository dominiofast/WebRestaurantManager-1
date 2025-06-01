import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Globe, Search, Eye, EyeOff, ExternalLink } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DigitalMenuManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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
        description: "Disponibilidade do item atualizada no cardápio digital",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar disponibilidade do item",
        variant: "destructive",
      });
    },
  });

  const filteredItems = menuItems.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleDigitalMenu = (itemId: number, currentStatus: boolean) => {
    updateDigitalMenuMutation.mutate({
      itemId,
      available: !currentStatus,
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cardápio Digital</h1>
          <p className="text-gray-600">
            Gerencie quais produtos aparecem no cardápio público para clientes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open("/menu/hamburgueria-premium-augusta", "_blank")}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Cardápio Público
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Itens no Cardápio Digital</p>
              <p className="text-2xl font-bold text-gray-900">{digitalMenuItems.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
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
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Produtos</CardTitle>
          <CardDescription>
            Use o switch para controlar quais produtos aparecem no cardápio digital público
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-4">
        {filteredItems.map((item: any) => {
          const category = categories.find((cat: any) => cat.id === item.categoryId);
          
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.imageUrl && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEw0MCA0MEwyNCA0MFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMjgiIGN5PSIyOCIgcj0iMiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {category && (
                          <Badge variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                        {!item.available && (
                          <Badge variant="destructive" className="text-xs">
                            Indisponível
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`digital-menu-${item.id}`} className="text-sm font-medium">
                        {item.availableOnDigitalMenu ? "Visível" : "Oculto"}
                      </Label>
                      <Switch
                        id={`digital-menu-${item.id}`}
                        checked={item.availableOnDigitalMenu}
                        onCheckedChange={() => handleToggleDigitalMenu(item.id, item.availableOnDigitalMenu)}
                        disabled={updateDigitalMenuMutation.isPending}
                      />
                    </div>
                    
                    {item.availableOnDigitalMenu && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Globe className="w-3 h-3 mr-1" />
                        Público
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              {searchTerm ? "Nenhum produto encontrado com esse termo" : "Nenhum produto cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}