import React from 'react';
import { 
  Zap, ShieldCheck, MapPin, Phone, MessageCircle, Clock, 
  ArrowUp, ChevronRight, ArrowLeft, Bot 
} from 'lucide-react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../../utils/whatsapp';

export function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'estoque', label: 'Estoque Completo' },
    { id: 'destaques', label: 'Oportunidades & Ofertas' },
    { id: 'consultor-ia', label: 'Consultor com Inteligência Artificial' },
    { id: 'simulador', label: 'Simulador de Financiamento' },
    { id: 'troca', label: 'Troca com Troco no Pix' },
    { id: 'comparador', label: 'Comparador de Veículos' },
    { id: 'favoritos', label: 'Meus Veículos Salvos' },
    { id: 'sobre-contato', label: 'Sobre Nós & Contato' }
  ];

  return (
    <footer className="bg-[#05070d] border-t border-slate-800 pt-16 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Coluna 1: Sobre & Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
                <Zap className="w-6 h-6 fill-black" />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                DRIVENOW <span className="text-cyan-400">MOTORS</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Referência em tecnologia, transparência e financiamento facilitado para compra, venda e troca de veículos seminovos periciados.
            </p>
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs">
              <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Plataforma Inteligente com IA & Laudo 100% Cautelar</span>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida entre Páginas */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Navegação Completa</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(link.id);
                      scrollToTop();
                    }}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-900">
                <a
                  href="/sites-modelos/"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Hub de Modelos</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento & Horários */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Plantão & Atendimento</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{dealershipInfo.telefone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={buildGeneralWhatsappLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {dealershipInfo.whatsappFormatado}
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="text-white font-medium">{dealershipInfo.horarios.semana}</p>
                  <p className="text-slate-400">{dealershipInfo.horarios.sabado}</p>
                  <p className="text-emerald-400">{dealershipInfo.horarios.domingo}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Onde Estamos */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Onde Estamos</h4>
            <div className="flex items-start gap-2.5 text-xs leading-relaxed">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                {dealershipInfo.endereco.logradouro}, {dealershipInfo.endereco.bairro}<br />
                {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf} — CEP {dealershipInfo.endereco.cep}
              </p>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('sobre-contato');
                scrollToTop();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-1"
            >
              <span>Ver localização e mapa do showroom →</span>
            </button>
          </div>
        </div>

        {/* Linha Inferior com Copyright & Voltar ao Topo */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} {dealershipInfo.nome}. CNPJ: {dealershipInfo.cnpj}. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-500">DriveNow Motors — Modelo 03 (Completo)</span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
              title="Voltar ao Topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
