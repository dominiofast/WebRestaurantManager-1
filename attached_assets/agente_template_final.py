# app.py - Template do Agente IA (CORRIGIDO)
from flask import Flask, render_template_string, request, jsonify
import json
import os
from datetime import datetime, time
import openai

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'

# Configurar OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

CONFIG_FILE = 'agent_config.json'

DEFAULT_CONFIG = {
    "restaurante": {
        "nome": "Meu Restaurante",
        "telefone": "(11) 99999-9999",
        "endereco": "Rua Principal, 123 - Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "link_cardapio": "https://cardapio.meurestaurante.com",
        "delivery": True,
        "retirada": True,
        "zona_entrega": "Centro, Vila Madalena, Pinheiros",
        "taxa_entrega": 5.00,
        "tempo_entrega": "45-60 minutos",
        "formas_pagamento": "Dinheiro, Cartão, PIX",
        "promocoes_ativas": [
            "Terças: 2 pizzas pelo preço de 1",
            "Combo Família: Pizza + Refri 2L por R$ 45"
        ]
    },
    "personalidade": {
        "nome": "Maria",
        "tom": "amigavel",
        "prompt_personalizado": "",
        "usar_emojis": True
    },
    "comportamento": {
        "especialidades": {
            "sugestoes": True,
            "combos": True,
            "promocoes": True,
            "ingredientes": False,
            "nutricional": False,
            "alergias": True,
            "informacoes_restaurante": True
        },
        "tempo_resposta": 3,
        "enviar_cardapio_automatico": True
    },
    "horario": {
        "segunda": {"ativo": True, "inicio": "18:00", "fim": "23:30"},
        "terca": {"ativo": True, "inicio": "18:00", "fim": "23:30"},
        "quarta": {"ativo": True, "inicio": "18:00", "fim": "23:30"},
        "quinta": {"ativo": True, "inicio": "18:00", "fim": "23:30"},
        "sexta": {"ativo": True, "inicio": "18:00", "fim": "23:30"},
        "sabado": {"ativo": True, "inicio": "18:00", "fim": "00:00"},
        "domingo": {"ativo": True, "inicio": "18:00", "fim": "23:00"},
        "mensagem_fechado": "Ops! Estamos fechados agora 😴",
        "mensagem_nao_funciona": "Hoje não estamos funcionando 😔"
    }
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                for key in DEFAULT_CONFIG:
                    if key not in config:
                        config[key] = DEFAULT_CONFIG[key]
                return config
        except:
            return DEFAULT_CONFIG.copy()
    return DEFAULT_CONFIG.copy()

def save_config(config):
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar config: {e}")
        return False

def get_current_day_name():
    dias = {0: "segunda", 1: "terca", 2: "quarta", 3: "quinta", 4: "sexta", 5: "sabado", 6: "domingo"}
    return dias[datetime.now().weekday()]

def get_next_opening(config):
    now = datetime.now()
    current_day = now.weekday()
    dias_nomes = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
    dias_display = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"]
    
    for i in range(1, 8):
        day_index = (current_day + i) % 7
        day_name = dias_nomes[day_index]
        day_display = dias_display[day_index]
        horario = config['horario'].get(day_name, {})
        
        if horario.get('ativo', False):
            if i == 1:
                return f"amanhã ({day_display}) às {horario['inicio']}"
            elif i <= 6:
                return f"{day_display} às {horario['inicio']}"
    return "em breve"

def is_restaurant_open(config):
    now = datetime.now()
    current_time = now.time()
    current_day = get_current_day_name()
    horario = config['horario'].get(current_day, {})
    
    if not horario.get('ativo', False):
        next_opening = get_next_opening(config)
        return {
            'open': False,
            'reason': 'closed_today',
            'message': f"{config['horario']['mensagem_nao_funciona']} Voltamos {next_opening}!"
        }
    
    inicio = time.fromisoformat(horario['inicio'])
    fim = time.fromisoformat(horario['fim'])
    
    is_open = False
    if fim < inicio:  # Passa da meia-noite
        is_open = current_time >= inicio or current_time <= fim
    else:
        is_open = inicio <= current_time <= fim
    
    if is_open:
        return {'open': True, 'reason': 'open', 'message': f"Estamos abertos até às {horario['fim']}! 😊"}
    else:
        if current_time < inicio:
            return {'open': False, 'reason': 'not_yet_open', 'message': f"{config['horario']['mensagem_fechado']} Abrimos hoje às {horario['inicio']}!"}
        else:
            next_opening = get_next_opening(config)
            return {'open': False, 'reason': 'closed', 'message': f"{config['horario']['mensagem_fechado']} Voltamos {next_opening}!"}

def generate_test_response(message, config):
    nome = config['personalidade']['nome']
    restaurante = config['restaurante']
    status = is_restaurant_open(config)
    
    if not status['open']:
        return status['message']
    
    responses = {
        'oi': f"Oi! Sou {nome} do {restaurante['nome']}! Como posso ajudar?",
        'olá': f"Olá! Bem-vindo ao {restaurante['nome']}! Em que posso ajudar?",
        'cardápio': f"Nosso cardápio: {restaurante['link_cardapio']} 📋 Posso sugerir algo?",
        'cardapio': f"Menu completo: {restaurante['link_cardapio']} 🍕 O que te interessa?",
        'menu': f"Menu completo: {restaurante['link_cardapio']} 🍕 O que te interessa?",
        'pizza': f"Temos pizzas deliciosas! Veja: {restaurante['link_cardapio']} Qual sabor?",
        'promoção': f"Promoções: {' | '.join(restaurante['promocoes_ativas'])} 🎉",
        'promocao': f"Promoções: {' | '.join(restaurante['promocoes_ativas'])} 🎉",
        'entrega': f"Entregamos em: {restaurante['zona_entrega']}. Taxa: R$ {restaurante['taxa_entrega']:.2f}. Tempo: {restaurante['tempo_entrega']}",
        'telefone': f"Telefone: {restaurante['telefone']} 📞",
        'endereço': f"Endereço: {restaurante['endereco']} 📍",
        'endereco': f"Endereço: {restaurante['endereco']} 📍",
        'horário': f"Hoje: {config['horario'][get_current_day_name()]['inicio']} às {config['horario'][get_current_day_name()]['fim']} ⏰",
        'horario': f"Hoje: {config['horario'][get_current_day_name()]['inicio']} às {config['horario'][get_current_day_name()]['fim']} ⏰",
        'pagamento': f"Aceitamos: {restaurante['formas_pagamento']} 💳"
    }
    
    for key, value in responses.items():
        if key in message.lower():
            return value
    
    return f"Veja nosso cardápio: {restaurante['link_cardapio']} 📋 Como posso ajudar?"

# Template HTML embutido (corrigido)
CONFIG_TEMPLATE = '''
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuração do Agente IA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: #4f46e5; color: white; border-radius: 8px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .section h3 { margin-bottom: 15px; color: #374151; border-bottom: 2px solid #4f46e5; padding-bottom: 5px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; color: #374151; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 14px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #4f46e5; }
        textarea { height: 80px; resize: vertical; }
        .checkbox-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 5px; }
        .checkbox-item:hover { background: #f9fafb; }
        .horario-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .horario-item { border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; }
        .horario-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .btn { padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; margin: 5px; }
        .btn-primary { background: #4f46e5; color: white; }
        .btn-secondary { background: #6b7280; color: white; }
        .btn-success { background: #10b981; color: white; }
        .btn:hover { opacity: 0.9; }
        .chat-preview { height: 200px; border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; overflow-y: auto; background: #f9fafb; margin-bottom: 10px; }
        .message { margin-bottom: 10px; padding: 8px 12px; border-radius: 10px; max-width: 80%; }
        .message.bot { background: #4f46e5; color: white; margin-right: auto; }
        .message.user { background: #e5e7eb; color: #333; margin-left: auto; }
        .alert { padding: 10px; border-radius: 5px; margin-bottom: 15px; display: none; }
        .alert-success { background: #d1fae5; border: 1px solid #10b981; color: #065f46; }
        .alert-error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
        .promocao-item { display: flex; gap: 10px; margin-bottom: 10px; }
        .promocao-item input { flex: 1; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } .container { padding: 15px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Configuração do Agente IA</h1>
            <p>Configure seu assistente virtual para restaurante</p>
        </div>

        <div id="alertContainer"></div>

        <form id="agentForm">
            <!-- Restaurante -->
            <div class="section">
                <h3>🏪 Informações do Restaurante</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Restaurante *</label>
                        <input type="text" id="restauranteName" value="{{ config.restaurante.nome }}" required>
                    </div>
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="restauranteTelefone" value="{{ config.restaurante.telefone }}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Endereço Completo *</label>
                    <input type="text" id="restauranteEndereco" value="{{ config.restaurante.endereco }}" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Link do Cardápio Digital *</label>
                        <input type="url" id="restauranteLinkCardapio" value="{{ config.restaurante.link_cardapio }}" required>
                    </div>
                    <div class="form-group">
                        <label>Zona de Entrega</label>
                        <input type="text" id="restauranteZonaEntrega" value="{{ config.restaurante.zona_entrega }}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Taxa de Entrega (R$)</label>
                        <input type="number" id="restauranteTaxaEntrega" value="{{ config.restaurante.taxa_entrega }}" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Tempo de Entrega</label>
                        <input type="text" id="restauranteTempoEntrega" value="{{ config.restaurante.tempo_entrega }}">
                    </div>
                </div>

                <div class="form-group">
                    <label>Formas de Pagamento</label>
                    <input type="text" id="restauranteFormasPagamento" value="{{ config.restaurante.formas_pagamento }}">
                </div>

                <div class="form-group">
                    <label>Promoções Ativas</label>
                    <div id="promocoesList">
                        {% for promocao in config.restaurante.promocoes_ativas %}
                        <div class="promocao-item">
                            <input type="text" value="{{ promocao }}">
                            <button type="button" class="btn btn-secondary" onclick="removePromocao(this)">X</button>
                        </div>
                        {% endfor %}
                    </div>
                    <button type="button" class="btn btn-secondary" onclick="addPromocao()">+ Adicionar</button>
                </div>
            </div>

            <!-- Personalidade -->
            <div class="section">
                <h3>👤 Personalidade do Agente</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Agente *</label>
                        <input type="text" id="agentName" value="{{ config.personalidade.nome }}" required>
                    </div>
                    <div class="form-group">
                        <label>Tom de Voz</label>
                        <select id="agentTone">
                            <option value="amigavel" {% if config.personalidade.tom == 'amigavel' %}selected{% endif %}>Amigável</option>
                            <option value="profissional" {% if config.personalidade.tom == 'profissional' %}selected{% endif %}>Profissional</option>
                            <option value="casual" {% if config.personalidade.tom == 'casual' %}selected{% endif %}>Casual</option>
                            <option value="energetico" {% if config.personalidade.tom == 'energetico' %}selected{% endif %}>Energético</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Prompt Personalizado (Opcional)</label>
                    <textarea id="customPrompt">{{ config.personalidade.prompt_personalizado }}</textarea>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="useEmojis" {% if config.personalidade.usar_emojis %}checked{% endif %}>
                        Usar Emojis nas Respostas
                    </label>
                </div>
            </div>

            <!-- Comportamento -->
            <div class="section">
                <h3>⚙️ Comportamento</h3>
                
                <div class="form-group">
                    <label>Especialidades do Agente</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" id="sugestoes" {% if config.comportamento.especialidades.sugestoes %}checked{% endif %}>
                            <label for="sugestoes">Sugestões Inteligentes</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="combos" {% if config.comportamento.especialidades.combos %}checked{% endif %}>
                            <label for="combos">Ofertas de Combos</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="promocoes" {% if config.comportamento.especialidades.promocoes %}checked{% endif %}>
                            <label for="promocoes">Informar Promoções</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="alergias" {% if config.comportamento.especialidades.alergias %}checked{% endif %}>
                            <label for="alergias">Alergias e Restrições</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="informacoesRestaurante" {% if config.comportamento.especialidades.informacoes_restaurante %}checked{% endif %}>
                            <label for="informacoesRestaurante">Info do Restaurante</label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Horário -->
            <div class="section">
                <h3>🕒 Horário de Funcionamento</h3>
                
                <div class="horario-grid">
                    {% set dias = [('segunda', 'Segunda'), ('terca', 'Terça'), ('quarta', 'Quarta'), ('quinta', 'Quinta'), ('sexta', 'Sexta'), ('sabado', 'Sábado'), ('domingo', 'Domingo')] %}
                    
                    {% for dia_key, dia_nome in dias %}
                    <div class="horario-item">
                        <div class="horario-header">
                            <strong>{{ dia_nome }}</strong>
                            <input type="checkbox" id="{{ dia_key }}Ativo" {% if config.horario[dia_key].ativo %}checked{% endif %}>
                        </div>
                        <div id="{{ dia_key }}Controls">
                            <div class="form-row">
                                <input type="time" id="{{ dia_key }}Inicio" value="{{ config.horario[dia_key].inicio }}">
                                <input type="time" id="{{ dia_key }}Fim" value="{{ config.horario[dia_key].fim }}">
                            </div>
                        </div>
                    </div>
                    {% endfor %}
                </div>

                <div class="form-row" style="margin-top: 20px;">
                    <div class="form-group">
                        <label>Mensagem Quando Fechado</label>
                        <textarea id="mensagemFechado">{{ config.horario.mensagem_fechado }}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Mensagem Quando Não Funciona</label>
                        <textarea id="mensagemNaoFunciona">{{ config.horario.mensagem_nao_funciona }}</textarea>
                    </div>
                </div>
            </div>

            <!-- Teste -->
            <div class="section">
                <h3>🧪 Teste do Agente</h3>
                
                <div class="chat-preview" id="chatPreview">
                    <div class="message bot">Olá! Bem-vindo ao {{ config.restaurante.nome }}! Sou {{ config.personalidade.nome }} e estou aqui para ajudar. O que vai querer hoje?</div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="testMessage" placeholder="Digite uma mensagem..." style="flex: 1;">
                    <button type="button" class="btn btn-success" onclick="sendTestMessage()">Enviar</button>
                </div>
                
                <div style="margin-top: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="testQuickMessage('oi')">Teste: Oi</button>
                    <button type="button" class="btn btn-secondary" onclick="testQuickMessage('cardápio')">Teste: Cardápio</button>
                    <button type="button" class="btn btn-secondary" onclick="testQuickMessage('promoção')">Teste: Promoção</button>
                    <button type="button" class="btn btn-secondary" onclick="testQuickMessage('entrega')">Teste: Entrega</button>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <button type="button" class="btn btn-secondary" onclick="resetForm()">Resetar</button>
                <button type="submit" class="btn btn-primary">Salvar Configurações</button>
            </div>
        </form>
    </div>

    <script>
        function addPromocao() {
            try {
                const list = document.getElementById('promocoesList');
                if (!list) return;
                
                const div = document.createElement('div');
                div.className = 'promocao-item';
                div.innerHTML = '<input type="text" placeholder="Nova promoção"><button type="button" class="btn btn-secondary" onclick="removePromocao(this)">X</button>';
                list.appendChild(div);
            } catch (error) {
                console.error('Erro ao adicionar promoção:', error);
            }
        }

        function removePromocao(button) {
            try {
                if (button && button.parentElement) {
                    button.parentElement.remove();
                }
            } catch (error) {
                console.error('Erro ao remover promoção:', error);
            }
        }

        function collectConfig() {
            try {
                const promocoesInputs = document.querySelectorAll('#promocoesList input');
                const promocoes = Array.from(promocoesInputs).map(input => input.value).filter(value => value.trim() !== '');

                return {
                    restaurante: {
                        nome: getValue('restauranteName'),
                        telefone: getValue('restauranteTelefone'),
                        endereco: getValue('restauranteEndereco'),
                        link_cardapio: getValue('restauranteLinkCardapio'),
                        zona_entrega: getValue('restauranteZonaEntrega'),
                        taxa_entrega: parseFloat(getValue('restauranteTaxaEntrega')) || 0,
                        tempo_entrega: getValue('restauranteTempoEntrega'),
                        formas_pagamento: getValue('restauranteFormasPagamento'),
                        promocoes_ativas: promocoes,
                        delivery: true,
                        retirada: true
                    },
                    personalidade: {
                        nome: getValue('agentName'),
                        tom: getValue('agentTone'),
                        prompt_personalizado: getValue('customPrompt'),
                        usar_emojis: getChecked('useEmojis')
                    },
                    comportamento: {
                        especialidades: {
                            sugestoes: getChecked('sugestoes'),
                            combos: getChecked('combos'),
                            promocoes: getChecked('promocoes'),
                            ingredientes: false,
                            nutricional: false,
                            alergias: getChecked('alergias'),
                            informacoes_restaurante: getChecked('informacoesRestaurante')
                        },
                        tempo_resposta: 3,
                        enviar_cardapio_automatico: true
                    },
                    horario: {
                        segunda: { ativo: getChecked('segundaAtivo'), inicio: getValue('segundaInicio'), fim: getValue('segundaFim') },
                        terca: { ativo: getChecked('tercaAtivo'), inicio: getValue('tercaInicio'), fim: getValue('tercaFim') },
                        quarta: { ativo: getChecked('quartaAtivo'), inicio: getValue('quartaInicio'), fim: getValue('quartaFim') },
                        quinta: { ativo: getChecked('quintaAtivo'), inicio: getValue('quintaInicio'), fim: getValue('quintaFim') },
                        sexta: { ativo: getChecked('sextaAtivo'), inicio: getValue('sextaInicio'), fim: getValue('sextaFim') },
                        sabado: { ativo: getChecked('sabadoAtivo'), inicio: getValue('sabadoInicio'), fim: getValue('sabadoFim') },
                        domingo: { ativo: getChecked('domingoAtivo'), inicio: getValue('domingoInicio'), fim: getValue('domingoFim') },
                        mensagem_fechado: getValue('mensagemFechado'),
                        mensagem_nao_funciona: getValue('mensagemNaoFunciona')
                    }
                };
            } catch (error) {
                console.error('Erro ao coletar configuração:', error);
                return null;
            }
        }

        function getValue(id) {
            const el = document.getElementById(id);
            return el ? el.value : '';
        }

        function getChecked(id) {
            const el = document.getElementById(id);
            return el ? el.checked : false;
        }

        function sendTestMessage() {
            try {
                const messageInput = document.getElementById('testMessage');
                if (!messageInput) return;
                
                const message = messageInput.value.trim();
                if (!message) return;
                
                testQuickMessage(message);
                messageInput.value = '';
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }

        function testQuickMessage(message) {
            try {
                const chatPreview = document.getElementById('chatPreview');
                if (!chatPreview) return;
                
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.textContent = message;
                chatPreview.appendChild(userMessage);

                fetch('/api/test-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({message: message})
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    const botMessage = document.createElement('div');
                    botMessage.className = 'message bot';
                    botMessage.textContent = data.response || 'Erro na resposta';
                    chatPreview.appendChild(botMessage);
                    chatPreview.scrollTop = chatPreview.scrollHeight;
                })
                .catch(error => {
                    console.error('Erro:', error);
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'message bot';
                    errorMessage.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
                    chatPreview.appendChild(errorMessage);
                });
            } catch (error) {
                console.error('Erro no teste:', error);
            }
        }

        function showAlert(message, type = 'success') {
            try {
                const alertContainer = document.getElementById('alertContainer');
                if (!alertContainer) return;
                
                const alert = document.createElement('div');
                alert.className = `alert alert-${type}`;
                alert.textContent = message;
                alert.style.display = 'block';
                alertContainer.innerHTML = '';
                alertContainer.appendChild(alert);
                setTimeout(() => { alert.style.display = 'none'; }, 3000);
            } catch (error) {
                console.error('Erro ao mostrar alerta:', error);
            }
        }

        function resetForm() {
            if (confirm('Resetar todas as configurações?')) {
                location.reload();
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            try {
                const form = document.getElementById('agentForm');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const config = collectConfig();
                        
                        if (!config) {
                            showAlert('Erro ao coletar configurações', 'error');
                            return;
                        }
                        
                        fetch('/api/save-config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Erro na resposta: ' + response.status);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                showAlert('Configurações salvas com sucesso!', 'success');
                            } else {
                                showAlert(data.error || 'Erro ao salvar', 'error');
                            }
                        })
                        .catch(error => {
                            console.error('Erro:', error);
                            showAlert('Erro de conexão ao salvar', 'error');
                        });
                    });
                }

                const testInput = document.getElementById('testMessage');
                if (testInput) {
                    testInput.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            sendTestMessage();
                        }
                    });
                }
            } catch (error) {
                console.error('Erro na inicialização:', error);
            }
        });
    </script>
</body>
</html>
'''

# ROTAS
@app.route('/')
def index():
    return '''
    <h1>🤖 Agente IA</h1>
    <p><a href="/config">⚙️ Configurar</a></p>
    <p><a href="/teste">🧪 Testar</a></p>
    '''

@app.route('/config')
def config_agent():
    current_config = load_config()
    return render_template_string(CONFIG_TEMPLATE, config=current_config)

@app.route('/api/save-config', methods=['POST'])
def save_agent_config():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Dados não recebidos"}), 400
            
        if not data.get('personalidade', {}).get('nome'):
            return jsonify({"success": False, "error": "Nome do agente obrigatório"}), 400
        if not data.get('restaurante', {}).get('nome'):
            return jsonify({"success": False, "error": "Nome do restaurante obrigatório"}), 400
        
        if save_config(data):
            return jsonify({"success": True, "message": "Configuração salva!"})
        else:
            return jsonify({"success": False, "error": "Erro ao salvar"}), 500
    except Exception as e:
        print(f"Erro save_config: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/test-agent', methods=['POST'])
def test_agent():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Dados não recebidos"}), 400
            
        message = data.get('message', '').lower()
        config = load_config()
        response = generate_test_response(message, config)
        return jsonify({"success": True, "response": response})
    except Exception as e:
        print(f"Erro test_agent: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/status')
def restaurant_status():
    try:
        config = load_config()
        status = is_restaurant_open(config)
        return jsonify({
            'current_time': datetime.now().strftime('%H:%M'),
            'current_day': get_current_day_name(),
            'status': status,
            'restaurant_info': config['restaurante']
        })
    except Exception as e:
        print(f"Erro status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/teste')
def test_page():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Teste Agente IA</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            .chat-box { height: 400px; border: 1px solid #ddd; padding: 20px; overflow-y: auto; margin: 20px 0; background: #fafafa; }
            .message { margin: 10px 0; padding: 10px; border-radius: 10px; }
            .user { background: #007bff; color: white; text-align: right; }
            .bot { background: #e9ecef; color: #333; }
            input[type="text"] { width: 70%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Teste do Agente IA</h1>
            <div class="chat-box" id="chatBox"></div>
            <div>
                <input type="text" id="messageInput" placeholder="Digite sua mensagem..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()">Enviar</button>
                <button onclick="clearChat()">Limpar</button>
            </div>
            <p><small>💡 Teste: "oi", "cardápio", "promoção", "entrega", "horário"</small></p>
        </div>
        
        <script>
            function addMessage(message, isUser) {
                const chatBox = document.getElementById('chatBox');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + (isUser ? 'user' : 'bot');
                messageDiv.textContent = message;
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                if (!message) return;
                
                addMessage(message, true);
                input.value = '';
                
                fetch('/api/test-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        addMessage(data.response, false);
                    } else {
                        addMessage('Erro: ' + data.error, false);
                    }
                })
                .catch(error => {
                    addMessage('Erro de conexão: ' + error.message, false);
                });
            }
            
            function handleKeyPress(event) {
                if (event.key === 'Enter') { sendMessage(); }
            }
            
            function clearChat() {
                document.getElementById('chatBox').innerHTML = '';
            }
            
            // Mensagem inicial
            addMessage('Olá! Sou seu agente IA. Como posso ajudar?', false);
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    print("🤖 Agente IA iniciado!")
    print("⚙️ Configure: http://localhost:5000/config")
    print("🧪 Teste: http://localhost:5000/teste")
    
    app.run(debug=True, host='0.0.0.0', port=5000)