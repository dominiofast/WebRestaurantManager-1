import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Facebook, Target, BarChart3, Shield, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const facebookPixelSchema = z.object({
  facebookPixelId: z.string().optional(),
  facebookAccessToken: z.string().optional(),
  facebookDatasetId: z.string().optional(),
  facebookTestEventCode: z.string().optional(),
  pixelEnabled: z.boolean(),
  conversionsApiEnabled: z.boolean()
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

export default function FacebookPixelConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('config');

  const { data: store, isLoading } = useQuery<Store>({
    queryKey: ['/api/manager/store']
  });

  const form = useForm<FacebookPixelData>({
    resolver: zodResolver(facebookPixelSchema),
    defaultValues: {
      facebookPixelId: store?.facebookPixelId || '',
      facebookAccessToken: '',
      facebookDatasetId: '',
      facebookTestEventCode: store?.facebookTestEventCode || '',
      pixelEnabled: store?.pixelEnabled || false,
      conversionsApiEnabled: store?.conversionsApiEnabled || false
    }
  });

  const updatePixelConfig = useMutation({
    mutationFn: async (data: FacebookPixelData) => {
      const response = await fetch(`/api/stores/${store?.id}/pixel-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "As configurações do Facebook Pixel foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do Facebook Pixel.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FacebookPixelData) => {
    updatePixelConfig.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Facebook className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Facebook Pixel & API de Conversões</h1>
          <p className="text-muted-foreground">Configure o tracking avançado para campanhas publicitárias</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Teste
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Configuração do Facebook Pixel
                </CardTitle>
                <CardDescription>
                  Configure seu pixel do Facebook para rastrear eventos no seu cardápio digital
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixelEnabled">Pixel Ativo</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="pixelEnabled"
                        {...form.register('pixelEnabled')}
                        checked={form.watch('pixelEnabled')}
                        onCheckedChange={(checked) => form.setValue('pixelEnabled', checked)}
                      />
                      <Badge variant={form.watch('pixelEnabled') ? 'default' : 'secondary'}>
                        {form.watch('pixelEnabled') ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="conversionsApiEnabled">API de Conversões</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="conversionsApiEnabled"
                        {...form.register('conversionsApiEnabled')}
                        checked={form.watch('conversionsApiEnabled')}
                        onCheckedChange={(checked) => form.setValue('conversionsApiEnabled', checked)}
                      />
                      <Badge variant={form.watch('conversionsApiEnabled') ? 'default' : 'secondary'}>
                        {form.watch('conversionsApiEnabled') ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">ID do Pixel do Facebook</Label>
                  <Input
                    id="facebookPixelId"
                    placeholder="Ex: 123456789012345"
                    {...form.register('facebookPixelId')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Encontre este ID no Gerenciador de Eventos do Facebook
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookAccessToken">Token de Acesso (API de Conversões)</Label>
                  <Input
                    id="facebookAccessToken"
                    type="password"
                    placeholder="Token de acesso para API de Conversões"
                    {...form.register('facebookAccessToken')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Token gerado no Business Manager do Facebook
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookDatasetId">ID do Dataset (Opcional)</Label>
                    <Input
                      id="facebookDatasetId"
                      placeholder="Dataset ID"
                      {...form.register('facebookDatasetId')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebookTestEventCode">Código de Teste (Opcional)</Label>
                    <Input
                      id="facebookTestEventCode"
                      placeholder="TEST12345"
                      {...form.register('facebookTestEventCode')}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updatePixelConfig.isPending}
                  className="w-full"
                >
                  {updatePixelConfig.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Rastreados Automaticamente</CardTitle>
              <CardDescription>
                Lista de eventos que são enviados automaticamente para o Facebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">PageView</h4>
                      <p className="text-sm text-muted-foreground">Visualização de páginas do cardápio</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">ViewContent</h4>
                      <p className="text-sm text-muted-foreground">Visualização de produtos específicos</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">AddToCart</h4>
                      <p className="text-sm text-muted-foreground">Adição de itens ao carrinho</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">InitiateCheckout</h4>
                      <p className="text-sm text-muted-foreground">Início do processo de pedido</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Purchase</h4>
                      <p className="text-sm text-muted-foreground">Finalização de pedidos</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Search</h4>
                      <p className="text-sm text-muted-foreground">Pesquisas no cardápio</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Lead</h4>
                      <p className="text-sm text-muted-foreground">Formulários de contato</p>
                    </div>
                  </div>
                  <Badge>Automático</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste do Facebook Pixel</CardTitle>
              <CardDescription>
                Ferramenta para verificar se os eventos estão sendo enviados corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use a extensão "Facebook Pixel Helper" no Chrome para monitorar eventos em tempo real.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Como testar:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Instale a extensão Facebook Pixel Helper no Chrome</li>
                  <li>Configure um código de teste nas configurações acima</li>
                  <li>Visite seu cardápio digital</li>
                  <li>Execute ações como visualizar produtos ou adicionar ao carrinho</li>
                  <li>Verifique os eventos no Gerenciador de Eventos do Facebook</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Status atual:</h4>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pixel configurado</span>
                    {store?.facebookPixelId ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pixel ativo</span>
                    {store?.pixelEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API de Conversões ativa</span>
                    {store?.conversionsApiEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
              <CardDescription>
                Guia completo para configurar o Facebook Pixel e API de Conversões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Como configurar o Facebook Pixel:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Acesse o <strong>Gerenciador de Eventos</strong> do Facebook</li>
                  <li>Crie um novo pixel ou use um existente</li>
                  <li>Copie o <strong>ID do Pixel</strong> e cole no campo acima</li>
                  <li>Ative o pixel marcando a opção "Pixel Ativo"</li>
                  <li>Salve as configurações</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Como configurar a API de Conversões:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Acesse o <strong>Business Manager</strong> do Facebook</li>
                  <li>Vá em <strong>Configurações de Negócios → Fontes de Dados → Pixels</strong></li>
                  <li>Selecione seu pixel e clique em <strong>Configurações</strong></li>
                  <li>Na seção "API de Conversões", clique em <strong>Gerar token de acesso</strong></li>
                  <li>Copie o token e cole no campo "Token de Acesso" acima</li>
                  <li>Ative a API de Conversões marcando a opção correspondente</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Benefícios do Facebook Pixel:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Rastreamento preciso de conversões</li>
                  <li>Criação de públicos personalizados</li>
                  <li>Otimização automática de campanhas</li>
                  <li>Relatórios detalhados de performance</li>
                  <li>Remarketing para visitantes do cardápio</li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  O Facebook Pixel é essencial para campanhas publicitárias eficazes. 
                  Configure corretamente para maximizar o ROI dos seus anúncios.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}