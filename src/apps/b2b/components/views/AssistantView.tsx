import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Leaf,
  TreePine,
  Calculator,
  FileText,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Globe,
  TrendingDown,
  Building,
  Plane
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AssistantView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! 👋 Soy tu Asistente de Sostenibilidad. Estoy aquí para ayudarte con:\n\n• **Estrategias de reducción** de huella de carbono\n• **Análisis y recomendaciones** personalizadas\n• **Información sobre proyectos** de compensación\n• **Reportes y métricas** de sostenibilidad\n• **Normativas y certificaciones** ambientales\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      suggestions: [
        '¿Cómo puedo reducir mi huella de carbono?',
        'Analiza las emisiones de mi empresa',
        '¿Qué proyectos de compensación recomiendas?',
        'Genera un reporte de sostenibilidad'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: Calculator, label: 'Calcular huella', color: 'from-blue-500 to-indigo-600' },
    { icon: TreePine, label: 'Ver proyectos', color: 'from-green-500 to-emerald-600' },
    { icon: FileText, label: 'Generar reporte', color: 'from-purple-500 to-violet-600' },
    { icon: Lightbulb, label: 'Tips de reducción', color: 'from-yellow-500 to-orange-600' },
  ];

  const generateAssistantResponse = (userMessage: string): { content: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('reducir') || lowerMessage.includes('disminuir') || lowerMessage.includes('bajar')) {
      return {
        content: `🌱 **Estrategias para reducir tu huella de carbono:**\n\n**1. Transporte**\n• Prioriza videoconferencias sobre viajes de negocios\n• Implementa políticas de trabajo remoto\n• Incentiva el uso de transporte público\n\n**2. Energía**\n• Migra a proveedores de energía renovable\n• Implementa sensores de iluminación inteligente\n• Optimiza sistemas de climatización\n\n**3. Cadena de suministro**\n• Evalúa proveedores con certificación ambiental\n• Reduce empaques y materiales desechables\n• Prioriza proveedores locales\n\n**Potencial de reducción estimado: 25-40%**\n\n¿Te gustaría que profundice en alguna de estas áreas?`,
        suggestions: [
          'Profundiza en transporte sostenible',
          'Cuéntame sobre energía renovable',
          'Evalúa mi cadena de suministro'
        ]
      };
    }
    
    if (lowerMessage.includes('proyecto') || lowerMessage.includes('compensar') || lowerMessage.includes('compensación')) {
      return {
        content: `🌳 **Proyectos de Compensación Recomendados:**\n\n**1. Reforestación Nativa Chile** 🇨🇱\n• Ubicación: Región de la Araucanía\n• Certificación: Gold Standard\n• Impacto: 15 tonCO₂/hectárea/año\n• Precio: $12 USD/tonCO₂\n\n**2. Energía Eólica Patagonia** 💨\n• Ubicación: Región de Magallanes\n• Certificación: VCS + CCB\n• Impacto: Desplaza 50,000 tonCO₂/año\n• Precio: $8 USD/tonCO₂\n\n**3. Conservación Bosque Valdiviano** 🌲\n• Ubicación: Región de Los Ríos\n• Certificación: REDD+\n• Impacto: Protege 5,000 hectáreas\n• Precio: $15 USD/tonCO₂\n\n¿Cuál te interesa conocer en detalle?`,
        suggestions: [
          'Más sobre Reforestación Nativa',
          'Detalles de Energía Eólica',
          '¿Cuánto debo compensar?'
        ]
      };
    }
    
    if (lowerMessage.includes('reporte') || lowerMessage.includes('informe') || lowerMessage.includes('métricas')) {
      return {
        content: `📊 **Generación de Reportes de Sostenibilidad:**\n\nPuedo ayudarte a crear reportes que incluyan:\n\n**📈 Métricas de emisiones**\n• Huella de carbono total (Alcance 1, 2, 3)\n• Comparativa con períodos anteriores\n• Benchmark de la industria\n\n**🎯 Cumplimiento de metas**\n• Progreso hacia objetivos SBTi\n• Alineación con ODS\n• Certificaciones obtenidas\n\n**💡 Recomendaciones**\n• Áreas de mejora identificadas\n• Plan de acción propuesto\n• Inversiones sugeridas\n\n**Formatos disponibles:** PDF, Excel, PowerPoint\n\n¿Qué tipo de reporte necesitas?`,
        suggestions: [
          'Reporte mensual de emisiones',
          'Informe para stakeholders',
          'Análisis de cumplimiento'
        ]
      };
    }
    
    if (lowerMessage.includes('analiza') || lowerMessage.includes('emisiones') || lowerMessage.includes('empresa')) {
      return {
        content: `🔍 **Análisis de Emisiones Corporativas:**\n\nBasándome en los datos de tu cuenta, aquí está el resumen:\n\n**📊 Emisiones Totales 2024**\n• Alcance 1 (directas): 45 tonCO₂e\n• Alcance 2 (energía): 120 tonCO₂e  \n• Alcance 3 (indirectas): 280 tonCO₂e\n• **Total: 445 tonCO₂e**\n\n**📈 Tendencia**\n• -12% vs año anterior ✅\n• Por encima del promedio industria (-8%)\n\n**🎯 Áreas de Oportunidad**\n1. Viajes de negocios (35% del total)\n2. Consumo eléctrico oficinas (27%)\n3. Logística y distribución (20%)\n\n**💡 Recomendación Prioritaria:**\nImplementar política de viajes sostenibles podría reducir 15% de emisiones.\n\n¿Quieres que profundice en alguna área?`,
        suggestions: [
          'Detalla viajes de negocios',
          'Plan de reducción energética',
          'Calcular meta para 2025'
        ]
      };
    }
    
    if (lowerMessage.includes('certificación') || lowerMessage.includes('normativa') || lowerMessage.includes('iso')) {
      return {
        content: `📋 **Certificaciones y Normativas Ambientales:**\n\n**Principales Certificaciones:**\n\n🏆 **ISO 14001**\n• Sistema de gestión ambiental\n• Reconocimiento internacional\n• Proceso: 6-12 meses\n\n🎯 **Science Based Targets (SBTi)**\n• Metas alineadas con Acuerdo de París\n• Cada vez más requerido por inversionistas\n• Validación: 3-6 meses\n\n🌿 **B Corp**\n• Certificación de empresa de impacto\n• Evalúa gobernanza, empleados, comunidad\n• Proceso: 6-18 meses\n\n📊 **GRI Standards**\n• Estándar para reportes de sostenibilidad\n• Más usado globalmente\n• Autodeclaración disponible\n\n¿Te interesa iniciar algún proceso de certificación?`,
        suggestions: [
          'Guía para ISO 14001',
          'Requisitos SBTi',
          'Beneficios de B Corp'
        ]
      };
    }

    // Default response
    return {
      content: `Gracias por tu consulta. Como asistente de sostenibilidad, puedo ayudarte con:\n\n• 🧮 Cálculos de huella de carbono\n• 🌳 Proyectos de compensación\n• 📊 Análisis de emisiones\n• 📋 Reportes y certificaciones\n• 💡 Estrategias de reducción\n\n¿Podrías darme más detalles sobre lo que necesitas?`,
      suggestions: [
        'Calcular mis emisiones',
        'Ver proyectos disponibles',
        'Estrategias de reducción'
      ]
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAssistantResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: '¡Hola! 👋 Soy tu Asistente de Sostenibilidad. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      suggestions: [
        '¿Cómo puedo reducir mi huella de carbono?',
        'Analiza las emisiones de mi empresa',
        '¿Qué proyectos de compensación recomiendas?'
      ]
    }]);
  };

  return (
    <div className="!h-[calc(100vh-200px)] !flex !flex-col">
      {/* Header */}
      <div className="!flex !items-center !justify-between !mb-4">
        <div className="!flex !items-center !gap-3">
          <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center !shadow-lg !shadow-green-500/30">
            <Bot className="!w-6 !h-6 !text-white" />
          </div>
          <div>
            <h1 className={`!text-xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Asistente IA de Sostenibilidad</h1>
            <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Tu consultor experto en huella de carbono</p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !font-medium !transition-colors !border-0 ${isDark ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-300' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-600'}`}
        >
          <RotateCcw className="!w-4 !h-4" />
          <span className="!hidden sm:!inline">Nueva conversación</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="!flex !gap-2 !overflow-x-auto !pb-3 !mb-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(action.label)}
            className={`!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-xl !text-white !font-medium !whitespace-nowrap !bg-gradient-to-r ${action.color} !shadow-md hover:!shadow-lg !transition-all !border-0`}
          >
            <action.icon className="!w-4 !h-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className={`!flex-1 !rounded-2xl !border !shadow-xl !flex !flex-col !overflow-hidden ${isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'}`}>
        {/* Messages */}
        <div className="!flex-1 !overflow-y-auto !p-4 !space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`!flex !gap-3 ${message.type === 'user' ? '!flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !flex-shrink-0 ${
                  message.type === 'assistant' 
                    ? '!bg-gradient-to-br !from-green-500 !to-emerald-600' 
                    : '!bg-gradient-to-br !from-blue-500 !to-indigo-600'
                }`}>
                  {message.type === 'assistant' ? (
                    <Sparkles className="!w-5 !h-5 !text-white" />
                  ) : (
                    <User className="!w-5 !h-5 !text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`!flex-1 !max-w-[80%] ${message.type === 'user' ? '!text-right' : ''}`}>
                  <div className={`!inline-block !px-4 !py-3 !rounded-2xl ${
                    message.type === 'assistant'
                      ? isDark 
                        ? '!bg-gray-700 !text-gray-100 !rounded-tl-none'
                        : '!bg-gray-100 !text-gray-800 !rounded-tl-none'
                      : '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-tr-none'
                  }`}>
                    <div 
                      className="!text-sm !whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }} 
                    />
                  </div>

                  {/* Suggestions */}
                  {message.type === 'assistant' && message.suggestions && (
                    <div className="!flex !flex-wrap !gap-2 !mt-3">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`!px-3 !py-1.5 !border !rounded-lg !text-xs !transition-colors ${isDark ? '!bg-gray-700 !border-gray-600 !text-gray-300 hover:!bg-green-900/30 hover:!border-green-600 hover:!text-green-400' : '!bg-white !border-gray-200 !text-gray-600 hover:!bg-green-50 hover:!border-green-300 hover:!text-green-700'}`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Actions for Assistant */}
                  {message.type === 'assistant' && message.id !== '1' && (
                    <div className="!flex !items-center !gap-2 !mt-2">
                      <button className="!p-1.5 !text-gray-400 hover:!text-gray-600 !transition-colors !border-0 !bg-transparent">
                        <Copy className="!w-4 !h-4" />
                      </button>
                      <button className="!p-1.5 !text-gray-400 hover:!text-green-600 !transition-colors !border-0 !bg-transparent">
                        <ThumbsUp className="!w-4 !h-4" />
                      </button>
                      <button className="!p-1.5 !text-gray-400 hover:!text-red-600 !transition-colors !border-0 !bg-transparent">
                        <ThumbsDown className="!w-4 !h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="!flex !gap-3"
            >
              <div className="!w-9 !h-9 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center">
                <Sparkles className="!w-5 !h-5 !text-white" />
              </div>
              <div className={`!rounded-2xl !rounded-tl-none !px-4 !py-3 ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>
                <div className="!flex !gap-1">
                  <span className={`!w-2 !h-2 !rounded-full !animate-bounce ${isDark ? '!bg-gray-500' : '!bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                  <span className={`!w-2 !h-2 !rounded-full !animate-bounce ${isDark ? '!bg-gray-500' : '!bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`!w-2 !h-2 !rounded-full !animate-bounce ${isDark ? '!bg-gray-500' : '!bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`!p-4 !border-t ${isDark ? '!border-gray-700 !bg-gray-800/50' : '!border-gray-200 !bg-gray-50'}`}>
          <div className="!flex !items-center !gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta sobre sostenibilidad..."
              className={`!flex-1 !px-4 !py-3 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none ${isDark ? '!bg-gray-700 !border-gray-600 !text-gray-100 placeholder:!text-gray-500' : '!bg-white !border-gray-200 !text-gray-900'}`}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="!p-3 !bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 disabled:!opacity-50 disabled:!cursor-not-allowed !text-white !rounded-xl !transition-all !border-0 !shadow-lg !shadow-green-500/30"
            >
              <Send className="!w-5 !h-5" />
            </button>
          </div>
          <p className="!text-xs !text-gray-400 !text-center !mt-2">
            El asistente puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;
