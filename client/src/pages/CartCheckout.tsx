import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ShoppingCart, CreditCard, Smartphone, MapPin, User, Mail, Phone, FileText, Check, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

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
  specialInstructions?: string;
}

interface StoreData {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  primaryColor?: string;
  pixKey?: string;
  minimumOrder?: string;
  deliveryFee?: string;
}

export default function CartCheckout() {
  const [match, params] = useRoute('/menu/:storeSlug/checkout');
  const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'confirmation'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [orderData, setOrderData] = useState<any>(null);
  const { toast } = useToast();

  // Form data
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    addressNumber: '',
    neighborhood: '',
    city: '',
    complement: '',
    notes: ''
  });

  // Buscar dados da loja
  const { data: storeData } = useQuery({
    queryKey: [`/api/stores/slug/${params?.storeSlug}`],
    enabled: !!params?.storeSlug,
  });

  // Buscar itens do carrinho do localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
      }
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = parseFloat(storeData?.deliveryFee || '5.00');
  const total = subtotal + deliveryFee;
  const minimumOrder = parseFloat(storeData?.minimumOrder || '25.00');

  // Mutation para criar pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      setOrderData(data);
      setStep('confirmation');
      toast({
        title: "Pedido criado com sucesso!",
        description: "Seu pedido foi registrado e está sendo processado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  });

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => items.filter(item => item.productId !== productId));
    } else {
      setCartItems(items => 
        items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity, subtotal: (item.price + (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)) * newQuantity }
            : item
        )
      );
    }
  };

  const handleSubmitOrder = () => {
    if (subtotal < minimumOrder) {
      toast({
        title: "Pedido mínimo não atingido",
        description: `O pedido mínimo é de R$ ${minimumOrder.toFixed(2).replace('.', ',')}`,
        variant: "destructive",
      });
      return;
    }

    const orderPayload = {
      storeId: storeData?.id,
      customer: customerInfo,
      items: cartItems,
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      subtotal,
      deliveryFee,
      total,
      notes: customerInfo.notes
    };

    createOrderMutation.mutate(orderPayload);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold">
              {step === 'cart' && 'Seu Carrinho'}
              {step === 'info' && 'Seus Dados'}
              {step === 'payment' && 'Pagamento'}
              {step === 'confirmation' && 'Pedido Confirmado'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'cart' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'info' ? 'bg-blue-600 text-white' : step === 'payment' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'payment' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Cart Step */}
        {step === 'cart' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="mt-1">
                          {item.selectedAddons.map((addon, index) => (
                            <span key={index} className="text-xs text-gray-500">
                              + {addon.name} (R$ {addon.price.toFixed(2).replace('.', ',')})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {item.subtotal.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                ))}

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {subtotal < minimumOrder && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Pedido mínimo: R$ {minimumOrder.toFixed(2).replace('.', ',')}. 
                      Adicione mais R$ {(minimumOrder - subtotal).toFixed(2).replace('.', ',')} para continuar.
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => setStep('info')}
                  disabled={subtotal < minimumOrder || cartItems.length === 0}
                  style={{
                    backgroundColor: storeData?.primaryColor || '#3B82F6',
                    borderColor: storeData?.primaryColor || '#3B82F6'
                  }}
                >
                  Continuar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Info Step */}
        {step === 'info' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={customerInfo.cpf}
                      onChange={(e) => setCustomerInfo({...customerInfo, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Rua/Avenida *</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressNumber">Número *</Label>
                    <Input
                      id="addressNumber"
                      value={customerInfo.addressNumber}
                      onChange={(e) => setCustomerInfo({...customerInfo, addressNumber: e.target.value})}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={customerInfo.neighborhood}
                      onChange={(e) => setCustomerInfo({...customerInfo, neighborhood: e.target.value})}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={customerInfo.complement}
                      onChange={(e) => setCustomerInfo({...customerInfo, complement: e.target.value})}
                      placeholder="Apto, bloco, etc."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    placeholder="Ponto de referência, observações especiais..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('cart')}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setStep('payment')}
                    disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.addressNumber || !customerInfo.neighborhood || !customerInfo.city}
                    style={{
                      backgroundColor: storeData?.primaryColor || '#3B82F6',
                      borderColor: storeData?.primaryColor || '#3B82F6'
                    }}
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <QrCode className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="font-medium">Cartão na Entrega</p>
                            <p className="text-sm text-gray-600">Débito ou crédito</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-medium">Dinheiro na Entrega</p>
                            <p className="text-sm text-gray-600">Pagamento em espécie</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <Separator className="my-6" />

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium mb-3">Resumo do Pedido</h4>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('info')}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending}
                    style={{
                      backgroundColor: storeData?.primaryColor || '#3B82F6',
                      borderColor: storeData?.primaryColor || '#3B82F6'
                    }}
                  >
                    {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && orderData && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">Pedido Confirmado!</CardTitle>
                <CardDescription>
                  Pedido #{orderData.id || 'ORD-' + Date.now()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentMethod === 'pix' && storeData?.pixKey && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Dados para Pagamento PIX</h4>
                    <p className="text-sm text-green-700">
                      Chave PIX: <span className="font-mono font-bold">{storeData.pixKey}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Após o pagamento, envie o comprovante para confirmar seu pedido.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium">Dados do Cliente</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Nome:</strong> {customerInfo.name}</p>
                    <p><strong>Telefone:</strong> {customerInfo.phone}</p>
                    {customerInfo.email && <p><strong>E-mail:</strong> {customerInfo.email}</p>}
                    <p><strong>Endereço:</strong> {customerInfo.address}, {customerInfo.addressNumber} - {customerInfo.neighborhood}, {customerInfo.city}</p>
                    {customerInfo.complement && <p><strong>Complemento:</strong> {customerInfo.complement}</p>}
                    {customerInfo.notes && <p><strong>Observações:</strong> {customerInfo.notes}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Itens do Pedido</h4>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tempo estimado de entrega:</strong> 30-45 minutos
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Você receberá atualizações pelo WhatsApp no número {customerInfo.phone}
                  </p>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => window.location.href = `/menu/${params?.storeSlug}`}
                  style={{
                    backgroundColor: storeData?.primaryColor || '#3B82F6',
                    borderColor: storeData?.primaryColor || '#3B82F6'
                  }}
                >
                  Fazer Novo Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}