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
  Heart
} from "lucide-react";
import ProductImage from "@/components/ProductImage";

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

      {/* Conteúdo principal - Container mais largo */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
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
            {/* Navegação de categorias - Pills menores */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 py-3 border-b">
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
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-600"
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Produtos por seção */}
            <div className="py-8 space-y-16">
              {storeData.sections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((section) => (
                  <div key={section.id} id={`section-${section.id}`}>
                    {/* Header da seção */}
                    <div className="text-left mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.name}</h2>
                      {section.description && (
                        <p className="text-gray-500 text-base leading-relaxed">{section.description}</p>
                      )}
                    </div>
                    
                    {/* Grid responsivo de produtos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

// Componente moderno para produtos - Layout clean como na referência
function ModernProductCard({ product, onAddToCart }: { product: any; onAddToCart: (product: any) => void }) {
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
        <div className="flex min-h-[5rem] sm:min-h-[6rem] md:min-h-[7rem]">
          {/* Conteúdo do produto */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1 leading-tight">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-gray-500 text-xs sm:text-sm truncate mb-2">
                  {product.description}
                </p>
              )}
            </div>
            
            {/* Preços alinhados com a imagem */}
            <div className="flex items-end justify-between">
              <div>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through block">
                    R$ {parseFloat(product.originalPrice).toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="font-bold text-base sm:text-lg text-gray-900">
                  A partir de R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Imagem quadrada fixa - FORÇADA */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-50 flex-shrink-0 relative overflow-hidden rounded-r-lg"
            style={{ aspectRatio: '1', minWidth: '80px', minHeight: '80px' }}
          >
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ 
                  aspectRatio: '1',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Modal de detalhes do produto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Imagem do produto */}
            {product.imageUrl && (
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  size="lg"
                  className="w-full h-full"
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
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through block">
                  R$ {parseFloat(product.originalPrice).toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="font-bold text-xl text-gray-900">
                R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            {/* Adicionais */}
            {addonGroups && addonGroups.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-lg">Personalize seu pedido</h4>
                
                {addonGroups.map((group: any) => (
                  <div key={group.id} className="space-y-3">
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
                      <RadioGroup 
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
                            <div key={addon.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
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
                      </RadioGroup>
                    ) : (
                      // Checkboxes para seleção múltipla
                      <div className="space-y-2">
                        {group.addons.map((addon: any) => (
                          <div key={addon.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Observações especiais */}
            <div className="border-t pt-4">
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

            {/* Quantidade e botão */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantidade</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preço total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>R$ {(
                  (parseFloat(product.price) + 
                   selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || "0"), 0)) * 
                  quantity
                ).toFixed(2).replace('.', ',')}</span>
              </div>

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
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
              >
                Adicionar ao carrinho
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}