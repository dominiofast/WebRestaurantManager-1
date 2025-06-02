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
    <div className="min-h-screen bg-white">
      {/* Hero Banner - Moderno e atrativo */}
      <div className="relative h-64 bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 overflow-hidden">
        {/* Pattern de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute top-16 right-0 w-48 h-48 bg-white rounded-full translate-x-24 -translate-y-24"></div>
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white rounded-full translate-y-16"></div>
        </div>
        
        {/* Conteúdo do banner */}
        <div className="relative h-full flex flex-col justify-center items-center text-white px-4">
          {/* Logo */}
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-4">
            {storeData.logoUrl ? (
              <img 
                src={storeData.logoUrl} 
                alt="Logo da loja"
                className="w-20 h-20 object-cover rounded-2xl"
              />
            ) : (
              <span className="text-2xl font-bold text-orange-600">
                {storeData.name.charAt(0)}
              </span>
            )}
          </div>
          
          {/* Nome e informações */}
          <h1 className="text-3xl font-bold text-center mb-2">{storeData.name}</h1>
          {storeData.description && (
            <p className="text-white/90 text-center text-lg mb-4 max-w-md">{storeData.description}</p>
          )}
          
          {/* Badges informativos */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">4.8 • Avaliação</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">25-40 min</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">Taxa: R$ 5,90</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header info e busca */}
      <div className="bg-gray-50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Informações de contato */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
            {storeData.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{storeData.address}</span>
              </div>
            )}
            {storeData.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{storeData.phone}</span>
              </div>
            )}
          </div>

          {/* Busca centralizada */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo principal - Container centralizado */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {searchQuery ? (
          /* Resultados da busca */
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Resultados para "{searchQuery}" ({filteredProducts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <ModernProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Navegação de categorias - Pills horizontais */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 py-4 border-b">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {storeData.sections
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                        activeSection === section.id
                          ? "bg-orange-600 text-white border-orange-600 shadow-lg"
                          : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Produtos por seção */}
            <div className="py-8 space-y-12">
              {storeData.sections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((section) => (
                  <div key={section.id} id={`section-${section.id}`}>
                    {/* Header da seção */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.name}</h2>
                      {section.description && (
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{section.description}</p>
                      )}
                    </div>
                    
                    {/* Grid de produtos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.products
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((product) => (
                          <ModernProductCard 
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

// Componente moderno para produtos - Layout como na referência
function ModernProductCard({ product, onAddToCart }: { product: any; onAddToCart: (product: any) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex h-32">
        {/* Conteúdo do produto */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
          </div>
          
          {/* Preço e ação */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                A partir de R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  R$ {parseFloat(product.originalPrice).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            
            <Button 
              onClick={() => onAddToCart(product)}
              disabled={!product.isAvailable}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-xl transition-colors shadow-md hover:shadow-lg"
              size="sm"
            >
              Adicionar
            </Button>
          </div>
        </div>
        
        {/* Imagem do produto */}
        <div className="w-32 h-32 bg-gray-50 flex-shrink-0 relative overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEw4MCA4MEw0OCA4MFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iNTYiIGN5PSI1NiIgcj0iNCIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Sem foto</span>
              </div>
            </div>
          )}
          
          {/* Badges */}
          {product.isPromotion && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1">
                Oferta
              </Badge>
            </div>
          )}
          
          {product.tags && (
            <div className="absolute bottom-2 left-2">
              {product.tags.split(',').slice(0, 1).map((tag: string) => (
                <Badge key={tag.trim()} variant="secondary" className="text-xs bg-white/90 text-gray-700">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}