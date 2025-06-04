import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Settings, Save, MessageCircle, Activity } from "lucide-react";

export default function AIAgentSimple() {
  const [agentConfig, setAgentConfig] = useState({
    nome: "Assistente",
    tom: "amigavel",
    customPrompt: "",
    useEmojis: true,
    isActive: true
  });

  const [testMessages, setTestMessages] = useState([
    {
      type: "bot",
      message: "Olá! Sou seu assistente virtual. Como posso ajudar você hoje?"
    }
  ]);
  const [testInput, setTestInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-agent-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setAgentConfig(config);
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Save to localStorage
    localStorage.setItem('ai-agent-config', JSON.stringify(agentConfig));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

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

    let response = responses[key || 'default'] || responses.default;
    
    if (config.useEmojis) {
      const emojis = ['😊', '🍕', '👍', '✨'];
      response += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }

    return response;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agente de IA</h1>
                <p className="text-gray-600">Configure seu assistente virtual</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={agentConfig.isActive ? "default" : "secondary"} className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${agentConfig.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span>{agentConfig.isActive ? 'Ativo' : 'Inativo'}</span>
              </Badge>
              <Button 
                onClick={handleSave} 
                disabled={saveStatus === 'saving'} 
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {saveStatus === 'saving' ? 'Salvando...' : 
                   saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Configuração Básica */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuração Básica</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agent-name" className="text-sm">Nome do Agente</Label>
                    <Input
                      id="agent-name"
                      value={agentConfig.nome}
                      onChange={(e) => setAgentConfig(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Maria, João"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent-tone" className="text-sm">Tom de Voz</Label>
                    <Select value={agentConfig.tom} onValueChange={(value) => setAgentConfig(prev => ({ ...prev, tom: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amigavel">Amigável</SelectItem>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="energetico">Energético</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-prompt" className="text-sm">Personalização (Opcional)</Label>
                  <Textarea
                    id="custom-prompt"
                    value={agentConfig.customPrompt}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="Ex: Você é especialista em pizzas artesanais..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use-emojis" 
                      checked={agentConfig.useEmojis}
                      onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, useEmojis: checked }))}
                    />
                    <Label htmlFor="use-emojis" className="text-sm">Usar Emojis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is-active" 
                      checked={agentConfig.isActive}
                      onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="is-active" className="text-sm">Agente Ativo</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Conversas Hoje</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-gray-600">Taxa Sucesso</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">2.3s</div>
                    <div className="text-sm text-gray-600">Tempo Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teste do Agente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Teste do Agente</span>
              </CardTitle>
              <CardDescription>
                Teste como o agente responde às mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                  {testMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border text-gray-900'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleTestMessage} size="sm">
                    Enviar
                  </Button>
                </div>

                {/* Sugestões */}
                <div className="flex flex-wrap gap-2">
                  {['Oi', 'Cardápio', 'Preços', 'Entrega'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestInput(suggestion);
                        setTimeout(() => handleTestMessage(), 100);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}