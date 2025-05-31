import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import MenuItemCard from "@/components/MenuItemCard";
import AddMenuItemModal from "@/components/modals/AddMenuItemModal";

export default function MenuManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu-items", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" ? "/api/menu-items" : `/api/menu-items?categoryId=${selectedCategory}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Sucesso",
        description: "Item removido do cardápio com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao remover item do cardápio.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems?.filter((item: any) => item.categoryId === parseInt(selectedCategory));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão do Cardápio</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os itens e categorias do seu cardápio
          </p>
        </div>
        <Button 
          onClick={() => setIsAddItemModalOpen(true)}
          className="btn-coral"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Category Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Categoria</CardTitle>
          <CardDescription>
            Selecione uma categoria para filtrar os itens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {categories?.map((category: any) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems?.map((item: any) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onDelete={(id) => deleteMenuItemMutation.mutate(id)}
            onEdit={(item) => {
              // TODO: Implement edit functionality
              console.log("Edit item:", item);
            }}
          />
        )) || (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {selectedCategory === "all" 
                ? "Nenhum item encontrado no cardápio" 
                : "Nenhum item encontrado nesta categoria"}
            </p>
          </div>
        )}
      </div>

      <AddMenuItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        categories={categories || []}
      />
    </div>
  );
}
