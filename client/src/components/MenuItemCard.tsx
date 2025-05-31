import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl?: string;
    category: {
      name: string;
    };
    available: boolean;
  };
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export default function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      onDelete(item.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-video w-full">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
          <span className="text-lg font-bold text-coral">
            R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        {item.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {item.category.name}
            </Badge>
            {!item.available && (
              <Badge variant="destructive" className="text-xs">
                Indisponível
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
