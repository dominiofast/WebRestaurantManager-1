import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Eye, ArrowRight } from "lucide-react";

interface OrderCardProps {
  order: {
    id: number;
    tableNumber?: number;
    status: string;
    totalAmount: string;
    observations?: string;
    createdAt: string;
    items: Array<{
      id: number;
      quantity: number;
      unitPrice: string;
      subtotal: string;
      menuItem: {
        name: string;
      };
    }>;
  };
  onUpdateStatus: (id: number, currentStatus: string) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "received":
        return "default";
      case "preparing":
        return "secondary";
      case "ready":
        return "outline";
      case "delivered":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: "Recebido",
      preparing: "Em Preparo",
      ready: "Pronto",
      delivered: "Entregue"
    };
    return labels[status] || status;
  };

  const getNextStatusLabel = (status: string) => {
    const nextLabels: Record<string, string> = {
      received: "Iniciar Preparo",
      preparing: "Marcar como Pronto",
      ready: "Marcar como Entregue",
      delivered: "Finalizado"
    };
    return nextLabels[status] || "Atualizar";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canUpdateStatus = order.status !== "delivered";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Info */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Mesa:</span>
            <span className="font-medium">
              {order.tableNumber ? `Mesa ${order.tableNumber}` : "Balcão"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formatTime(order.createdAt)}</span>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Itens do Pedido</h4>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x</span>
                <span className="flex-1 mx-2 text-foreground">{item.menuItem.name}</span>
                <span className="font-medium">
                  R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        {order.observations && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Observações</h4>
              <p className="text-sm text-foreground">{order.observations}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Total and Actions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-coral">
              R$ {parseFloat(order.totalAmount).toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {canUpdateStatus && (
              <Button
                onClick={() => onUpdateStatus(order.id, order.status)}
                className="flex-1 btn-coral"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {getNextStatusLabel(order.status)}
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
