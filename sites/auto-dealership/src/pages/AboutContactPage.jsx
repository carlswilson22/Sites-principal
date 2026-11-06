import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Award, MapPin, Phone, Mail, Clock, 
  MessageCircle, Send, CheckCircle2, Users, Wrench 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { dealershipInfo } from '../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../utils/whatsapp';

export function AboutContactPage() {
  const [contactForm, setContactForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Dúvidas sobre Veículos',
    mensagem: ''
  });

  const [messageSent, setMessageSent] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const text = 
      `📩 *Nova Mensagem via Site - AutoElite Motors*\n\n` +
      `• *Nome:* ${contactForm.nome}\n` +
      `• *Telefone:* ${contactForm.telefone}\n` +
      `• *E-mail:* ${contactForm.email}\n` +
      `• *Assunto:* ${contactForm.assunto}\n` +
      `• *Mensagem:* ${contactForm.mensagem}`;

    const url = `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 5000);
  };

  return (
    <div className="pt-24 pb-20 space-y-20">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 via-slate-950 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institucional & Atendimento</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sobre Nós & Contato
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Conheça nossa trajetória, nosso compromisso com a perícia automotiva digital e venha tomar um café em nosso showroom no SIA.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PARTE 1: SOBRE NÓS (História, Missão & Perícia Cautelar) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Texto Institucional */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Nossa História</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Pioneiros em Seminovos com Procedência Certificada
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Fundada com o propósito de elevar a transparência no mercado de seminovos, a 
              <strong className="text-white font-semibold"> AutoElite Motors</strong> nasceu da convicção de que comprar um carro deve ser uma experiência emocionante, transparente e livre de surpresas desagradáveis.
            </p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Diferente de revendas convencionais, estabelecemos um rigoroso protocolo de perícia técnica: 100% dos carros que entram em nosso pátio passam por uma varredura pericial completa de longarinas, monobloco, histórico de sinistros, leilões e integridade de chassi.
            </p>

            {/* Badges de Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Selo Pericial Cautelar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspeção rigorosa de lataria, motor, transmissão e histórico legal com laudo digital liberado para o comprador.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">1 Ano de Garantia Completa</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cobertura mecânica para motor e câmbio com suporte 24 horas e guincho em todo o território nacional.
                </p>
              </div>
            </div>
          </div>

          {/* Imagem Showroom / Estrutura */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
                alt="Showroom AutoElite Motors"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs">
                <p className="font-bold text-white">Showroom no SIA Trecho 3 — Brasília/DF</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Espaço climatizado com mais de 100 veículos em exposição</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PARTE 2: CONTATO & LOCALIZAÇÃO (Unificada)                 */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Canais de Atendimento</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Fale com a AutoElite Motors
          </h2>
          <p className="text-slate-400 text-sm">
            Nossa equipe de consultores está à disposição para esclarecer dúvidas, agendar test-drives e avaliar seu veículo.
          </p>
        </div>

        {/* 3 Cartões de Contato Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Telefone & WhatsApp */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Plantão & WhatsApp</h3>
            <p className="text-xs text-slate-400">Atendimento imediato para propostas e agendamento.</p>
            <div className="pt-1">
              <a 
                href={buildGeneralWhatsappLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 block transition-colors"
              >
                {dealershipInfo.whatsappFormatado}
              </a>
              <p className="text-xs text-slate-400 mt-1">Fixo: {dealershipInfo.telefone}</p>
            </div>
          </div>

          {/* Card Horário de Funcionamento */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Horário da Loja</h3>
            <p className="text-xs text-slate-400">Estacionamento privativo para clientes no local.</p>
            <div className="text-xs space-y-1 text-slate-300 pt-1">
              <p><strong className="text-white">Seg a Sex:</strong> 08:30 às 18:30</p>
              <p><strong className="text-white">Sábado:</strong> 08:30 às 15:00</p>
              <p><strong className="text-emerald-400">Domingo:</strong> Plantão Online</p>
            </div>
          </div>

          {/* Card Endereço Físico */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Endereço</h3>
            <p className="text-xs text-slate-400">Fácil acesso pela via expressa do SIA.</p>
            <p className="text-xs text-slate-300 pt-1 leading-relaxed">
              {dealershipInfo.endereco.logradouro}, {dealershipInfo.endereco.bairro}<br />
              {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf} — CEP {dealershipInfo.endereco.cep}
            </p>
          </div>
        </div>

        {/* Bloco Formulário + Mapa Lado a Lado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário de Mensagem Direta */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-4">
            <h3 className="font-heading font-bold text-xl text-white">
              Envie uma Mensagem Direta
            </h3>
            <p className="text-xs text-slate-400">
              Preencha os campos abaixo para falar com nosso setor comercial.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Seu Nome *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Nome completo"
                  value={contactForm.nome}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    placeholder="(61) 99999-9999"
                    value={contactForm.telefone}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="seuemail@exemplo.com"
                    value={contactForm.email}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Assunto</label>
                <select
                  name="assunto"
                  value={contactForm.assunto}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Dúvidas sobre Veículos">Dúvidas sobre Veículos do Estoque</option>
                  <option value="Agendamento de Test-Drive">Agendamento de Test-Drive</option>
                  <option value="Simulação de Financiamento">Simulação de Financiamento</option>
                  <option value="Avaliação de Veículo Usado">Avaliação de Veículo Usado</option>
                  <option value="Outros Assuntos">Outros Assuntos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Mensagem *</label>
                <textarea
                  name="mensagem"
                  required
                  rows="3"
                  placeholder="Como podemos te ajudar hoje?"
                  value={contactForm.mensagem}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Send}
                className="w-full py-3"
              >
                Enviar Mensagem no WhatsApp
              </Button>

              {messageSent && (
                <p className="text-xs text-emerald-400 text-center font-medium animate-fade-in">
                  ✓ Mensagem formatada com sucesso! Redirecionando...
                </p>
              )}
            </form>
          </div>

          {/* Mapa Incorporado Google Maps */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-2 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl overflow-hidden aspect-[4/3] relative">
              <iframe
                title="Localização do Showroom AutoElite"
                src={dealershipInfo.endereco.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1.25rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="filter contrast-125 opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{dealershipInfo.endereco.logradouro} — SIA, Brasília/DF</span>
              </div>
              <a
                href="https://maps.google.com/?q=SIA+Trecho+3+Brasilia+DF"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-400 hover:text-blue-300 underline shrink-0"
              >
                Abrir Rota no Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
