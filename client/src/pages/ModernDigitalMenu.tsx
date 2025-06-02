import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  MapPin, 
  Phone,
  Star,
  Search,
  Home,
  User,
  Heart
} from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  selectedAddons?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface StoreData {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  bannerUrl?: string;
  company: {
    name: string;
  };
  sections: Array<{
    id: number;
    name: string;
    description?: string;
    displayOrder: number;
    products: Array<{
      id: number;
      name: string;
      description?: string;
      price: string;
      originalPrice?: string;
      imageUrl?: string;
      isAvailable: boolean;
      isPromotion: boolean;
      displayOrder: number;
      tags?: string;
      addons?: Array<{
        id: number;
        name: string;
        description?: string;
        isRequired: boolean;
        maxSelections: number;
        addons: Array<{
          id: number;
          name: string;
          price: string;
          isAvailable: boolean;
        }>;
      }>;
    }>;
  }>;
}

export default function ModernDigitalMenu() {
  const [match, params] = useRoute("/menu/:storeSlug");
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch store data from API
  const { data: storeData, isLoading } = useQuery<StoreData>({
    queryKey: [`/api/menu/${params?.storeSlug}`],
    enabled: !!params?.storeSlug
  });

  useEffect(() => {
    if (storeData?.sections && storeData.sections.length > 0 && !activeSection) {
      // Set first section as active when data loads
      const firstSection = storeData.sections.sort((a, b) => a.displayOrder - b.displayOrder)[0];
      setActiveSection(firstSection.id);
    }
  }, [storeData, activeSection]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const featuredProducts = storeData.sections
    .flatMap(section => section.products)
    .filter(product => product.isPromotion || product.tags?.includes("Destaque"))
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 6);

  const filteredProducts = searchQuery 
    ? storeData.sections.flatMap(section => 
        section.products.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com banner e logo da loja */}
      <div className="relative">
        {/* Banner */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-orange-500 to-red-600 relative overflow-hidden">
          {storeData.bannerUrl && (
            <img 
              src={storeData.bannerUrl} 
              alt="Banner da loja"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        {/* Logo e informações da loja */}
        <div className="relative -mt-16 px-4 pb-4">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 border-4 border-white">
              {storeData.logoUrl ? (
                <img 
                  src={storeData.logoUrl} 
                  alt="Logo da loja"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-xl font-bold text-orange-600">
                  {storeData.name.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Informações */}
            <div className="flex-1 text-white">
              <h1 className="text-xl sm:text-2xl font-bold">{storeData.name}</h1>
              {storeData.description && (
                <p className="text-white/90 text-sm">{storeData.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>25-40 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de contato */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
          {storeData.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{storeData.address}</span>
            </div>
          )}
          {storeData.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{storeData.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="pb-20">
        {searchQuery ? (
          /* Resultados da busca */
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold mb-4">
              Resultados para "{searchQuery}" ({filteredProducts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Seção de destaques */}
            {featuredProducts.length > 0 && (
              <div className="px-4 py-6 bg-white border-b">
                <h2 className="text-xl font-bold mb-4">Destaques</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {featuredProducts.map((product) => (
                    <FeaturedProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Navegação de categorias */}
            <div className="bg-white border-b px-4 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {storeData.sections
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Produtos por seção */}
            <div className="px-4 py-6 space-y-8">
              {storeData.sections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((section) => (
                  <div key={section.id} id={`section-${section.id}`}>
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">{section.name}</h2>
                      {section.description && (
                        <p className="text-gray-600 text-sm">{section.description}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.products
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((product) => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={addToCart}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center p-2 text-orange-600">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Início</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <Heart className="w-5 h-5" />
            <span className="text-xs mt-1">Favoritos</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </div>

      {/* Carrinho flutuante */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl shadow-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ver sacola ({cartItemCount}) • R$ {cartTotal.toFixed(2).replace('.', ',')}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full">
              <SheetHeader>
                <SheetTitle>Sua Sacola</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                    Finalizar Pedido
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}

// Componente para produtos em destaque
function FeaturedProductCard({ product, onAddToCart }: { product: any; onAddToCart: (product: any) => void }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Sem imagem</span>
          </div>
        )}
        {product.isPromotion && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
            Oferta
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-600">
            R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
          </span>
          <Button 
            size="sm" 
            onClick={() => onAddToCart(product)}
            className="h-7 w-7 p-0 bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para produtos normais
function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (product: any) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="flex-1 p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            {product.tags && (
              <div className="flex gap-1 mt-1">
                {product.tags.split(',').map((tag: string) => (
                  <Badge key={tag.trim()} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg">
                R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-gray-400 text-sm line-through ml-2">
                  R$ {parseFloat(product.originalPrice).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            
            <Button 
              onClick={() => onAddToCart(product)}
              disabled={!product.isAvailable}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
        
        {product.imageUrl && (
          <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  );
}