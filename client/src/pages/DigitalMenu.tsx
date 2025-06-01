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

// Dados mockados para demonstração
const storeData = {
  id: 1,
  name: "FastFood Shopping Morumbi",
  description: "Os melhores hambúrguers artesanais da região",
  address: "Shopping Morumbi, Piso L3, Loja 312",
  phone: "(11) 3025-4890",
  deliveryFee: "R$ 5,90",
  minimumOrder: "R$ 25,00",
  estimatedDeliveryTime: "25-35 min",
  rating: 4.8,
  bannerUrl: "/api/placeholder/store-banner.jpg",
  logoUrl: "/api/placeholder/store-logo.jpg",
  sections: [
    {
      id: 1,
      name: "Hambúrguers",
      description: "Nossos hambúrguers artesanais",
      products: [
        {
          id: 1,
          name: "Big Burger Clássico",
          description: "Hambúrguer de 150g, queijo, alface, tomate, cebola e molho especial",
          price: "24.90",
          imageUrl: "/api/placeholder/burger-classic.jpg",
          preparationTime: "15-20 min",
          isAvailable: true,
          calories: 650,
          tags: ["Mais Vendido"]
        },
        {
          id: 2,
          name: "Cheese Bacon Burger",
          description: "Hambúrguer de 150g, queijo cheddar, bacon crocante, alface e molho barbecue",
          price: "28.90",
          imageUrl: "/api/placeholder/cheese-bacon.jpg",
          preparationTime: "15-20 min",
          isAvailable: true,
          calories: 780
        },
        {
          id: 3,
          name: "Veggie Burger",
          description: "Hambúrguer vegetal, queijo vegano, alface, tomate, cebola roxa e molho de ervas",
          price: "22.90",
          imageUrl: "/api/placeholder/veggie-burger.jpg",
          preparationTime: "12-15 min",
          isAvailable: true,
          calories: 420,
          tags: ["Vegetariano"]
        }
      ]
    },
    {
      id: 2,
      name: "Batatas",
      description: "Acompanhamentos crocantes",
      products: [
        {
          id: 4,
          name: "Batata Frita Tradicional",
          description: "Porção individual de batatas fritas crocantes",
          price: "12.90",
          preparationTime: "8-10 min",
          isAvailable: true,
          calories: 350
        },
        {
          id: 5,
          name: "Batata com Cheddar e Bacon",
          description: "Batatas fritas cobertas com molho cheddar e bacon",
          price: "18.90",
          preparationTime: "10-12 min",
          isAvailable: true,
          calories: 520
        }
      ]
    },
    {
      id: 3,
      name: "Bebidas",
      description: "Refrigerantes e sucos naturais",
      products: [
        {
          id: 6,
          name: "Refrigerante Lata",
          description: "Coca-Cola, Pepsi, Guaraná ou Sprite",
          price: "4.90",
          preparationTime: "1-2 min",
          isAvailable: true,
          calories: 140
        },
        {
          id: 7,
          name: "Suco Natural Laranja",
          description: "Suco de laranja espremido na hora",
          price: "8.90",
          preparationTime: "3-5 min",
          isAvailable: true,
          calories: 110
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
  const [activeSection, setActiveSection] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      <div className="relative h-48 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-end p-4">
          <div className="flex items-end gap-4 text-white">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">FB</span>
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
                                  {product.tags.map((tag) => (
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
                        <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-orange-600 font-semibold text-xs">
                            Imagem
                          </div>
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
                  <span>R$ {(cartTotal + 5.90).toFixed(2)}</span>
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