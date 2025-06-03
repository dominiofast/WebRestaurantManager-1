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
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, Settings, Eye, Plus, MessageCircle, Clock, Users, Link } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AIAgent() {
  const { user } = useAuth();
  
  // Estados para configuração do agente
  const [agentConfig, setAgentConfig] = useState({
    nome: "Maria",
    tom: "amigavel",
    customPrompt: "",
    useEmojis: true,
    especialidades: {
      sugestoes: true,
      combos: true,
      promocoes: true,
      ingredientes: false,
      nutricional: false,
      alergias: true
    },
    tempoResposta: 3,
    maxTentativas: 5,
    horarios: {
      segSex: { inicio: "18:00", fim: "23:30" },
      sabado: { inicio: "18:00", fim: "00:00" },
      domingo: { inicio: "18:00", fim: "23:00" }
    },
    mensagemForaHorario: "Ops! Estamos fechados agora 😴 Voltamos amanhã às 18h. Quer fazer um pedido agendado?",
    webhookUrl: "",
    apiKey: "",
    canais: {
      whatsapp: true,
      telegram: false,
      website: true,
      facebook: false
    }
  });

  const [testMessages, setTestMessages] = useState([
    {
      type: "bot",
      message: "Olá! Bem-vindo à nossa pizzaria! 😊 Sou a Maria e estou aqui para ajudar com seu pedido. O que vai querer hoje?"
    }
  ]);
  const [testInput, setTestInput] = useState("");

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

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

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Loja não encontrada</h3>
          <p className="mt-1 text-gray-500">Você não tem uma loja associada para configurar o agente de IA.</p>
        </div>
      </div>
    );
  }

  const handleTestMessage = () => {
    if (!testInput.trim()) return;

    // Adicionar mensagem do usuário
    const newMessages = [...testMessages, { type: "user", message: testInput }];
    
    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = generateTestResponse(testInput, agentConfig);
      setTestMessages(prev => [...prev, { type: "bot", message: botResponse }]);
    }, 1000);

    setTestMessages(newMessages);
    setTestInput("");
  };

  const generateTestResponse = (message: string, config: any) => {
    const responses: { [key: string]: string } = {
      'oi': `Oi! Sou ${config.nome}, como posso ajudar você hoje?`,
      'olá': `Olá! Bem-vindo! Em que posso ajudar?`,
      'pizza': 'Temos pizzas deliciosas! Qual sabor você prefere?',
      'cardápio': 'Nosso cardápio tem pizzas, bebidas e acompanhamentos. Quer que eu sugira algo?',
      'preço': 'Os preços variam de acordo com o tamanho. Quer saber o valor de alguma pizza específica?',
      'entrega': 'Fazemos entrega sim! Qual seu endereço?',
      default: 'Interessante! Como posso ajudar você com seu pedido?'
    };

    const key = Object.keys(responses).find(k => 
      message.toLowerCase().includes(k)
    );

    let response = responses[key] || responses.default;
    
    if (config.useEmojis) {
      const emojis = ['😊', '🍕', '👍', '✨'];
      response += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }

    return response;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configuração do Agente IA</h1>
                <p className="text-blue-100 text-lg">Configure a personalidade e comportamento do seu assistente virtual</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500 text-white border-0">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              Agente Ativo
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Seção 1: Personalidade */}
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                Personalidade do Agente
              </CardTitle>
              <CardDescription>
                Configure como o agente se comporta e interage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do Agente</Label>
                <Input
                  id="agent-name"
                  value={agentConfig.nome}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Maria, João, Sofia"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-tone">Tom de Voz</Label>
                <Select value={agentConfig.tom} onValueChange={(value) => setAgentConfig(prev => ({ ...prev, tom: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigavel">Amigável e Caloroso</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="casual">Casual e Descontraído</SelectItem>
                    <SelectItem value="energetico">Energético e Animado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Prompt Personalizado (Opcional)</Label>
                <Textarea
                  id="custom-prompt"
                  value={agentConfig.customPrompt}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Ex: Você é um atendente especialista em pizzas artesanais..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-emojis" 
                  checked={agentConfig.useEmojis}
                  onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, useEmojis: checked }))}
                />
                <Label htmlFor="use-emojis">Usar Emojis nas Respostas</Label>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Comportamento */}
          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-600" />
                Comportamento
              </CardTitle>
              <CardDescription>
                Defina as especialidades e configurações do agente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Especialidades do Agente</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(agentConfig.especialidades).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setAgentConfig(prev => ({ 
                            ...prev, 
                            especialidades: { ...prev.especialidades, [key]: checked } 
                          }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key === 'sugestoes' && 'Sugestões Inteligentes'}
                        {key === 'combos' && 'Ofertas de Combos'}
                        {key === 'promocoes' && 'Informar Promoções'}
                        {key === 'ingredientes' && 'Detalhes de Ingredientes'}
                        {key === 'nutricional' && 'Info. Nutricionais'}
                        {key === 'alergias' && 'Alergias e Restrições'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-time">Tempo de Resposta (s)</Label>
                  <Input
                    id="response-time"
                    type="number"
                    min="1"
                    max="10"
                    value={agentConfig.tempoResposta}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, tempoResposta: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Máx. Tentativas</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={agentConfig.maxTentativas}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, maxTentativas: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Horários */}
          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-600" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Configure quando o agente responde automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Segunda a Sexta</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="time"
                      value={agentConfig.horarios.segSex.inicio}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, segSex: { ...prev.horarios.segSex, inicio: e.target.value }}
                      }))}
                    />
                    <Input
                      type="time"
                      value={agentConfig.horarios.segSex.fim}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, segSex: { ...prev.horarios.segSex, fim: e.target.value }}
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sábado</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="time"
                      value={agentConfig.horarios.sabado.inicio}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, sabado: { ...prev.horarios.sabado, inicio: e.target.value }}
                      }))}
                    />
                    <Input
                      type="time"
                      value={agentConfig.horarios.sabado.fim}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, sabado: { ...prev.horarios.sabado, fim: e.target.value }}
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Domingo</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="time"
                      value={agentConfig.horarios.domingo.inicio}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, domingo: { ...prev.horarios.domingo, inicio: e.target.value }}
                      }))}
                    />
                    <Input
                      type="time"
                      value={agentConfig.horarios.domingo.fim}
                      onChange={(e) => setAgentConfig(prev => ({
                        ...prev,
                        horarios: { ...prev.horarios, domingo: { ...prev.horarios.domingo, fim: e.target.value }}
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="off-hours-message">Mensagem Fora do Horário</Label>
                <Textarea
                  id="off-hours-message"
                  value={agentConfig.mensagemForaHorario}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, mensagemForaHorario: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção 4: Integrações */}
          <Card className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Link className="h-5 w-5 text-orange-600" />
                Integrações
              </CardTitle>
              <CardDescription>
                Configure webhooks e canais de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook para Pedidos</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={agentConfig.webhookUrl}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://seu-sistema.com/webhook/pedidos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (se necessário)</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={agentConfig.apiKey}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Sua chave de API"
                />
              </div>

              <div className="space-y-3">
                <Label>Canais Ativos</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(agentConfig.canais).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`canal-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setAgentConfig(prev => ({ 
                            ...prev, 
                            canais: { ...prev.canais, [key]: checked } 
                          }))
                        }
                      />
                      <Label htmlFor={`canal-${key}`} className="text-sm">
                        {key === 'whatsapp' && 'WhatsApp'}
                        {key === 'telegram' && 'Telegram'}
                        {key === 'website' && 'Site/Chat Widget'}
                        {key === 'facebook' && 'Facebook Messenger'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 5: Preview do Chat */}
          <Card className="border-2 hover:border-pink-300 transition-colors xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-pink-600" />
                Preview do Agente
              </CardTitle>
              <CardDescription>
                Teste a conversa com o agente configurado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Teste a Conversa</h3>
                
                <div className="bg-white rounded-lg border max-h-64 overflow-y-auto p-4 mb-4">
                  {testMessages.map((msg, index) => (
                    <div key={index} className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Digite uma mensagem de teste..."
                    onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleTestMessage} className="bg-green-600 hover:bg-green-700">
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t mt-8">
          <div className="text-sm text-gray-600">
            Status: <span className="text-green-600 font-medium">Agente Configurado</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAgentConfig({
              nome: "Maria",
              tom: "amigavel",
              customPrompt: "",
              useEmojis: true,
              especialidades: {
                sugestoes: true,
                combos: true,
                promocoes: true,
                ingredientes: false,
                nutricional: false,
                alergias: true
              },
              tempoResposta: 3,
              maxTentativas: 5,
              horarios: {
                segSex: { inicio: "18:00", fim: "23:30" },
                sabado: { inicio: "18:00", fim: "00:00" },
                domingo: { inicio: "18:00", fim: "23:00" }
              },
              mensagemForaHorario: "Ops! Estamos fechados agora 😴 Voltamos amanhã às 18h. Quer fazer um pedido agendado?",
              webhookUrl: "",
              apiKey: "",
              canais: {
                whatsapp: true,
                telegram: false,
                website: true,
                facebook: false
              }
            })}>
              Resetar
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Testar Agente
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}