import React from 'react';
import { 
  Car, ShieldCheck, MapPin, Phone, Mail, Clock, 
  ArrowUp, MessageCircle, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../../utils/whatsapp';

export function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Página Inicial' },
    { id: 'estoque', label: 'Estoque Completo' },
    { id: 'destaques', label: 'Destaques da Semana' },
    { id: 'sobre-contato', label: 'Sobre Nós & Contato' }
  ];

  return (
    <footer className="bg-[#05080f] border-t border-slate-800/80 pt-16 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Coluna 1: Sobre & Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Car className="w-6 h-6" />
              </div>
              <span className="font-heading font-black text-xl text-white">
                AutoElite <span className="text-blue-500">MOTORS</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Referência em compra, venda e troca de veículos seminovos periciados e revisados. Segurança absoluta para você e sua família.
            </p>
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% do estoque com Laudo Cautelar Aprovado</span>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida entre Páginas */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Páginas do Site</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(link.id);
                      scrollToTop();
                    }}
                    className="flex items-center gap-1.5 hover:text-blue-400 transition-colors text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-900">
                <a
                  href="/sites-modelos/"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Hub de Modelos</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento & Horários */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Atendimento & Horários</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
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
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="text-white font-medium">Seg a Sex: 08:30 às 18:30</p>
                  <p className="text-slate-400">Sábado: 08:30 às 15:00</p>
                  <p className="text-emerald-400">Domingo: Plantão Online</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Localização Física */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base">Onde Estamos</h4>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                {dealershipInfo.endereco.logradouro}, {dealershipInfo.endereco.bairro}<br />
                {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf} — CEP {dealershipInfo.endereco.cep}
              </p>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('sobre-contato');
                scrollToTop();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold pt-1"
            >
              <span>Ver mapa e fotos do showroom →</span>
            </button>
          </div>
        </div>

        {/* Linha Inferior com Copyright & Voltar ao Topo */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} {dealershipInfo.nome}. CNPJ: {dealershipInfo.cnpj}. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-500">AutoElite Motors — Modelo 01 (Básico)</span>
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
