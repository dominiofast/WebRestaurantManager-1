import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, QrCode, MessageCircle, Settings, Webhook, Copy, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface WhatsappInstance {
  id: number;
  storeId: number;
  instanceKey: string;
  apiToken: string;
  apiHost: string;
  status: 'disconnected' | 'connecting' | 'connected';
  qrCode?: string;
  phoneNumber?: string;
  isActive: boolean;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreIntegrationsProps {
  storeId: number;
  storeName: string;
}

export default function StoreIntegrations({ storeId, storeName }: StoreIntegrationsProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar instância WhatsApp da loja
  const { data: whatsappInstance, isLoading } = useQuery({
    queryKey: ['/api/stores', storeId, 'whatsapp-instance'],
    queryFn: () => apiRequest(`/api/stores/${storeId}/whatsapp-instance`),
  });

  // Conectar WhatsApp
  const connectWhatsAppMutation = useMutation({
    mutationFn: () => apiRequest(`/api/stores/${storeId}/whatsapp-instance/connect`, {
      method: 'POST'
    }),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setIsConnecting(true);
      queryClient.invalidateQueries({ queryKey: ['/api/stores', storeId, 'whatsapp-instance'] });
      toast({
        title: "QR Code gerado",
        description: "Escaneie o QR Code com seu WhatsApp para conectar"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code",
        variant: "destructive"
      });
    }
  });

  // Criar/atualizar instância WhatsApp
  const saveInstanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/stores/${storeId}/whatsapp-instance`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores', storeId, 'whatsapp-instance'] });
      toast({
        title: "Sucesso",
        description: "Instância WhatsApp configurada"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao configurar instância",
        variant: "destructive"
      });
    }
  });

  const handleConnectWhatsApp = () => {
    if (!whatsappInstance) {
      // Criar instância primeiro
      saveInstanceMutation.mutate({
        instanceKey: `${storeName.toLowerCase().replace(/\s+/g, '-')}-${storeId}`,
        apiToken: 'MDT3OHEGIyu',
        apiHost: 'apinocode01.megaapi.com.br'
      });
    } else {
      connectWhatsAppMutation.mutate();
    }
  };

  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    toast({
      title: "Copiado!",
      description: "URL do webhook copiada"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500">Conectando</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-6 w-6 text-coral" />
        <div>
          <h2 className="text-2xl font-bold">Integrações da Loja</h2>
          <p className="text-muted-foreground">{storeName}</p>
        </div>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Business
              </CardTitle>
              <CardDescription>
                Configure o WhatsApp para esta loja específica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappInstance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Status da Conexão</p>
                      <p className="text-sm text-muted-foreground">
                        Instância: {whatsappInstance.instanceKey}
                      </p>
                    </div>
                    {getStatusBadge(whatsappInstance.status)}
                  </div>

                  {whatsappInstance.phoneNumber && (
                    <div>
                      <p className="font-medium">Número Conectado</p>
                      <p className="text-sm text-muted-foreground">
                        {whatsappInstance.phoneNumber}
                      </p>
                    </div>
                  )}

                  {whatsappInstance.status === 'disconnected' && (
                    <Button 
                      onClick={handleConnectWhatsApp}
                      disabled={connectWhatsAppMutation.isPending}
                      className="w-full"
                    >
                      {connectWhatsAppMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Gerando QR Code...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          Conectar WhatsApp
                        </div>
                      )}
                    </Button>
                  )}

                  {(qrCode || whatsappInstance.qrCode) && (
                    <div className="text-center space-y-4">
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img 
                          src={qrCode || whatsappInstance.qrCode} 
                          alt="QR Code WhatsApp"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Como conectar:</p>
                        <ol className="list-decimal list-inside space-y-1 mt-2">
                          <li>Abra o WhatsApp no seu celular</li>
                          <li>Toque em "Mais opções" ou "⋮" → "Dispositivos conectados"</li>
                          <li>Toque em "Conectar um dispositivo"</li>
                          <li>Escaneie este QR Code</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      WhatsApp não configurado
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure uma instância WhatsApp específica para esta loja
                    </p>
                    <Button 
                      onClick={handleConnectWhatsApp}
                      disabled={saveInstanceMutation.isPending}
                    >
                      {saveInstanceMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Configurando...
                        </div>
                      ) : (
                        'Configurar WhatsApp'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Configuração do Webhook
              </CardTitle>
              <CardDescription>
                Configure o webhook para receber mensagens automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappInstance && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="webhook-url"
                        value={`https://dominiomenu-app.replit.app/api/webhook/whatsapp/${storeId}`}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyWebhook(`https://dominiomenu-app.replit.app/api/webhook/whatsapp/${storeId}`)}
                      >
                        {copiedWebhook ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Instruções de Configuração</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Acesse o painel da Mega API</li>
                      <li>Vá em "Webhooks" ou "Configurações"</li>
                      <li>Cole a URL do webhook acima</li>
                      <li>Ative os eventos de mensagem</li>
                      <li>Salve as configurações</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Eventos Suportados</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Mensagens recebidas</li>
                      <li>• Respostas automáticas inteligentes</li>
                      <li>• Integração com cardápio digital</li>
                    </ul>
                  </div>
                </div>
              )}

              {!whatsappInstance && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Configure primeiro uma instância WhatsApp para ver as opções de webhook
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Configurações específicas desta instância WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappInstance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instance-key">Chave da Instância</Label>
                      <Input
                        id="instance-key"
                        value={whatsappInstance.instanceKey}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="api-host">Host da API</Label>
                      <Input
                        id="api-host"
                        value={whatsappInstance.apiHost}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="created-at">Criado em</Label>
                    <Input
                      id="created-at"
                      value={new Date(whatsappInstance.createdAt).toLocaleString('pt-BR')}
                      readOnly
                    />
                  </div>

                  {whatsappInstance.updatedAt && (
                    <div>
                      <Label htmlFor="updated-at">Última atualização</Label>
                      <Input
                        id="updated-at"
                        value={new Date(whatsappInstance.updatedAt).toLocaleString('pt-BR')}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              )}

              {!whatsappInstance && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Configure primeiro uma instância WhatsApp para ver as configurações
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}