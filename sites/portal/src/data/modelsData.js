export const modelsList = [
  {
    id: 'auto-dealership',
    title: 'AutoElite Seminovos (Modelo 1)',
    tagline: 'Edição Ágil de Alta Conversão para Concessionárias e Revendas',
    tier: 'Básico',
    category: 'Tier 1 • Básico',
    badge: 'Tier 1 • Básico',
    status: 'available',
    path: 'auto-dealership/',
    previewImage: 'images/tracker.jpg',
    description: 'Interface limpa e objetiva com vitrine de ofertas, catálogo de seminovos, galeria de fotos, atendimento dentro do anúncio e contato com a equipe da loja.',
    features: [
      'Galeria de Fotos e Atendimento Dentro do Anúncio',
      'Catálogo de Seminovos Periciados com Filtro Rápido (4 Páginas)',
      'Modal de Ficha Técnica Pericial com Galeria HD',
      'Conversão Instantânea para WhatsApp com Dados do Veículo',
      'Design Responsivo Institucional com Tipografia Acessível'
    ],
    techStack: ['React 18', 'Tailwind CSS', 'Vite', 'Lucide Icons']
  },
  {
    id: 'luxury-dealership',
    title: 'DriveNow Multimarcas (Modelo 2)',
    tagline: 'Experiência Interativa Avançada com Negociação e Simulação Online',
    tier: 'Intermediário',
    category: 'Tier 2 • Intermediário',
    badge: 'Tier 2 • Intermediário',
    status: 'available',
    path: 'luxury-dealership/',
    previewImage: 'images/corolla.jpg',
    description: 'Edição expandida para concessionárias consolidadas. Agrega ferramentas completas de fechamento online: simulador de financiamento com cálculo de parcelas em tempo real, avaliação de seminovo na troca (Trade-In), vídeo pericial de 20s e agendamento de Concierge / Test Drive.',
    features: [
      'Tudo do Tier Essential +',
      'Simulador Financeiro com Amortização Price/SAC e IOF',
      'Avaliação de Entrada na Troca (Trade-In) com Margem FIPE',
      'Filtros Avançados de Showroom (Câmbio, Combustível e Preço)',
      'Player de Vídeo Pericial (20s) e Módulo de Concierge VIP (7 Páginas)'
    ],
    techStack: ['React 18', 'Tailwind CSS', 'Finance Engine', 'Vite']
  },
  {
    id: 'popular-dealership',
    title: 'Enterprise Veículos',
    tagline: 'Ecossistema Completo com Inteligência Artificial e Comparador Técnico',
    tier: 'Completo',
    category: 'Tier 3 • Mais Completo',
    badge: 'Tier 3 • Mais Completo',
    status: 'available',
    path: 'popular-dealership/',
    previewImage: 'images/pulse.jpg',
    description: 'A suíte definitiva com a inteligência máxima da plataforma. Consultor Virtual com Inteligência Artificial para recomendações personalizadas, Comparador Técnico lado a lado de até 3 veículos com barra flutuante, Dossiê Cautelar IA com verificação de leilão/sinistros, Calculadora TCO anual e alertas de preço.',
    features: [
      'Tudo dos Tiers Essential e Pro +',
      'Visualizador 360° Orbital Interativo Incluído',
      'Consultor Virtual com Inteligência Artificial (Chatbot IA)',
      'Comparador Técnico de Veículos Lado a Lado (Até 3 Carros)',
      'Dossiê Cautelar IA (Histórico, Leilão, Sinistro e Pintura)',
      'Calculadora de Custo Total (TCO Anual: IPVA, Seguro e Manutenção)',
      'Sistema de Favoritos e Alertas de Queda de Preço (9 Páginas)'
    ],
    techStack: ['React 18', 'AI Engine', 'Local Storage', 'Tailwind CSS', 'Vite']
  }
];

export const aLaCarteTools = [{
  id: 'vehicle360',
  title: 'Visualizador 360° do veículo',
  description: 'Explore os ângulos do veículo a partir de um conjunto próprio de imagens. Disponível como ferramenta adicional para os modelos 1 e 2.',
  included: 'Incluído no modelo 3',
}];
