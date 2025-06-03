import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, Trash2, CreditCard, Clock, UtensilsCrossed, Phone, User, Truck, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  isAvailable: boolean;
  sectionId: number;
}

interface Section {
  id: number;
  name: string;
}

export default function PDV() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("balcao"); // balcao, entrega
  const [paymentMethod, setPaymentMethod] = useState("dinheiro"); // dinheiro, cartao, pix
  const [activeSection, setActiveSection] = useState<string>("all");

  // Buscar a loja do usuário logado (apenas para managers)
  const { data: userStore, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
    enabled: !!user?.id && user?.role === 'manager'
  });

  // Determinar o storeId baseado no role do usuário
  let storeId: string;
  if (user?.role === 'manager') {
    if (storeLoading) {
      storeId = ""; // Aguardar carregamento
    } else if (userStore && (userStore as any)?.id) {
      storeId = String((userStore as any).id);
    } else {
      // Manager sem loja atribuída - mostrar erro
      storeId = "";
    }
  } else {
    // Super admin e owners podem usar loja padrão 11
    storeId = "11";
  }
  
  const { data: menuSections = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-sections`],
    enabled: !!storeId
  });

  const { data: menuProducts = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/menu-products`],
    enabled: !!storeId
  });

  const filteredProducts = searchQuery 
    ? (menuProducts as Product[]).filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (menuProducts as Product[]);

  const productsBySection = (menuSections as Section[]).map((section) => ({
    ...section,
    products: (menuProducts as Product[]).filter((product) => product.sectionId === section.id)
  }));

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;

  const addToCart = (product: Product) => {
    const price = product.originalPrice && parseFloat(product.originalPrice) < parseFloat(product.price) 
      ? parseFloat(product.originalPrice) 
      : parseFloat(product.price);

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * price }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price,
          quantity: 1,
          subtotal: price
        }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const finalizePurchase = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pedido finalizado!",
      description: `Pedido de ${customerName || 'Cliente'} no valor de R$ ${total.toFixed(2).replace('.', ',')}`,
    });

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryType("balcao");
    setPaymentMethod("dinheiro");
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const displayPrice = product.originalPrice && parseFloat(product.originalPrice) < parseFloat(product.price)
      ? parseFloat(product.originalPrice)
      : parseFloat(product.price);

    const originalPrice = product.originalPrice && parseFloat(product.originalPrice) !== parseFloat(product.price)
      ? Math.max(parseFloat(product.originalPrice), parseFloat(product.price))
      : null;

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(product)}>
        <CardContent className="p-1.5">
          <div className="w-full h-20 bg-gray-100 rounded-md mb-1.5 overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            )}
          </div>

          <h4 className="font-medium text-xs mb-0.5 line-clamp-2 leading-tight">{product.name}</h4>
          {product.description && (
            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{product.description}</p>
          )}

          <div className="flex items-center gap-1">
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                R$ {originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="font-bold text-xs text-green-600">
              R$ {displayPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {!product.isAvailable && (
            <Badge variant="secondary" className="mt-1 text-xs">
              Indisponível
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedidos Balcão (PDV)</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {searchQuery ? (
            <ScrollArea className="h-full">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Resultados para "{searchQuery}" ({filteredProducts.length})
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <div className="border-b border-gray-200 bg-white px-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {(menuSections as Section[]).slice(0, 4).map((section) => (
                    <TabsTrigger key={section.id} value={section.id.toString()}>
                      {section.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <ScrollArea className="h-full">
                <TabsContent value="all" className="p-4 mt-0">
                  <div className="space-y-6">
                    {productsBySection.map((section) => (
                      <div key={section.id}>
                        <h3 className="text-lg font-semibold mb-3">{section.name}</h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {section.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {(menuSections as Section[]).map((section) => (
                  <TabsContent key={section.id} value={section.id.toString()} className="p-4 mt-0">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {productsBySection
                        .find((s) => s.id === section.id)
                        ?.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Novo Pedido</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Adicione produtos ao pedido</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Totais */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Entrega:</span>
              <span className="text-blue-600">Grátis</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Campos do cliente */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="(XX) X XXXX-XXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome do cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="w-full">
                  <Truck className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">[ E ] Entrega</SelectItem>
                  <SelectItem value="balcao">[ B ] Balcão</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">[ R ] Pagamentos</SelectItem>
                  <SelectItem value="ajustar">[ Y ] Ajustar valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={finalizePurchase}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={cart.length === 0}
          >
            [ ENTER ] Gerar pedido
          </Button>
        </div>
      </div>
    </div>
  );
}