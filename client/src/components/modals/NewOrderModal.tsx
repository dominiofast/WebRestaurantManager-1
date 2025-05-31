import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: Array<{
    id: number;
    name: string;
    price: string;
    description?: string;
    category: {
      name: string;
    };
  }>;
}

interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function NewOrderModal({ isOpen, onClose, menuItems }: NewOrderModalProps) {
  const [orderData, setOrderData] = useState({
    tableNumber: "",
    observations: "",
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
      handleClose();
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
        description: "Erro ao criar pedido.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOrderData({
      tableNumber: "",
      observations: "",
    });
    setOrderItems([]);
    onClose();
  };

  const addItemToOrder = (menuItem: any) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        quantity: 1,
      }]);
    }
  };

  const updateItemQuantity = (menuItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive",
      });
      return;
    }

    const items = orderItems.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
      subtotal: (item.price * item.quantity).toString(),
    }));

    const order = {
      tableNumber: orderData.tableNumber ? parseInt(orderData.tableNumber) : null,
      observations: orderData.observations,
      totalAmount: getTotalAmount().toString(),
      status: "received",
    };

    createOrderMutation.mutate({ order, items });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Crie um novo pedido selecionando itens do cardápio
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Informações do Pedido</h3>
              
              <div>
                <Label htmlFor="tableNumber">Número da Mesa</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={orderData.tableNumber}
                  onChange={(e) => setOrderData({ ...orderData, tableNumber: e.target.value })}
                  placeholder="Ex: 5"
                />
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={orderData.observations}
                  onChange={(e) => setOrderData({ ...orderData, observations: e.target.value })}
                  placeholder="Observações especiais do pedido..."
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Resumo do Pedido</h4>
                  {orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total:</span>
                        <span className="text-coral text-lg">
                          R$ {getTotalAmount().toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum item adicionado</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Selecionar Itens</h3>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {menuItems.map((menuItem) => {
                  const orderItem = orderItems.find(item => item.menuItemId === menuItem.id);
                  const quantity = orderItem?.quantity || 0;

                  return (
                    <Card key={menuItem.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{menuItem.name}</h4>
                            {menuItem.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {menuItem.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {menuItem.category.name}
                              </Badge>
                              <span className="font-semibold text-coral">
                                R$ {parseFloat(menuItem.price).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {quantity > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateItemQuantity(menuItem.id, quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {quantity > 0 && (
                              <span className="w-8 text-center text-sm font-medium">
                                {quantity}
                              </span>
                            )}
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => quantity > 0 
                                ? updateItemQuantity(menuItem.id, quantity + 1)
                                : addItemToOrder(menuItem)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="btn-coral"
              disabled={createOrderMutation.isPending || orderItems.length === 0}
            >
              {createOrderMutation.isPending ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
