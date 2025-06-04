import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, MessageSquare, ShoppingCart, Calendar } from 'lucide-react';

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: whatsappStats } = useQuery({
    queryKey: ['/api/analytics/whatsapp'],
  });

  const { data: salesData } = useQuery({
    queryKey: ['/api/analytics/sales'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 2.847,50</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% em relação a ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +8% em relação a ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  +3 desde ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 118,65</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% em relação a ontem
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>Top 5 itens do cardápio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Pizza Margherita', sales: 12, revenue: 'R$ 348,00' },
                  { name: 'Hambúrguer Artesanal', sales: 8, revenue: 'R$ 280,00' },
                  { name: 'Lasanha Bolonhesa', sales: 6, revenue: 'R$ 270,00' },
                  { name: 'Risotto de Camarão', sales: 5, revenue: 'R$ 225,00' },
                  { name: 'Salmão Grelhado', sales: 4, revenue: 'R$ 180,00' }
                ].map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.revenue}</div>
                      <div className="text-sm text-muted-foreground">{item.sales} vendas</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>Pedidos por horário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: '19:00 - 20:00', orders: 8, percentage: 33 },
                  { time: '20:00 - 21:00', orders: 6, percentage: 25 },
                  { time: '18:00 - 19:00', orders: 5, percentage: 21 },
                  { time: '21:00 - 22:00', orders: 3, percentage: 13 },
                  { time: '12:00 - 13:00', orders: 2, percentage: 8 }
                ].map((slot) => (
                  <div key={slot.time} className="flex items-center justify-between">
                    <span className="font-medium">{slot.time}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${slot.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{slot.orders}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  +23% em relação a ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.7%</div>
                <p className="text-xs text-muted-foreground">
                  Tempo médio: 2.3s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.4%</div>
                <p className="text-xs text-muted-foreground">
                  24 pedidos via WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Palavras-chave Mais Frequentes</CardTitle>
              <CardDescription>Principais termos buscados pelos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { keyword: 'cardápio', count: 45, trend: '+12%' },
                  { keyword: 'horário', count: 32, trend: '+8%' },
                  { keyword: 'delivery', count: 28, trend: '+15%' },
                  { keyword: 'pizza', count: 24, trend: '+5%' },
                  { keyword: 'preço', count: 18, trend: '+3%' },
                  { keyword: 'promoção', count: 15, trend: '+22%' }
                ].map((item) => (
                  <div key={item.keyword} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium capitalize">{item.keyword}</span>
                      <div className="text-sm text-muted-foreground">{item.count} menções</div>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      {item.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Canal</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: 'WhatsApp Bot', amount: 'R$ 12.450,00', percentage: 45, color: 'bg-green-500' },
                    { channel: 'Cardápio Digital', amount: 'R$ 8.320,00', percentage: 30, color: 'bg-blue-500' },
                    { channel: 'Telefone', amount: 'R$ 4.890,00', percentage: 18, color: 'bg-yellow-500' },
                    { channel: 'Presencial', amount: 'R$ 1.940,00', percentage: 7, color: 'bg-purple-500' }
                  ].map((item) => (
                    <div key={item.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.channel}</span>
                        <span className="font-bold">{item.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Preferências dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: 'PIX', count: 67, percentage: 56 },
                    { method: 'Cartão de Crédito', count: 32, percentage: 27 },
                    { method: 'Cartão de Débito', count: 15, percentage: 12 },
                    { method: 'Dinheiro', count: 6, percentage: 5 }
                  ].map((item) => (
                    <div key={item.method} className="flex items-center justify-between">
                      <span className="font-medium">{item.method}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +47 este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">384</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76.3%</div>
                <p className="text-xs text-muted-foreground">
                  Clientes que voltaram
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segmentação de Clientes</CardTitle>
              <CardDescription>Classificação por frequência de pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { segment: 'VIP', description: '10+ pedidos/mês', count: 23, value: 'R$ 15.670,00' },
                  { segment: 'Frequente', description: '5-9 pedidos/mês', count: 87, value: 'R$ 18.450,00' },
                  { segment: 'Regular', description: '2-4 pedidos/mês', count: 156, value: 'R$ 12.340,00' },
                  { segment: 'Ocasional', description: '1 pedido/mês', count: 234, value: 'R$ 8.920,00' }
                ].map((segment) => (
                  <div key={segment.segment} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{segment.segment}</h3>
                      <Badge variant="outline">{segment.count} clientes</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{segment.description}</p>
                    <p className="font-bold text-green-600">{segment.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}