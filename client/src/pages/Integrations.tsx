import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, MessageCircle, Phone, Mail, Globe, Truck, CreditCard, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Integrations() {
  const { user } = useAuth();
  
  // Estados para as integrações
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      enabled: false,
      apiKey: "",
      phoneNumber: "",
      webhookUrl: ""
    },
    delivery: {
      enabled: false,
      provider: "",
      apiKey: "",
      maxDistance: 10,
      deliveryFee: 5.00
    },
    payment: {
      enabled: false,
      provider: "",
      publicKey: "",
      secretKey: "",
      pixKey: ""
    },
    email: {
      enabled: false,
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: ""
    }
  });

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando integrações...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Plug className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Loja não encontrada</h3>
          <p className="mt-1 text-gray-500">Você não tem uma loja associada para configurar integrações.</p>
        </div>
      </div>
    );
  }

  const updateIntegration = (type: string, field: string, value: any) => {
    setIntegrations(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Plug className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
                <p className="text-gray-600">Configure as integrações externas para {store.name}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {store.company.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="whatsapp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Entrega
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Integration */}
          <TabsContent value="whatsapp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription>
                    Configure a integração com WhatsApp para atendimento automático
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp-enabled">Ativar Integração</Label>
                    <Switch 
                      id="whatsapp-enabled"
                      checked={integrations.whatsapp.enabled}
                      onCheckedChange={(checked) => updateIntegration('whatsapp', 'enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                    <Input
                      id="whatsapp-phone"
                      placeholder="+55 11 99999-9999"
                      value={integrations.whatsapp.phoneNumber}
                      onChange={(e) => updateIntegration('whatsapp', 'phoneNumber', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-api-key">API Key</Label>
                    <Input
                      id="whatsapp-api-key"
                      type="password"
                      placeholder="Sua chave da API do WhatsApp"
                      value={integrations.whatsapp.apiKey}
                      onChange={(e) => updateIntegration('whatsapp', 'apiKey', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-webhook">Webhook URL</Label>
                    <Input
                      id="whatsapp-webhook"
                      placeholder="https://sua-url.com/webhook"
                      value={integrations.whatsapp.webhookUrl}
                      onChange={(e) => updateIntegration('whatsapp', 'webhookUrl', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status da Integração</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {integrations.whatsapp.enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={integrations.whatsapp.enabled ? "text-green-700" : "text-gray-500"}>
                        {integrations.whatsapp.enabled ? "Integração Ativa" : "Integração Desativada"}
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Como configurar:</h4>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Crie uma conta no WhatsApp Business API</li>
                        <li>2. Obtenha sua API Key</li>
                        <li>3. Configure o webhook para receber mensagens</li>
                        <li>4. Teste a integração</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delivery Integration */}
          <TabsContent value="delivery">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-orange-600" />
                    Sistema de Entrega
                  </CardTitle>
                  <CardDescription>
                    Configure integrações com serviços de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="delivery-enabled">Ativar Entrega</Label>
                    <Switch 
                      id="delivery-enabled"
                      checked={integrations.delivery.enabled}
                      onCheckedChange={(checked) => updateIntegration('delivery', 'enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-provider">Provedor de Entrega</Label>
                    <Select 
                      value={integrations.delivery.provider}
                      onValueChange={(value) => updateIntegration('delivery', 'provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ifood">iFood</SelectItem>
                        <SelectItem value="uber-eats">Uber Eats</SelectItem>
                        <SelectItem value="rappi">Rappi</SelectItem>
                        <SelectItem value="custom">Sistema Próprio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-distance">Distância Máxima (km)</Label>
                      <Input
                        id="max-distance"
                        type="number"
                        value={integrations.delivery.maxDistance}
                        onChange={(e) => updateIntegration('delivery', 'maxDistance', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="delivery-fee"
                        type="number"
                        step="0.01"
                        value={integrations.delivery.deliveryFee}
                        onChange={(e) => updateIntegration('delivery', 'deliveryFee', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-api-key">API Key do Provedor</Label>
                    <Input
                      id="delivery-api-key"
                      type="password"
                      placeholder="Chave da API do provedor de entrega"
                      value={integrations.delivery.apiKey}
                      onChange={(e) => updateIntegration('delivery', 'apiKey', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Área de Entrega:</h4>
                      <p className="text-sm text-orange-700">
                        Raio de {integrations.delivery.maxDistance}km a partir da loja
                      </p>
                      <p className="text-sm text-orange-700">
                        Taxa: R$ {integrations.delivery.deliveryFee.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Horários de Entrega</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="time" defaultValue="18:00" />
                        <Input type="time" defaultValue="23:00" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Integration */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Gateway de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Configure métodos de pagamento online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-enabled">Ativar Pagamentos Online</Label>
                    <Switch 
                      id="payment-enabled"
                      checked={integrations.payment.enabled}
                      onCheckedChange={(checked) => updateIntegration('payment', 'enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-provider">Provedor de Pagamento</Label>
                    <Select 
                      value={integrations.payment.provider}
                      onValueChange={(value) => updateIntegration('payment', 'provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                        <SelectItem value="pagar.me">Pagar.me</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="pagseguro">PagSeguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-public-key">Chave Pública</Label>
                    <Input
                      id="payment-public-key"
                      placeholder="Chave pública do gateway"
                      value={integrations.payment.publicKey}
                      onChange={(e) => updateIntegration('payment', 'publicKey', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-secret-key">Chave Secreta</Label>
                    <Input
                      id="payment-secret-key"
                      type="password"
                      placeholder="Chave secreta do gateway"
                      value={integrations.payment.secretKey}
                      onChange={(e) => updateIntegration('payment', 'secretKey', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pix-key">Chave PIX</Label>
                    <Input
                      id="pix-key"
                      placeholder="Sua chave PIX"
                      value={integrations.payment.pixKey}
                      onChange={(e) => updateIntegration('payment', 'pixKey', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métodos Aceitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="credit-card" defaultChecked />
                        <Label htmlFor="credit-card">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="debit-card" defaultChecked />
                        <Label htmlFor="debit-card">Cartão de Débito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pix" defaultChecked />
                        <Label htmlFor="pix">PIX</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="cash" defaultChecked />
                        <Label htmlFor="cash">Dinheiro</Label>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Taxas:</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Cartão de Crédito: 3.99%</li>
                        <li>• Cartão de Débito: 1.99%</li>
                        <li>• PIX: 0.99%</li>
                        <li>• Dinheiro: 0%</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Integration */}
          <TabsContent value="email">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Configuração de E-mail
                  </CardTitle>
                  <CardDescription>
                    Configure SMTP para envio de e-mails automáticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-enabled">Ativar E-mails Automáticos</Label>
                    <Switch 
                      id="email-enabled"
                      checked={integrations.email.enabled}
                      onCheckedChange={(checked) => updateIntegration('email', 'enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                      value={integrations.email.smtpHost}
                      onChange={(e) => updateIntegration('email', 'smtpHost', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      placeholder="587"
                      value={integrations.email.smtpPort}
                      onChange={(e) => updateIntegration('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Usuário SMTP</Label>
                    <Input
                      id="smtp-user"
                      placeholder="seu-email@gmail.com"
                      value={integrations.email.smtpUser}
                      onChange={(e) => updateIntegration('email', 'smtpUser', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Senha SMTP</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder="Senha do e-mail"
                      value={integrations.email.smtpPassword}
                      onChange={(e) => updateIntegration('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de E-mail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="order-confirmation" defaultChecked />
                        <Label htmlFor="order-confirmation">Confirmação de Pedido</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="order-ready" defaultChecked />
                        <Label htmlFor="order-ready">Pedido Pronto</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="order-delivered" />
                        <Label htmlFor="order-delivered">Pedido Entregue</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="newsletter" />
                        <Label htmlFor="newsletter">Newsletter</Label>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Exemplo de configuração:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>• Gmail: smtp.gmail.com:587</p>
                        <p>• Outlook: smtp.live.com:587</p>
                        <p>• Yahoo: smtp.mail.yahoo.com:587</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t">
          <div className="text-sm text-gray-600">
            Última atualização: Nunca
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Testar Integrações
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}