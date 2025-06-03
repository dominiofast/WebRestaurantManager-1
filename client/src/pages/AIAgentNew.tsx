import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Settings, Clock, Smartphone, MessageSquare, Save, Plus, Trash2, TestTube } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AgentConfig {
  restaurante: {
    nome: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    link_cardapio: string;
    delivery: boolean;
    retirada: boolean;
    zona_entrega: string;
    taxa_entrega: number;
    tempo_entrega: string;
    formas_pagamento: string;
    promocoes_ativas: string[];
  };
  personalidade: {
    nome: string;
    tom: string;
    prompt_personalizado: string;
    usar_emojis: boolean;
  };
  comportamento: {
    especialidades: {
      sugestoes: boolean;
      combos: boolean;
      promocoes: boolean;
      ingredientes: boolean;
      nutricional: boolean;
      alergias: boolean;
      informacoes_restaurante: boolean;
    };
    tempo_resposta: number;
    enviar_cardapio_automatico: boolean;
  };
  horario: {
    [key: string]: {
      ativo: boolean;
      inicio: string;
      fim: string;
    };
    mensagem_fechado: string;
    mensagem_nao_funciona: string;
  };
}

export default function AIAgentNew() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  const [config, setConfig] = useState<AgentConfig>({
    restaurante: {
      nome: store?.name || "Meu Restaurante",
      telefone: "(11) 99999-9999",
      endereco: "Rua Principal, 123 - Centro",
      cidade: "São Paulo",
      estado: "SP",
      link_cardapio: "",
      delivery: true,
      retirada: true,
      zona_entrega: "Centro, Vila Madalena, Pinheiros",
      taxa_entrega: 5.00,
      tempo_entrega: "45-60 minutos",
      formas_pagamento: "Dinheiro, Cartão, PIX",
      promocoes_ativas: [
        "Terças: 2 pizzas pelo preço de 1",
        "Combo Família: Pizza + Refri 2L por R$ 45"
      ]
    },
    personalidade: {
      nome: "Maria",
      tom: "amigavel",
      prompt_personalizado: "",
      usar_emojis: true
    },
    comportamento: {
      especialidades: {
        sugestoes: true,
        combos: true,
        promocoes: true,
        ingredientes: false,
        nutricional: false,
        alergias: true,
        informacoes_restaurante: true
      },
      tempo_resposta: 3,
      enviar_cardapio_automatico: true
    },
    horario: {
      segunda: { ativo: true, inicio: "18:00", fim: "23:30" },
      terca: { ativo: true, inicio: "18:00", fim: "23:30" },
      quarta: { ativo: true, inicio: "18:00", fim: "23:30" },
      quinta: { ativo: true, inicio: "18:00", fim: "23:30" },
      sexta: { ativo: true, inicio: "18:00", fim: "23:30" },
      sabado: { ativo: true, inicio: "18:00", fim: "00:00" },
      domingo: { ativo: true, inicio: "18:00", fim: "23:00" },
      mensagem_fechado: "Ops! Estamos fechados agora 😴",
      mensagem_nao_funciona: "Hoje não estamos funcionando 😔"
    }
  });

  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [newPromocao, setNewPromocao] = useState("");

  useEffect(() => {
    if (store && store.name) {
      setConfig(prev => ({
        ...prev,
        restaurante: {
          ...prev.restaurante,
          nome: store.name,
          link_cardapio: `https://menu.dominiomenu.ai/${store.slug || store.name.toLowerCase().replace(/\s+/g, '-')}`
        }
      }));
    }
  }, [store]);

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Agente IA configurado com sucesso!",
    });
  };

  const addPromocao = () => {
    if (newPromocao.trim()) {
      setConfig(prev => ({
        ...prev,
        restaurante: {
          ...prev.restaurante,
          promocoes_ativas: [...prev.restaurante.promocoes_ativas, newPromocao.trim()]
        }
      }));
      setNewPromocao("");
    }
  };

  const removePromocao = (index: number) => {
    setConfig(prev => ({
      ...prev,
      restaurante: {
        ...prev.restaurante,
        promocoes_ativas: prev.restaurante.promocoes_ativas.filter((_, i) => i !== index)
      }
    }));
  };

  const generateTestResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const { restaurante, personalidade, horario } = config;
    
    const responses: { [key: string]: string } = {
      'oi': `Oi! Sou ${personalidade.nome} do ${restaurante.nome}! Como posso ajudar?`,
      'olá': `Olá! Bem-vindo ao ${restaurante.nome}! Em que posso ajudar?`,
      'cardápio': `Nosso cardápio: ${restaurante.link_cardapio} 📋 Posso sugerir algo?`,
      'cardapio': `Menu completo: ${restaurante.link_cardapio} 🍕 O que te interessa?`,
      'menu': `Menu completo: ${restaurante.link_cardapio} 🍕 O que te interessa?`,
      'pizza': `Temos pizzas deliciosas! Veja: ${restaurante.link_cardapio} Qual sabor?`,
      'promoção': `Promoções: ${restaurante.promocoes_ativas.join(' | ')} 🎉`,
      'promocao': `Promoções: ${restaurante.promocoes_ativas.join(' | ')} 🎉`,
      'entrega': `Entregamos em: ${restaurante.zona_entrega}. Taxa: R$ ${restaurante.taxa_entrega.toFixed(2)}. Tempo: ${restaurante.tempo_entrega}`,
      'telefone': `Telefone: ${restaurante.telefone} 📞`,
      'endereço': `Endereço: ${restaurante.endereco} 📍`,
      'endereco': `Endereço: ${restaurante.endereco} 📍`,
      'horário': `Hoje funcionamos das 18:00 às 23:30 ⏰`,
      'horario': `Hoje funcionamos das 18:00 às 23:30 ⏰`,
      'pagamento': `Aceitamos: ${restaurante.formas_pagamento} 💳`
    };

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    return `Veja nosso cardápio: ${restaurante.link_cardapio} 📋 Como posso ajudar?`;
  };

  const handleTest = () => {
    if (testMessage.trim()) {
      setTestResponse(generateTestResponse(testMessage));
    }
  };

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
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
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Agente IA Avançado</h1>
                <p className="text-gray-600">Configure seu assistente virtual completo</p>
              </div>
            </div>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="restaurante" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="restaurante" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Restaurante
            </TabsTrigger>
            <TabsTrigger value="personalidade" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Personalidade
            </TabsTrigger>
            <TabsTrigger value="comportamento" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="horarios" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="teste" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Teste
            </TabsTrigger>
          </TabsList>

          {/* Restaurante */}
          <TabsContent value="restaurante">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informações do Restaurante
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu restaurante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome do Restaurante</Label>
                    <Input
                      value={config.restaurante.nome}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, nome: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={config.restaurante.telefone}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, telefone: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Input
                    value={config.restaurante.endereco}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      restaurante: { ...prev.restaurante, endereco: e.target.value }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Link do Cardápio Digital</Label>
                    <Input
                      value={config.restaurante.link_cardapio}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, link_cardapio: e.target.value }
                      }))}
                      placeholder="https://menu.dominiomenu.ai/meu-restaurante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zona de Entrega</Label>
                    <Input
                      value={config.restaurante.zona_entrega}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, zona_entrega: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Taxa de Entrega (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={config.restaurante.taxa_entrega}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, taxa_entrega: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo de Entrega</Label>
                    <Input
                      value={config.restaurante.tempo_entrega}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, tempo_entrega: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Formas de Pagamento</Label>
                    <Input
                      value={config.restaurante.formas_pagamento}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, formas_pagamento: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Promoções Ativas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPromocao}
                      onChange={(e) => setNewPromocao(e.target.value)}
                      placeholder="Nova promoção..."
                    />
                    <Button onClick={addPromocao} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {config.restaurante.promocoes_ativas.map((promocao, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{promocao}</span>
                        <Button
                          onClick={() => removePromocao(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.restaurante.delivery}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, delivery: checked }
                      }))}
                    />
                    <Label>Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.restaurante.retirada}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        restaurante: { ...prev.restaurante, retirada: checked }
                      }))}
                    />
                    <Label>Retirada no Local</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalidade */}
          <TabsContent value="personalidade">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Personalidade do Agente
                </CardTitle>
                <CardDescription>
                  Defina como seu agente IA irá se comunicar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome do Agente</Label>
                    <Input
                      value={config.personalidade.nome}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        personalidade: { ...prev.personalidade, nome: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tom de Voz</Label>
                    <Select
                      value={config.personalidade.tom}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        personalidade: { ...prev.personalidade, tom: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amigavel">Amigável</SelectItem>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="descontraido">Descontraído</SelectItem>
                        <SelectItem value="elegante">Elegante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prompt Personalizado</Label>
                  <Textarea
                    value={config.personalidade.prompt_personalizado}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      personalidade: { ...prev.personalidade, prompt_personalizado: e.target.value }
                    }))}
                    placeholder="Instruções específicas para o comportamento do agente..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.personalidade.usar_emojis}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      personalidade: { ...prev.personalidade, usar_emojis: checked }
                    }))}
                  />
                  <Label>Usar Emojis nas Respostas</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comportamento */}
          <TabsContent value="comportamento">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comportamento e Especialidades
                </CardTitle>
                <CardDescription>
                  Configure o que o agente pode fazer e responder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Especialidades do Agente</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(config.comportamento.especialidades).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <Label className="capitalize">
                          {key.replace('_', ' ').replace(/([A-Z])/g, ' $1')}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            comportamento: {
                              ...prev.comportamento,
                              especialidades: {
                                ...prev.comportamento.especialidades,
                                [key]: checked
                              }
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tempo de Resposta (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={config.comportamento.tempo_resposta}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        comportamento: { ...prev.comportamento, tempo_resposta: parseInt(e.target.value) || 3 }
                      }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      checked={config.comportamento.enviar_cardapio_automatico}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        comportamento: { ...prev.comportamento, enviar_cardapio_automatico: checked }
                      }))}
                    />
                    <Label>Enviar cardápio automaticamente</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Horários */}
          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários de Funcionamento
                </CardTitle>
                <CardDescription>
                  Configure quando o agente deve responder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(config.horario).filter(([key]) => !key.includes('mensagem')).map(([dia, horario]) => (
                    <div key={dia} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="capitalize font-semibold">{dia.replace('_', '-')}</Label>
                        <Switch
                          checked={horario.ativo}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            horario: {
                              ...prev.horario,
                              [dia]: { ...horario, ativo: checked }
                            }
                          }))}
                        />
                      </div>
                      {horario.ativo && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Início</Label>
                            <Input
                              type="time"
                              value={horario.inicio}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                horario: {
                                  ...prev.horario,
                                  [dia]: { ...horario, inicio: e.target.value }
                                }
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fim</Label>
                            <Input
                              type="time"
                              value={horario.fim}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                horario: {
                                  ...prev.horario,
                                  [dia]: { ...horario, fim: e.target.value }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Mensagens Automáticas</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Mensagem - Restaurante Fechado</Label>
                      <Textarea
                        value={config.horario.mensagem_fechado}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          horario: { ...prev.horario, mensagem_fechado: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem - Dia Não Funcionando</Label>
                      <Textarea
                        value={config.horario.mensagem_nao_funciona}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          horario: { ...prev.horario, mensagem_nao_funciona: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teste */}
          <TabsContent value="teste">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Teste do Agente IA
                </CardTitle>
                <CardDescription>
                  Teste como seu agente irá responder às mensagens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                  {testResponse && (
                    <>
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
                          {testMessage}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border px-4 py-2 rounded-lg max-w-xs">
                          {testResponse}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite uma mensagem para testar..."
                    onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                  />
                  <Button onClick={handleTest} className="bg-purple-600 hover:bg-purple-700">
                    Testar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sugestões de teste:</Label>
                  <div className="flex flex-wrap gap-2">
                    {['oi', 'cardápio', 'promoção', 'entrega', 'horário', 'telefone'].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-100"
                        onClick={() => setTestMessage(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}