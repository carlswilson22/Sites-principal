import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Award, MapPin, Phone, Mail, Clock, 
  MessageCircle, Send, CheckCircle2, Zap 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { dealershipInfo } from '../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../utils/whatsapp';

export function AboutContactPage() {
  const [contactForm, setContactForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Dúvidas sobre Veículos e Financiamento',
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
      `⚡ *Nova Mensagem via Site - ${dealershipInfo.nome}*\n\n` +
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
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institucional & Showroom</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sobre Nós & Atendimento
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Conheça a DriveNow Motors, nosso padrão de periciamento digital e venha tomar um café em nossa mega-loja no SIA.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Texto Institucional */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Nossa Missão</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Transparência Digital e Financiamento Descomplicado
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              A <strong className="text-white font-semibold">DriveNow Motors</strong> nasceu para transformar a jornada de compra de seminovos. Unimos tecnologia, inteligência artificial e rigor pericial para que você compre seu veículo com segurança absoluta.
            </p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Todos os nossos veículos possuem Laudo Cautelar Digital com 100% de aprovação, 1 ano de garantia total e aprovação bancária em até 15 minutos com os principais bancos do país.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">100% Laudo Cautelar</h4>
                <p className="text-xs text-slate-400">Inspeção completa de longarinas, monobloco e histórico legal.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-sm text-white">1 Ano de Garantia</h4>
                <p className="text-xs text-slate-400">Proteção total para câmbio e motor em oficinas credenciadas.</p>
              </div>
            </div>

            {/* Endereço e Contato */}
            <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{dealershipInfo.endereco.logradouro}, {dealershipInfo.endereco.bairro} — {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{dealershipInfo.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{dealershipInfo.horarios.semana} • {dealershipInfo.horarios.sabado}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Contato Completo (Base Obrigatória) */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Atendimento Online</span>
              <h3 className="font-heading text-2xl font-bold text-white">Envie sua Mensagem</h3>
              <p className="text-xs text-slate-400">Nossa equipe retornará imediatamente no seu WhatsApp ou telefone.</p>
            </div>

            {messageSent && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mensagem enviada com sucesso! Consultor de plantão conectado.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Seu nome completo"
                  value={contactForm.nome}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    placeholder="(61) 99999-9999"
                    value={contactForm.telefone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="seuemail@exemplo.com"
                    value={contactForm.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Assunto</label>
                <select
                  name="assunto"
                  value={contactForm.assunto}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Dúvidas sobre Veículos e Financiamento">Dúvidas sobre Veículos e Financiamento</option>
                  <option value="Agendamento de Test-Drive">Agendamento de Test-Drive no Showroom</option>
                  <option value="Simulação de Crédito Bancário">Simulação de Crédito Bancário</option>
                  <option value="Avaliação de Usado na Troca">Avaliação de Usado na Troca</option>
                  <option value="Outros Assuntos">Outros Assuntos</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mensagem</label>
                <textarea
                  name="mensagem"
                  required
                  rows="3"
                  placeholder="Como podemos te ajudar hoje?"
                  value={contactForm.mensagem}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 resize-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                className="w-full py-4 text-center justify-center font-bold"
              >
                Enviar Mensagem para o Plantão
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
