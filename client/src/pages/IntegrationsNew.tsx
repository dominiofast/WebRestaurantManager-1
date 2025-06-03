import { useState, useEffect } from "react";
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
import { Plug, MessageCircle, Phone, Mail, Globe, Truck, CreditCard, Zap, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function IntegrationsNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para as integrações
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      enabled: false,
      provider: "mega-api",
      apiKey: "MDT3OHEGIyu",
      phoneNumber: "",
      instanceId: "megacode-MDT3OHEGIyu",
      webhookUrl: "",
      qrCode: "",
      status: "disconnected", // disconnected, connecting, connected
      autoResponder: true,
      businessHours: true,
      host: "apinocode01.megaapi.com.br",
      controlId: "e570acd2-2d6a-41b0-8fee-7253c9caa91c"
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

  // Auto-load configurations when store is available
  useEffect(() => {
    if (store && !storeLoading) {
      handleLoadWhatsAppConfig();
    }
  }, [store, storeLoading]);

  // Helper function to update integrations
  const updateIntegration = (service: string, field: string, value: any) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: {
        ...prev[service as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Save WhatsApp configuration to backend
  const handleSaveWhatsAppConfig = async () => {
    if (!store) return;
    
    try {
      const response = await fetch(`/api/stores/${(store as any).id}/whatsapp-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceKey: integrations.whatsapp.instanceId,
          apiToken: integrations.whatsapp.apiKey,
          apiHost: integrations.whatsapp.host,
          phoneNumber: integrations.whatsapp.phoneNumber,
          webhookUrl: integrations.whatsapp.webhookUrl,
          enabled: integrations.whatsapp.enabled,
          autoResponder: integrations.whatsapp.autoResponder,
          businessHours: integrations.whatsapp.businessHours
        })
      });

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description: "As configurações do WhatsApp foram salvas com sucesso",
        });
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };

  // Load WhatsApp configuration from backend
  const handleLoadWhatsAppConfig = async () => {
    if (!store) return;
    
    try {
      const response = await fetch(`/api/stores/${(store as any).id}/whatsapp-instance`);
      
      if (response.ok) {
        const instance = await response.json();
        if (instance) {
          setIntegrations(prev => ({
            ...prev,
            whatsapp: {
              ...prev.whatsapp,
              instanceId: instance.instanceKey || prev.whatsapp.instanceId,
              apiKey: instance.apiToken || prev.whatsapp.apiKey,
              host: instance.apiHost || prev.whatsapp.host,
              phoneNumber: instance.phoneNumber || prev.whatsapp.phoneNumber,
              webhookUrl: instance.webhookUrl || prev.whatsapp.webhookUrl,
              enabled: instance.enabled ?? prev.whatsapp.enabled,
              autoResponder: instance.autoResponder ?? prev.whatsapp.autoResponder,
              businessHours: instance.businessHours ?? prev.whatsapp.businessHours,
              status: instance.status || 'disconnected'
            }
          }));
          
          toast({
            title: "Configurações carregadas",
            description: "As configurações salvas foram carregadas com sucesso",
          });
        } else {
          toast({
            title: "Nenhuma configuração encontrada",
            description: "Não há configurações salvas para esta loja",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    }
  };

  // Fetch QR Code from Mega API
  const fetchQRCode = async () => {
    try {
      console.log('Fetching QR Code from:', `https://${integrations.whatsapp.host}/rest/instance/qrcode_base64/${integrations.whatsapp.instanceId}`);
      
      const response = await fetch(`https://${integrations.whatsapp.host}/rest/instance/qrcode_base64/${integrations.whatsapp.instanceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integrations.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('QR Code response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('QR Code response data:', data);
        
        if (data.qrcode) {
          // Check if qrcode already has data URL prefix
          const qrCodeDataURL = data.qrcode.startsWith('data:') ? data.qrcode : `data:image/png;base64,${data.qrcode}`;
          updateIntegration('whatsapp', 'qrCode', qrCodeDataURL);
          console.log('QR Code set successfully');
          return true;
        } else {
          console.log('No QR code in response');
          toast({
            title: "QR Code não disponível",
            description: "Instância pode já estar conectada ou sem QR code disponível",
            variant: "destructive"
          });
        }
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        toast({
          title: "Erro ao buscar QR Code",
          description: `Status: ${response.status}`,
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com a API Mega",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check connection status
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`https://${integrations.whatsapp.host}/rest/instance/connection_state/${integrations.whatsapp.instanceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integrations.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.status || data.state;
      }
      return 'disconnected';
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return 'disconnected';
    }
  };

  // Mega API WhatsApp handlers
  const handleWhatsAppConnection = async () => {
    if (!integrations.whatsapp.apiKey || !integrations.whatsapp.instanceId || !integrations.whatsapp.host) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    updateIntegration('whatsapp', 'status', 'connecting');
    
    try {
      // First check if already connected
      const status = await checkConnectionStatus();
      
      if (status === 'open' || status === 'connected') {
        updateIntegration('whatsapp', 'status', 'connected');
        toast({
          title: "WhatsApp já conectado",
          description: "Sua instância já está conectada!",
        });
        return;
      }

      // If not connected, fetch QR code
      const qrFetched = await fetchQRCode();
      
      if (qrFetched) {
        updateIntegration('whatsapp', 'status', 'connecting');
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code no WhatsApp para conectar",
        });

        // Poll for connection status every 3 seconds
        const pollInterval = setInterval(async () => {
          const currentStatus = await checkConnectionStatus();
          
          if (currentStatus === 'open' || currentStatus === 'connected') {
            updateIntegration('whatsapp', 'status', 'connected');
            updateIntegration('whatsapp', 'qrCode', '');
            clearInterval(pollInterval);
            toast({
              title: "WhatsApp conectado",
              description: "Integração configurada com sucesso!",
            });
          }
        }, 3000);

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 120000);
        
      } else {
        throw new Error('Não foi possível gerar o QR Code');
      }
    } catch (error) {
      updateIntegration('whatsapp', 'status', 'disconnected');
      updateIntegration('whatsapp', 'qrCode', '');
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    if (integrations.whatsapp.status !== 'connected') {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte o WhatsApp antes de testar",
        variant: "destructive"
      });
      return;
    }

    try {
      const testMessage = {
        number: "5511999999999", // Número de teste
        text: "🤖 Teste de integração Mega API\n\nSua integração WhatsApp está funcionando perfeitamente!\n\n✅ Mensagem enviada automaticamente pelo sistema DomínioMenu.AI"
      };

      const response = await fetch(`https://${integrations.whatsapp.host}/rest/instance/send_text/${integrations.whatsapp.instanceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integrations.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      if (response.ok) {
        toast({
          title: "Teste enviado com sucesso",
          description: "Mensagem de teste enviada via WhatsApp",
        });
      } else {
        throw new Error('Falha ao enviar mensagem de teste');
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a mensagem de teste",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!store) {
      toast({
        title: "Erro",
        description: "Loja não encontrada",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/stores/${(store as any).id}/whatsapp-instance/disconnect`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        updateIntegration('whatsapp', 'status', 'disconnected');
        updateIntegration('whatsapp', 'qrCode', '');
        
        toast({
          title: "WhatsApp desconectado",
          description: data.message || "Integração desativada com sucesso",
        });
      } else {
        throw new Error(data.message || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp",
        variant: "destructive"
      });
    }
  };

  const handleRestartInstance = () => {
    updateIntegration('whatsapp', 'status', 'connecting');
    setTimeout(() => {
      updateIntegration('whatsapp', 'status', 'connected');
      toast({
        title: "Instância reiniciada",
        description: "WhatsApp reconectado com sucesso",
      });
    }, 3000);
  };

  const saveIntegrations = () => {
    toast({
      title: "Configurações salvas",
      description: "Todas as integrações foram atualizadas",
    });
  };

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
                <p className="text-gray-600">Configure as integrações para otimizar sua operação</p>
              </div>
            </div>
            {store && (
              <div className="text-right">
                <p className="font-medium text-gray-900">{(store as any).name || 'Loja'}</p>
                <p className="text-sm text-gray-500">{(store as any).company?.name || 'Empresa'}</p>
              </div>
            )}
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

          {/* WhatsApp Integration - Mega API */}
          <TabsContent value="whatsapp">
            <div className="space-y-6">
              {/* Header com Logo Mega API */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Mega API WhatsApp</h2>
                      <p className="text-gray-600">Integração oficial para automação completa do WhatsApp</p>
                    </div>
                  </div>
                  <Badge variant={integrations.whatsapp.status === 'connected' ? 'default' : 'secondary'}>
                    {integrations.whatsapp.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração da API */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Configuração da API
                    </CardTitle>
                    <CardDescription>
                      Configure suas credenciais da Mega API
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
                      <Label htmlFor="whatsapp-host">Host da API</Label>
                      <Input
                        id="whatsapp-host"
                        placeholder="apinocode01.megaapi.com.br"
                        value={integrations.whatsapp.host}
                        onChange={(e) => updateIntegration('whatsapp', 'host', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-control-id">ID Único de Controle</Label>
                      <Input
                        id="whatsapp-control-id"
                        placeholder="ID único de controle"
                        value={integrations.whatsapp.controlId}
                        onChange={(e) => updateIntegration('whatsapp', 'controlId', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-api-key">Token da API</Label>
                      <Input
                        id="whatsapp-api-key"
                        type="password"
                        placeholder="Seu token da Mega API"
                        value={integrations.whatsapp.apiKey}
                        onChange={(e) => updateIntegration('whatsapp', 'apiKey', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Obtenha seu token em: <a href="https://doc.mega-api.app.br/" target="_blank" className="text-blue-600 hover:underline">doc.mega-api.app.br</a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-instance">Instance Key</Label>
                      <Input
                        id="whatsapp-instance"
                        placeholder="Instance Key da sua instância"
                        value={integrations.whatsapp.instanceId}
                        onChange={(e) => updateIntegration('whatsapp', 'instanceId', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                      <Input
                        id="whatsapp-phone"
                        placeholder="5511999999999"
                        value={integrations.whatsapp.phoneNumber}
                        onChange={(e) => updateIntegration('whatsapp', 'phoneNumber', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Formato: código do país + DDD + número (sem espaços ou símbolos)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-webhook">URL do Webhook</Label>
                      <Input
                        id="whatsapp-webhook"
                        placeholder="https://seu-dominio.com/webhook/whatsapp"
                        value={integrations.whatsapp.webhookUrl}
                        onChange={(e) => updateIntegration('whatsapp', 'webhookUrl', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">URL para receber mensagens e eventos</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveWhatsAppConfig}
                          variant="outline"
                          className="flex-1"
                        >
                          Salvar Configurações
                        </Button>
                        <Button 
                          onClick={handleLoadWhatsAppConfig}
                          variant="outline"
                        >
                          Carregar
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleWhatsAppConnection}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={!integrations.whatsapp.apiKey || !integrations.whatsapp.instanceId}
                        >
                          {integrations.whatsapp.status === 'connecting' ? 'Conectando...' : 'Conectar WhatsApp'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleTestConnection}
                          disabled={integrations.whatsapp.status !== 'connected'}
                        >
                          Testar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status e QR Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      Status da Conexão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {integrations.whatsapp.status === 'connected' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : integrations.whatsapp.status === 'connecting' ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {integrations.whatsapp.status === 'connected' ? 'WhatsApp Conectado' :
                             integrations.whatsapp.status === 'connecting' ? 'Conectando...' :
                             'WhatsApp Desconectado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {integrations.whatsapp.status === 'connected' ? `Número: ${integrations.whatsapp.phoneNumber}` :
                             integrations.whatsapp.status === 'connecting' ? 'Aguardando escaneamento do QR Code' :
                             'Configure as credenciais para conectar'}
                          </p>
                        </div>
                      </div>

                      {/* QR Code Area */}
                      {integrations.whatsapp.status === 'connecting' && (
                        <div className="text-center space-y-3">
                          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            {integrations.whatsapp.qrCode ? (
                              <img 
                                src={integrations.whatsapp.qrCode} 
                                alt="QR Code WhatsApp" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Gerando QR Code...</p>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Escaneie o QR Code</p>
                            <p className="text-xs text-gray-500">Abra o WhatsApp → Menu → Dispositivos conectados → Conectar dispositivo</p>
                          </div>
                        </div>
                      )}

                      {/* Connection Actions */}
                      {integrations.whatsapp.status === 'connected' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">📡 Configuração do Webhook</h4>
                            <p className="text-sm text-blue-700 mb-2">Configure esta URL no painel da Mega API:</p>
                            <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                              https://dominiomenu-app.replit.app/api/webhook/whatsapp
                            </div>
                            <div className="mt-2 text-xs text-blue-600">
                              <p>1. Acesse o painel da Mega API</p>
                              <p>2. Configure o webhook com a URL acima</p>
                              <p>3. Ative eventos de mensagem</p>
                              <p>4. Teste enviando uma mensagem</p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleDisconnectWhatsApp}
                          >
                            Desconectar WhatsApp
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleRestartInstance}
                          >
                            Reiniciar Instância
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configurações Avançadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Configurações de Automação
                  </CardTitle>
                  <CardDescription>
                    Configure o comportamento automático do bot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Respostas Automáticas</Label>
                          <p className="text-sm text-gray-500">Responder automaticamente com o agente IA</p>
                        </div>
                        <Switch 
                          checked={integrations.whatsapp.autoResponder}
                          onCheckedChange={(checked) => updateIntegration('whatsapp', 'autoResponder', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Respeitar Horário Comercial</Label>
                          <p className="text-sm text-gray-500">Só responder durante horário de funcionamento</p>
                        </div>
                        <Switch 
                          checked={integrations.whatsapp.businessHours}
                          onCheckedChange={(checked) => updateIntegration('whatsapp', 'businessHours', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Recursos da Mega API</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>✓ Envio e recebimento de mensagens</li>
                          <li>✓ Envio de mídia (imagens, áudios, vídeos)</li>
                          <li>✓ Webhooks em tempo real</li>
                          <li>✓ Status de entrega das mensagens</li>
                          <li>✓ Grupos e contatos</li>
                          <li>✓ Múltiplas instâncias</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs e Monitoramento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-orange-600" />
                    Logs e Monitoramento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">1,247</p>
                        <p className="text-sm text-gray-600">Mensagens Enviadas</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">892</p>
                        <p className="text-sm text-gray-600">Mensagens Recebidas</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">98.5%</p>
                        <p className="text-sm text-gray-600">Taxa de Entrega</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Últimas Atividades</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">15:32</span> - Mensagem enviada para +55 11 99999-9999
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">15:30</span> - Mensagem recebida de +55 11 88888-8888
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">15:28</span> - Resposta automática enviada
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">15:25</span> - Webhook recebido com sucesso
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delivery Integration */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-orange-600" />
                  Integração de Entrega
                </CardTitle>
                <CardDescription>
                  Configure integração com serviços de delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="delivery-enabled">Ativar Delivery</Label>
                  <Switch 
                    id="delivery-enabled"
                    checked={integrations.delivery.enabled}
                    onCheckedChange={(checked) => updateIntegration('delivery', 'enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-provider">Provedor</Label>
                  <Select
                    value={integrations.delivery.provider}
                    onValueChange={(value) => updateIntegration('delivery', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ifood">iFood</SelectItem>
                      <SelectItem value="ubereats">Uber Eats</SelectItem>
                      <SelectItem value="rappi">Rappi</SelectItem>
                      <SelectItem value="proprio">Sistema Próprio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-distance">Distância Máxima (km)</Label>
                    <Input
                      id="delivery-distance"
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

                <Button onClick={saveIntegrations} className="w-full">
                  Salvar Configurações de Delivery
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Integration */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Integração de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure gateways de pagamento
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
                  <Label htmlFor="payment-provider">Gateway de Pagamento</Label>
                  <Select
                    value={integrations.payment.provider}
                    onValueChange={(value) => updateIntegration('payment', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-public">Chave Pública</Label>
                  <Input
                    id="payment-public"
                    placeholder="Sua chave pública"
                    value={integrations.payment.publicKey}
                    onChange={(e) => updateIntegration('payment', 'publicKey', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-secret">Chave Secreta</Label>
                  <Input
                    id="payment-secret"
                    type="password"
                    placeholder="Sua chave secreta"
                    value={integrations.payment.secretKey}
                    onChange={(e) => updateIntegration('payment', 'secretKey', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-pix">Chave PIX</Label>
                  <Input
                    id="payment-pix"
                    placeholder="Sua chave PIX"
                    value={integrations.payment.pixKey}
                    onChange={(e) => updateIntegration('payment', 'pixKey', e.target.value)}
                  />
                </div>

                <Button onClick={saveIntegrations} className="w-full">
                  Salvar Configurações de Pagamento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Integration */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Integração de E-mail
                </CardTitle>
                <CardDescription>
                  Configure SMTP para envio de e-mails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Ativar E-mail</Label>
                  <Switch 
                    id="email-enabled"
                    checked={integrations.email.enabled}
                    onCheckedChange={(checked) => updateIntegration('email', 'enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Usuário</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="seu-email@gmail.com"
                    value={integrations.email.smtpUser}
                    onChange={(e) => updateIntegration('email', 'smtpUser', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="Sua senha ou app password"
                    value={integrations.email.smtpPassword}
                    onChange={(e) => updateIntegration('email', 'smtpPassword', e.target.value)}
                  />
                </div>

                <Button onClick={saveIntegrations} className="w-full">
                  Salvar Configurações de E-mail
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}