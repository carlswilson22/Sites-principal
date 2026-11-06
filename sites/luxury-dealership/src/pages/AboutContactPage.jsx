import React, { useState } from 'react';
import { 
  Building2, Shield, Award, MapPin, Phone, Mail, Clock, 
  MessageCircle, Send, CheckCircle2, Crown, Eye 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { dealershipInfo } from '../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../utils/whatsapp';

export function AboutContactPage() {
  const [contactForm, setContactForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Agendamento de Visita no Showroom Privativo',
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
      `🏛️ *Atendimento VIP - ${dealershipInfo.nome}*\n\n` +
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
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Showroom Privativo & Concierge</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sobre a Apex & Agendamento
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Conheça nossa trajetória na alta gastronomia e engenharia automotiva e reserve uma visita exclusiva com consultor sênior.
          </p>
        </div>
      </div>

      {/* Conteúdo Institucional & Formulário de Contato */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Informações Institucionais */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Nossa Filosofia</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Discrição, Engenharia e Alta Performance
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              A <strong className="text-white font-semibold">Apex Luxury Motors</strong> foi concebida para atender entusiastas e colecionadores que encaram o automóvel como uma obra de arte e um ativo de alta relevância.
            </p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Nosso showroom físico possui segurança privada 24 horas, sala de negociação climatizada e um acervo 100% periciado com rastreamento internacional de hodômetro e procedência.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Showroom Privativo</h4>
                <p className="text-xs text-slate-400">Atendimento apenas com hora marcada e sala reservada.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Laudo Balístico III-A</h4>
                <p className="text-xs text-slate-400">Certificação completa de vidros e mantas blindadas.</p>
              </div>
            </div>

            {/* Dados de Contato e Horários */}
            <div className="p-6 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{dealershipInfo.endereco.logradouro}, {dealershipInfo.endereco.bairro} — {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{dealershipInfo.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{dealershipInfo.horarios.semana}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Contato Completo (Base Obrigatória) */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-[#0a0b12] border border-amber-500/30 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Contato Direto</span>
              <h3 className="font-heading text-2xl font-bold text-white">Agende sua Visita ou Fale Conosco</h3>
              <p className="text-xs text-slate-400">Preencha o formulário e receba retorno exclusivo de nosso Concierge.</p>
            </div>

            {messageSent && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Solicitação enviada com sucesso! Nosso consultor entrará em contato em breve.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Seu nome"
                  value={contactForm.nome}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    placeholder="(61) 99999-9999"
                    value={contactForm.telefone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="seuemail@dominio.com"
                    value={contactForm.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Assunto</label>
                <select
                  name="assunto"
                  value={contactForm.assunto}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Agendamento de Visita no Showroom Privativo">Agendamento de Visita no Showroom Privativo</option>
                  <option value="Interesse em Superesportivo Específico">Interesse em Superesportivo Específico</option>
                  <option value="Simulação de Financiamento Private">Simulação de Financiamento Private</option>
                  <option value="Avaliação de Veículo Blindado / Troca">Avaliação de Veículo Blindado / Troca</option>
                  <option value="Serviço de Encomenda & Concierge">Serviço de Encomenda & Concierge</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mensagem ou Preferências</label>
                <textarea
                  name="mensagem"
                  required
                  rows="3"
                  placeholder="Informe detalhes sobre o veículo desejado ou sua preferência de data/horário para a visita..."
                  value={contactForm.mensagem}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                icon={Send}
                className="w-full py-4 text-center justify-center font-bold"
              >
                Enviar Solicitação ao Concierge VIP
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
