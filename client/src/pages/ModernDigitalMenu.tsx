import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Heart,
  Store
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { AutoFacebookPixel } from "@/components/AutoFacebookPixel";
import { trackAddToCart, trackViewContent } from "@/components/FacebookPixelV2";

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
  primaryColor?: string;
  secondaryColor?: string;
  darkMode?: boolean;
  fontFamily?: string;
  showBanner?: boolean;
  showLogo?: boolean;
  openingHours?: string;
  deliveryFee?: string;
  minimumOrder?: string;
  estimatedDeliveryTime?: string;
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

  // Apply theme colors and dark mode
  useEffect(() => {
    if (storeData) {
      const root = document.documentElement;
      
      // Apply custom colors
      if (storeData.primaryColor) {
        root.style.setProperty('--menu-primary', storeData.primaryColor);
      }
      if (storeData.secondaryColor) {
        root.style.setProperty('--menu-secondary', storeData.secondaryColor);
      }
      
      // Apply dark mode
      if (storeData.darkMode) {
        document.body.classList.add('dark-menu');
      } else {
        document.body.classList.remove('dark-menu');
      }
      
      // Apply font family
      if (storeData.fontFamily) {
        root.style.setProperty('--menu-font', storeData.fontFamily);
      }
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-menu');
      const root = document.documentElement;
      root.style.removeProperty('--menu-primary');
      root.style.removeProperty('--menu-secondary');
      root.style.removeProperty('--menu-font');
    };
  }, [storeData]);

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
    <div className={`min-h-screen bg-white menu-font ${storeData?.darkMode ? 'dark-menu' : ''}`}>
      {/* Hero Banner - Apenas o banner sem sobreposições */}
      <div className="relative h-48 overflow-hidden">
        {/* Banner de fundo ou gradiente */}
        {storeData.bannerUrl ? (
          <img 
            src={storeData.bannerUrl} 
            alt="Banner da loja"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-orange-800" />
        )}
        
        {/* Overlay suave para contraste */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Seção com logo e informações - Abaixo do banner */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Logo circular */}
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center p-1 flex-shrink-0 border-2 border-gray-100">
              {storeData.logoUrl ? (
                <img 
                  src={storeData.logoUrl} 
                  alt="Logo da loja"
                  className="w-full h-full object-contain rounded-full"
                />
              ) : (
                <span className="text-lg font-bold text-orange-600">
                  {storeData.name.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Informações ao lado da logo */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{storeData.name}</h1>
              
              {/* Badges informativos em linha horizontal */}
              <div className="flex flex-wrap gap-2">
                <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">4.8</span>
                </div>
                <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">25-40 min</span>
                </div>
                <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Taxa: R$ 5,90</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Header de busca */}
      <div className="bg-gray-50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Busca centralizada */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:border-transparent shadow-sm"
              style={{
                '--tw-ring-color': storeData?.primaryColor || '#FF6B35'
              } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
      {/* Conteúdo principal - Container mais largo */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        {searchQuery ? (
          /* Resultados da busca */
          (<div className="py-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Resultados para "{searchQuery}" ({filteredProducts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <ModernProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                  storeData={storeData}
                />
              ))}
            </div>
          </div>)
        ) : (
          <>
            {/* Navegação de categorias - Pills menores */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">Categorias</h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {storeData.sections
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(`section-${section.id}`)?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                        activeSection === section.id 
                          ? 'text-white' 
                          : 'bg-transparent'
                      }`}
                      style={{
                        backgroundColor: activeSection === section.id ? (storeData?.primaryColor || '#FF6B35') : 'transparent',
                        borderColor: storeData?.primaryColor || '#FF6B35',
                        color: activeSection === section.id ? 'white' : (storeData?.primaryColor || '#FF6B35')
                      }}
                    >
                      {section.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Produtos por categoria - Layout integrado */}
            <div className="py-2 space-y-4">
              {storeData.sections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((section) => (
                  <div key={section.id} id={`section-${section.id}`} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    {/* Header da categoria - integrado */}
                    <div className="menu-primary-bg text-white px-4 py-3">
                      <h2 className="text-xl font-bold mb-0">{section.name}</h2>
                      {section.description && (
                        <p className="text-white/80 text-sm mt-1">{section.description}</p>
                      )}
                    </div>
                    
                    {/* Grid de produtos - dentro da categoria */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.products
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((product) => (
                            <ModernProductCard 
                              key={product.id} 
                              product={product} 
                              onAddToCart={addToCart}
                              storeData={storeData}
                            />
                          ))}
                      </div>
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
              <Button 
                className="w-full text-white py-4 rounded-xl shadow-lg"
                style={{ 
                  backgroundColor: storeData?.primaryColor || '#FF6B35',
                  borderColor: storeData?.primaryColor || '#FF6B35'
                }}
                onMouseEnter={(e) => {
                  if (storeData?.primaryColor) {
                    e.currentTarget.style.backgroundColor = `${storeData.primaryColor}CC`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (storeData?.primaryColor) {
                    e.currentTarget.style.backgroundColor = storeData.primaryColor;
                  }
                }}
              >
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

// Componente moderno para produtos - Layout clean com imagens SEMPRE QUADRADAS
function ModernProductCard({ product, onAddToCart, storeData }: { product: any; onAddToCart: (product: any) => void; storeData?: StoreData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Buscar adicionais do produto
  const { data: addonGroups } = useQuery({
    queryKey: [`/api/products/${product.id}/addons`],
    enabled: isModalOpen && !!product.id,
  });

  return (
    <>
      <div 
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex p-3">
          {/* Conteúdo do produto */}
          <div className="flex-1 pr-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">
                {product.name}
              </h3>
              
              {/* Descrição limitada a 1 linha para equilibrar */}
              {product.description ? (
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-1 mb-1">
                  {product.description}
                </p>
              ) : (
                <p className="text-gray-400 text-xs italic mb-1">
                  Sem descrição disponível
                </p>
              )}
            </div>
            
            {/* Preços na parte inferior */}
            <div className="flex items-center gap-2">
              {product.originalPrice && parseFloat(product.originalPrice) !== parseFloat(product.price) && (
                <span className="text-xs text-gray-400 line-through">
                  R$ {Math.max(parseFloat(product.originalPrice), parseFloat(product.price)).toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="font-bold text-base text-[#196e00]">
                R$ {product.originalPrice ? 
                  Math.min(parseFloat(product.originalPrice), parseFloat(product.price)).toFixed(2).replace('.', ',') :
                  parseFloat(product.price).toFixed(2).replace('.', ',')
                }
              </span>
            </div>
          </div>
          
          {/* Imagem à direita */}
          <div className="flex-shrink-0">
            <div 
              className="bg-gray-50 relative overflow-hidden rounded-lg"
              style={{ 
                width: '90px', 
                height: '80px'
              }}
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Badge de promoção */}
              {product.isPromotion && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    30%OFF
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de detalhes do produto - Layout fixo */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md mx-auto h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-0">
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          </DialogHeader>
          
          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            {/* Imagem do produto */}
            {product.imageUrl && (
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Descrição completa */}
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            )}
            
            {/* Preços */}
            <div className="border-t pt-4">
              {product.originalPrice && parseFloat(product.originalPrice) !== parseFloat(product.price) && (
                <span className="text-sm text-gray-400 line-through block">
                  R$ {Math.max(parseFloat(product.originalPrice), parseFloat(product.price)).toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="font-bold text-xl text-gray-900">
                R$ {product.originalPrice ? 
                  Math.min(parseFloat(product.originalPrice), parseFloat(product.price)).toFixed(2).replace('.', ',') :
                  parseFloat(product.price).toFixed(2).replace('.', ',')
                }
              </span>
            </div>
            
            {/* Adicionais */}
            {addonGroups && addonGroups.length > 0 && (
              <div className="space-y-4 mb-4">
                <h4 className="font-semibold text-lg">Personalize seu pedido</h4>
                
                {addonGroups.map((group: any) => (
                  <div key={group.id} className="space-y-3 border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-base">{group.name}</h5>
                      {group.isRequired && (
                        <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                      )}
                    </div>
                    
                    {group.description && (
                      <p className="text-sm text-gray-600">{group.description}</p>
                    )}
                    
                    {group.maxSelections === 1 ? (
                      // Radio buttons para seleção única
                      (<RadioGroup 
                        value={selectedAddons.find(a => a.groupId === group.id)?.id?.toString() || ""}
                        onValueChange={(value) => {
                          if (value) {
                            const addon = group.addons.find((a: any) => a.id.toString() === value);
                            if (addon) {
                              setSelectedAddons(prev => [
                                ...prev.filter(a => a.groupId !== group.id),
                                { ...addon, groupId: group.id }
                              ]);
                            }
                          } else {
                            setSelectedAddons(prev => prev.filter(a => a.groupId !== group.id));
                          }
                        }}
                      >
                        <div className="space-y-2">
                          {group.addons.map((addon: any) => (
                            <div key={addon.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white bg-white border">
                              <RadioGroupItem value={addon.id.toString()} id={`addon-${addon.id}`} />
                              <Label 
                                htmlFor={`addon-${addon.id}`} 
                                className="flex-1 flex justify-between items-center cursor-pointer"
                              >
                                <div>
                                  <span className="font-medium">{addon.name}</span>
                                  {addon.description && (
                                    <p className="text-sm text-gray-500">{addon.description}</p>
                                  )}
                                </div>
                                <span className="font-semibold text-green-600">
                                  +R$ {parseFloat(addon.price).toFixed(2).replace('.', ',')}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>)
                    ) : (
                      // Checkboxes para seleção múltipla
                      (<div className="space-y-2">
                        {group.addons.map((addon: any) => (
                          <div key={addon.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white bg-white border">
                            <Checkbox
                              id={`addon-${addon.id}`}
                              checked={selectedAddons.some(a => a.id === addon.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const groupSelections = selectedAddons.filter(a => a.groupId === group.id);
                                  if (groupSelections.length < group.maxSelections) {
                                    setSelectedAddons(prev => [...prev, { ...addon, groupId: group.id }]);
                                  }
                                } else {
                                  setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                                }
                              }}
                            />
                            <Label 
                              htmlFor={`addon-${addon.id}`} 
                              className="flex-1 flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <span className="font-medium">{addon.name}</span>
                                {addon.description && (
                                  <p className="text-sm text-gray-500">{addon.description}</p>
                                )}
                              </div>
                              <span className="font-semibold text-green-600">
                                +R$ {parseFloat(addon.price).toFixed(2).replace('.', ',')}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>)
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Observações especiais */}
            <div className="mb-4">
              <Label htmlFor="instructions" className="text-sm font-medium">
                Observações especiais (opcional)
              </Label>
              <Textarea
                id="instructions"
                placeholder="Ex: sem cebola, ponto da carne, etc..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Controle de quantidade */}
            <div className="mb-6">
              <Label className="text-sm font-medium">Quantidade</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Rodapé fixo com preços e botão */}
          <div className="flex-shrink-0 border-t bg-white p-6">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                // Verificar se grupos obrigatórios foram selecionados
                const requiredGroups = addonGroups?.filter((g: any) => g.isRequired) || [];
                const missingRequired = requiredGroups.filter((g: any) => 
                  !selectedAddons.some(a => a.groupId === g.id)
                );
                
                if (missingRequired.length > 0) {
                  alert(`Por favor, selecione: ${missingRequired.map((g: any) => g.name).join(', ')}`);
                  return;
                }
                
                const cartItem = {
                  productId: product.id,
                  name: product.name,
                  price: parseFloat(product.price) + selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || "0"), 0),
                  quantity,
                  selectedAddons,
                  specialInstructions
                };
                
                onAddToCart(cartItem);
                setIsModalOpen(false);
                
                // Reset form
                setSelectedAddons([]);
                setQuantity(1);
                setSpecialInstructions("");
              }}
              disabled={!product.isAvailable}
              className="w-full text-white font-semibold py-3 flex items-center justify-between"
              style={{
                backgroundColor: storeData?.primaryColor || '#FF6B35',
                borderColor: storeData?.primaryColor || '#FF6B35'
              }}
              onMouseEnter={(e) => {
                if (storeData?.primaryColor) {
                  e.currentTarget.style.backgroundColor = `${storeData.primaryColor}CC`;
                }
              }}
              onMouseLeave={(e) => {
                if (storeData?.primaryColor) {
                  e.currentTarget.style.backgroundColor = storeData.primaryColor;
                }
              }}
            >
              <span>Adicionar ao carrinho</span>
              <span className="font-bold">
                R$ {(
                  (parseFloat(product.price) + 
                   selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || "0"), 0)) * 
                  quantity
                ).toFixed(2).replace('.', ',')}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facebook Pixel Integration */}
      {storeData?.id && <AutoFacebookPixel storeId={storeData.id} />}
    </>
  );
}