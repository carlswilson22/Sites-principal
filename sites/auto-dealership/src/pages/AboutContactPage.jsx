import { StoreContactDetails } from '../../../../packages/merchant-core/src/components/layout/StoreContactDetails';
import { StoreVehiclePhoto } from '../../../../packages/merchant-core/src/components/layout/StoreVehiclePhoto';
import { vehiclesData } from '../data/vehicles';
import React from 'react';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { Building2 } from 'lucide-react';
import { dealershipInfo } from '../data/dealershipInfo';
import { StoreInquiryForm } from '../../../../packages/merchant-core/src/components/common/StoreInquiryForm';

export function AboutContactPage() {
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

            <StoreInquiryForm dealership={dealershipInfo} storeKey="autoelite" presentation="classic" />
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
