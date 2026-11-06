import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RotateCcw, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function AIChatBox({ vehicles = [], onSelectVehicle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Olá! Sou o Consultor Virtual com Inteligência Artificial da DriveNow. Posso te ajudar a encontrar o veículo ideal pelo seu orçamento, tipo de uso ou comparar custos de manutenção. O que você procura hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'Qual o SUV mais econômico do estoque?',
    'Carros com parcelas de até R$ 2.000?',
    'Qual carro tem menor custo anual (TCO)?',
    'Como funciona o Laudo Cautelar Digital?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let responseText = '';
      let recommendedCars = [];

      if (lower.includes('suv') || lower.includes('econômico') || lower.includes('economico')) {
        recommendedCars = vehicles.filter(v => v.categoria === 'suv').slice(0, 2);
        responseText = `Analisando nossa base de dados e os laudos periciais, os SUVs com melhor equilíbrio de consumo e confiabilidade são o **${recommendedCars[0]?.nome}** (faz até 13,5 km/l na estrada) e o **${recommendedCars[1]?.nome}**. Veja os detalhes abaixo:`;
      } else if (lower.includes('parcela') || lower.includes('2000') || lower.includes('2.000') || lower.includes('barato')) {
        recommendedCars = vehicles.filter(v => v.parcela && v.parcela.valor <= 2000).slice(0, 2);
        responseText = `Temos excelentes opções com parcelas a partir de ${formatCurrency(recommendedCars[0]?.parcela?.valor || 1790)}/mês e aprovação rápida em até 15 minutos:`;
      } else if (lower.includes('tco') || lower.includes('manutenção') || lower.includes('custo')) {
        recommendedCars = vehicles.slice(0, 2);
        responseText = `Pelo nosso algoritmo de TCO (Custo Total de Propriedade), os veículos mais acessíveis no somatório de IPVA, combustível anual e seguro são os modelos 1.0 Turbo como o **${recommendedCars[0]?.nome}**.`;
      } else if (lower.includes('laudo') || lower.includes('cautelar') || lower.includes('garantia')) {
        responseText = `Todos os veículos da DriveNow possuem **Laudo Cautelar 100% Aprovado**, sem sinistro ou leilão, e contam com **1 ano de garantia total** de câmbio e motor válida em todo o Brasil.`;
      } else {
        recommendedCars = vehicles.slice(0, 2);
        responseText = `Compreendi! Encontrei estas recomendações que combinam com alto índice de satisfação dos nossos clientes e laudo 100% aprovado:`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          cars: recommendedCars
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-[560px] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl overflow-hidden">
      {/* Header do Chat */}
      <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm sm:text-base font-bold text-white">DriveNow AI Consultant</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Inteligência Artificial conectada ao estoque em tempo real</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ id: 1, sender: 'ai', text: 'Chat reiniciado! Como posso ajudar você a escolher o seu seminovo hoje?' }])}
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
          title="Reiniciar conversa"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Área de Mensagens com Scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-3 ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-sm p-3.5 text-xs sm:text-sm shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm leading-relaxed shadow-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Cards de Veículos Recomendados dentro do Chat */}
              {msg.cars && msg.cars.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {msg.cars.map(c => (
                    <div 
                      key={c.id} 
                      className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400 transition-all cursor-pointer group"
                      onClick={() => onSelectVehicle && onSelectVehicle(c)}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase">{c.categoria}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.ano}</span>
                        </div>
                        <h4 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors line-clamp-1">{c.nome}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatCurrency(c.preco)}</p>
                      </div>
                      <span className="text-[10px] text-cyan-400 flex items-center gap-1 mt-2 pt-1 border-t border-slate-800">
                        <span>Ver detalhes & laudo</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-2xl w-fit">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>DriveNow AI está consultando o estoque...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dúvidas Rápidas Sugeridas */}
      <div className="p-2 sm:px-6 bg-slate-950/80 border-t border-slate-900 flex gap-1.5 overflow-x-auto">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Campo de Envio */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Pergunte sobre orçamento, consumo, TCO ou modelo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold text-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
