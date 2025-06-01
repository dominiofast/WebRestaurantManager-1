import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  MapPin, 
  Phone,
  Star,
  Heart,
  Share2
} from "lucide-react";

// Dados da Hamburgueria Premium - Augusta criada no banco
const hamburgueriaData = {
  id: 10,
  name: "Hamburgueria Premium - Augusta",
  description: "Hambúrguers gourmet artesanais com ingredientes premium",
  address: "Rua Augusta, 1234 - Consolação, São Paulo - SP",
  phone: "(11) 99887-7766",
  deliveryFee: "R$ 6,90",
  minimumOrder: "R$ 30,00",
  estimatedDeliveryTime: "20-30 min",
  rating: 4.9,
  bannerUrl: "/api/placeholder/store-banner.jpg",
  logoUrl: "/api/placeholder/store-logo.jpg",
  sections: [
    {
      id: 13,
      name: "Hambúrguers Gourmet",
      description: "Nossos hambúrguers artesanais com ingredientes premium",
      products: [
        {
          id: 19,
          name: "Prime Burger",
          description: "Hambúrguer de carne Angus 180g, queijo gruyère, cogumelos shiitake, rúcula e molho trufado",
          price: "38.90",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
          preparationTime: "25-30 min",
          isAvailable: true,
          calories: 750,
          tags: ["Premium", "Mais Vendido"]
        },
        {
          id: 20,
          name: "Truffle Deluxe",
          description: "Blend de carnes nobres 200g, queijo brie, bacon artesanal, cebola caramelizada e molho de trufa negra",
          price: "45.90",
          imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
          preparationTime: "30-35 min",
          isAvailable: true,
          calories: 890,
          tags: ["Especial"]
        },
        {
          id: 21,
          name: "Smokehouse BBQ",
          description: "Carne defumada 180g, queijo cheddar aged, onion rings, pickles e molho BBQ artesanal",
          price: "34.90",
          imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
          preparationTime: "25-30 min",
          isAvailable: true,
          calories: 820
        },
        {
          id: 22,
          name: "Mediterranean Lamb",
          description: "Hambúrguer de cordeiro 160g, queijo feta, tomate seco, azeitonas e molho tzatziki",
          price: "42.90",
          imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
          preparationTime: "25-30 min",
          isAvailable: true,
          calories: 680
        }
      ]
    },
    {
      id: 14,
      name: "Acompanhamentos",
      description: "Batatas especiais e aperitivos",
      products: [
        {
          id: 23,
          name: "Batata Rústica Trufada",
          description: "Batatas rústicas com molho de trufa branca e queijo parmesão",
          price: "18.90",
          imageUrl: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400",
          preparationTime: "15-20 min",
          isAvailable: true,
          calories: 420
        },
        {
          id: 24,
          name: "Onion Rings Premium",
          description: "Anéis de cebola empanados artesanalmente com molho chipotle",
          price: "16.90",
          imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
          preparationTime: "12-15 min",
          isAvailable: true,
          calories: 380
        }
      ]
    },
    {
      id: 15,
      name: "Bebidas",
      description: "Refrigerantes, sucos e drinks",
      products: [
        {
          id: 27,
          name: "Suco Natural Detox",
          description: "Suco de couve, maçã verde, limão e gengibre",
          price: "12.90",
          imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400",
          preparationTime: "5-8 min",
          isAvailable: true,
          calories: 80
        },
        {
          id: 29,
          name: "Cerveja Artesanal IPA",
          description: "Cerveja artesanal local 350ml",
          price: "14.90",
          imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400",
          preparationTime: "2-3 min",
          isAvailable: true,
          calories: 180
        }
      ]
    },
    {
      id: 16,
      name: "Sobremesas",
      description: "Doces e sorvetes artesanais",
      products: [
        {
          id: 31,
          name: "Brownie com Sorvete",
          description: "Brownie de chocolate belga com sorvete de baunilha e calda quente",
          price: "16.90",
          imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
          preparationTime: "8-10 min",
          isAvailable: true,
          calories: 520
        }
      ]
    }
  ]
};

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function DigitalMenu() {
  const [match, params] = useRoute("/menu/:storeSlug");
  const [activeSection, setActiveSection] = useState(13);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeData, setStoreData] = useState(hamburgueriaData);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        subtotal: parseFloat(product.price)
      }]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.subtotal, 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (!match) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com banner da loja */}
      <div className="relative h-48 bg-gradient-to-r from-orange-600 to-red-700">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-end p-4">
          <div className="flex items-end gap-4 text-white">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">HP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{storeData.name}</h1>
              <p className="text-orange-100">{storeData.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{storeData.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{storeData.estimatedDeliveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Taxa: {storeData.deliveryFee}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Informações da loja */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{storeData.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{storeData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Pedido mínimo: {storeData.minimumOrder}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-6 p-4">
        {/* Navegação das seções */}
        <div className="w-64 space-y-2">
          <div className="bg-white rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold mb-3">Categorias</h3>
            {storeData.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? "bg-orange-100 text-orange-700 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Produtos */}
        <div className="flex-1">
          {storeData.sections.map((section) => (
            <div key={section.id} className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{section.name}</h2>
                <p className="text-gray-600">{section.description}</p>
              </div>
              
              <div className="grid gap-4">
                {section.products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="flex-1 p-4">
                        <CardHeader className="p-0 mb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              {product.tags && (
                                <div className="flex gap-1 mt-1">
                                  {product.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                R$ {product.price}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {product.preparationTime}
                            </span>
                            <span>{product.calories} cal</span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="p-0 mt-3">
                          <Button 
                            onClick={() => addToCart(product)}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            disabled={!product.isAvailable}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </CardFooter>
                      </div>
                      
                      {product.imageUrl && (
                        <div className="w-32 h-32 bg-gray-200 flex-shrink-0 overflow-hidden rounded-lg">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEw4MCA4MEw0OCA4MFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iNTYiIGN5PSI1NiIgcj0iNCIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrinho fixo */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full shadow-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                {cartItemCount} itens - R$ {cartTotal.toFixed(2)}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Seu Pedido</SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>{storeData.deliveryFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {(cartTotal + 6.90).toFixed(2)}</span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Finalizar Pedido
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}