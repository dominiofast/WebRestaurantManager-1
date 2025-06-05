import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Facebook, Activity, Settings, TestTube, Eye, EyeOff, Copy, ExternalLink, Save, RefreshCw } from 'lucide-react';

const facebookPixelSchema = z.object({
  facebookPixelId: z.string().min(1, "ID do Pixel é obrigatório"),
  facebookAccessToken: z.string().optional(),
  facebookDatasetId: z.string().optional(),
  facebookTestEventCode: z.string().optional(),
  pixelEnabled: z.boolean().default(false),
  conversionsApiEnabled: z.boolean().default(false)
});

type FacebookPixelData = z.infer<typeof facebookPixelSchema>;

interface Store {
  id: number;
  name: string;
  facebookPixelId?: string;
  pixelEnabled?: boolean;
  conversionsApiEnabled?: boolean;
  facebookTestEventCode?: string;
}

export default function FacebookPixelConfigV2() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('config');
  const [showTokens, setShowTokens] = useState(false);
  const [isTestingPixel, setIsTestingPixel] = useState(false);

  // Hard-code store ID 4 for 300 Graus restaurant
  const storeId = 4;
  
  const { data: store, isLoading, refetch } = useQuery<Store>({
    queryKey: ['/api/stores', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da loja');
      }
      return response.json();
    }
  });

  const form = useForm<FacebookPixelData>({
    resolver: zodResolver(facebookPixelSchema),
    defaultValues: {
      facebookPixelId: '',
      facebookAccessToken: '',
      facebookDatasetId: '',
      facebookTestEventCode: '',
      pixelEnabled: false,
      conversionsApiEnabled: false
    }
  });

  // Update form when store data loads
  useEffect(() => {
    if (store) {
      form.reset({
        facebookPixelId: store.facebookPixelId || '',
        facebookAccessToken: '',
        facebookDatasetId: '',
        facebookTestEventCode: store.facebookTestEventCode || '',
        pixelEnabled: store.pixelEnabled || false,
        conversionsApiEnabled: store.conversionsApiEnabled || false
      });
    }
  }, [store, form]);

  const updatePixelConfig = useMutation({
    mutationFn: async (data: FacebookPixelData) => {
      if (!store?.id) {
        throw new Error('Loja não encontrada');
      }
      
      const response = await fetch(`/api/stores/${store.id}/pixel-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao atualizar configurações');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "As configurações do Facebook Pixel foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stores', storeId] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testPixelConnection = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/pixel-test`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao testar conexão');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Teste realizado",
        description: "Evento de teste enviado com sucesso para o Facebook."
      });
    },
    onError: () => {
      toast({
        title: "Erro no teste",
        description: "Falha ao enviar evento de teste. Verifique as configurações.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FacebookPixelData) => {
    updatePixelConfig.mutate(data);
  };

  const handleTestPixel = () => {
    setIsTestingPixel(true);
    testPixelConnection.mutate();
    setTimeout(() => setIsTestingPixel(false), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Facebook className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Facebook Pixel & Conversions API</h1>
        </div>
        <p className="text-gray-600">
          Configure o rastreamento avançado do Facebook para maximizar o ROI das suas campanhas publicitárias.
        </p>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {store?.facebookPixelId ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm">
                  Pixel ID: {store?.facebookPixelId ? 'Configurado' : 'Pendente'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {store?.pixelEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">
                  Pixel: {store?.pixelEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {store?.conversionsApiEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">
                  API: {store?.conversionsApiEnabled ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Teste
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Facebook Pixel</CardTitle>
              <CardDescription>
                Configure seu pixel do Facebook e a API de Conversões para rastreamento avançado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="facebookPixelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Pixel do Facebook *</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ex: 1234567890123456"
                                {...field}
                                className="font-mono"
                              />
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyToClipboard(field.value)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            O ID numérico do seu pixel do Facebook (15-16 dígitos)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebookAccessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token de Acesso da API de Conversões</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type={showTokens ? "text" : "password"}
                                placeholder="Token de acesso para API de Conversões"
                                {...field}
                                className="font-mono"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowTokens(!showTokens)}
                              >
                                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Token necessário para enviar eventos via API de Conversões
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebookDatasetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dataset ID (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ID do dataset para API de Conversões"
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            ID do conjunto de dados para API de Conversões (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebookTestEventCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Teste (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Código para teste de eventos"
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Código de teste para verificar eventos no Event Manager
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ativação</h3>
                    
                    <FormField
                      control={form.control}
                      name="pixelEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Ativar Facebook Pixel
                            </FormLabel>
                            <FormDescription>
                              Ativa o rastreamento via pixel do navegador
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="conversionsApiEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Ativar API de Conversões
                            </FormLabel>
                            <FormDescription>
                              Ativa o envio de eventos via servidor (recomendado)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button 
                      type="submit" 
                      disabled={updatePixelConfig.isPending}
                      className="flex items-center gap-2"
                    >
                      {updatePixelConfig.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Configurações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão</CardTitle>
              <CardDescription>
                Teste se o Facebook Pixel está funcionando corretamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Este teste enviará um evento de teste para verificar se a configuração está funcionando.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleTestPixel} 
                disabled={isTestingPixel || !store?.facebookPixelId}
                className="w-full"
              >
                {isTestingPixel ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando teste...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Enviar Evento de Teste
                  </>
                )}
              </Button>

              {!store?.facebookPixelId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure primeiro o ID do Pixel para realizar testes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação e Guias</CardTitle>
              <CardDescription>
                Links úteis para configurar e otimizar seu Facebook Pixel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Como encontrar seu Pixel ID</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    1. Acesse o Facebook Business Manager<br/>
                    2. Vá em "Fontes de dados" → "Pixels"<br/>
                    3. Copie o ID numérico do seu pixel
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Business Manager
                    </a>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Eventos Rastreados Automaticamente</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PageView - Visualizações de páginas</li>
                    <li>• ViewContent - Visualização de produtos</li>
                    <li>• AddToCart - Adição ao carrinho</li>
                    <li>• InitiateCheckout - Início do checkout</li>
                    <li>• Purchase - Compras finalizadas</li>
                    <li>• Search - Pesquisas no cardápio</li>
                    <li>• Lead - Formulários de contato</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">API de Conversões</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    A API de Conversões melhora a precisão do rastreamento enviando eventos
                    diretamente do servidor, contornando bloqueadores de anúncios.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.facebook.com/docs/marketing-api/conversions-api" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Documentação API
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}