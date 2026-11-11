import { StoreContactDetails } from '../../../../packages/merchant-core/src/components/layout/StoreContactDetails';
import { StoreVehiclePhoto } from '../../../../packages/merchant-core/src/components/layout/StoreVehiclePhoto';
import { vehiclesData } from '../data/vehicles';
import { siteAnalytics } from '../../../../packages/merchant-core/src/services/siteAnalytics.js';
import React, { useState } from 'react';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { Building2, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { dealershipInfo } from '../data/dealershipInfo';
import { apiClient, storeSync } from '../../../../packages/merchant-core/src';

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // E6: Captura automática do lead para o Painel do Lojista
    try {
      storeSync.addLead('autoelite', {
        name: contactForm.nome,
        phone: contactForm.telefone,
        email: contactForm.email,
        source: 'formulario_site',
        message: `Assunto: ${contactForm.assunto} - Mensagem: ${contactForm.mensagem}`
      });
      await apiClient.captureLead({
        name: contactForm.nome,
        phone: contactForm.telefone,
        email: contactForm.email,
        source: 'site_formulario',
        notes: `Assunto: ${contactForm.assunto} - Mensagem: ${contactForm.mensagem}`
      });
    } catch {
      // Continua mesmo em modo offline
    }

    const text = 
      `📩 *Nova Mensagem via Site - ${dealershipInfo.nome}*\n\n` +
      `• *Nome:* ${contactForm.nome}\n` +
      `• *Telefone:* ${contactForm.telefone}\n` +
      `• *E-mail:* ${contactForm.email}\n` +
      `• *Assunto:* ${contactForm.assunto}\n` +
      `• *Mensagem:* ${contactForm.mensagem}`;

    const url = `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
    siteAnalytics.track('autoelite', { type: 'whatsapp_click', page: 'sobre-contato' });
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 5000);
  };

  return (
    <div className="pb-12 sm:pb-16 space-y-10 sm:space-y-14">
      {/* Page Header */}
      <div className="pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institucional & Atendimento</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Sobre Nós e Contato</h1>
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
              <strong className="text-white font-semibold"> {dealershipInfo.nome}</strong> nasceu da convicção de que comprar um carro deve ser uma experiência emocionante, transparente e livre de surpresas desagradáveis.
            </p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Diferente de revendas convencionais, estabelecemos um rigoroso protocolo de perícia técnica: 100% dos carros que entram em nosso pátio passam por uma varredura pericial completa de longarinas, monobloco, histórico de sinistros, leilões e integridade de chassi.
            </p>
          </div>

          <div className="lg:col-span-5"><StoreVehiclePhoto vehicle={vehiclesData[0]} storeName={dealershipInfo.nome} /></div>
        </div>
      </section>

      <WhyUsSection />

      {/* ======================================================== */}
      {/* PARTE 2: CONTATO & LOCALIZAÇÃO (Unificada)                 */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Canais de Atendimento</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Fale com a {dealershipInfo.nome}
          </h2>
          <p className="text-slate-400 text-sm">
            Nossa equipe de consultores está à disposição para esclarecer dúvidas, agendar test-drives e avaliar seu veículo.
          </p>
        </div>

        <StoreContactDetails dealership={dealershipInfo} />

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
          </div>
        </div>
      </section>
    </div>
  );
}
