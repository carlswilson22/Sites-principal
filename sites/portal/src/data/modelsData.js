export const modelsList = [
  {
    id: 'auto-dealership',
    title: 'AutoElite Motors',
    tagline: 'Concessionária de Seminovos Selecionados',
    tier: 'Básico',
    category: 'Tier 1 • Básico',
    description: 'Site vitrine elegante e direto ao ponto. Hero rápida com busca, vitrine de seleção da semana, catálogo com modal de detalhes, galeria expandida com miniaturas e formulário de contato integrado com WhatsApp.',
    status: 'available',
    badge: 'Tier 1 • Básico',
    path: 'auto-dealership/',
    previewImage: 'auto-dealership/images/FotoChevroletTracker.jpg',
    features: [
      'Vitrine de Destaques e Ofertas da Semana',
      'Formulário de Contato Completo com WhatsApp',
      'Galeria de Fotos Expandida com Miniaturas Clicáveis',
      'Catálogo de Seminovos Periciados (4 Páginas)'
    ],
    techStack: ['React 18', 'Tailwind CSS', 'Vite', 'Lucide Icons']
  },
  {
    id: 'luxury-dealership',
    title: 'Apex Luxury Motors',
    tagline: 'Superesportivos, Exóticos & Blindados VIP',
    tier: 'Intermediário',
    category: 'Tier 2 • Intermediário',
    description: 'Experiência imersiva com Hero Cinematográfica controlada por ScrollTrigger (GSAP), Visualizador 360° interativo com drag, filtros avançados no showroom, simulador de financiamento private, avaliação de troca e serviço de Concierge.',
    status: 'available',
    badge: 'Tier 2 • Intermediário',
    path: 'luxury-dealership/',
    previewImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Tudo do Tier Básico + Hero Cinematográfica GSAP',
      'Visualizador 360° Interativo com Rotação Drag',
      'Filtros Avançados (Marca, Câmbio, Blindagem III-A)',
      'Simulador Private Banking & Avaliação de Troca (7 Páginas)'
    ],
    techStack: ['React 18', 'GSAP ScrollTrigger', 'Tailwind CSS', 'Vite']
  },
  {
    id: 'popular-dealership',
    title: 'DriveNow Motors',
    tagline: 'Plataforma Completa com IA & Comparador',
    tier: 'Completo',
    category: 'Tier 3 • Mais Completo',
    description: 'O ecossistema definitivo de concessionária digital: Consultor Virtual com Inteligência Artificial, Comparador de Veículos lado a lado, Calculadora TCO (custo total de posse), Dossiê Oficial de histórico/leilão, sistema de Favoritos e Alertas de Preço.',
    status: 'available',
    badge: 'Tier 3 • Mais Completo',
    path: 'popular-dealership/',
    previewImage: 'popular-dealership/images/FotoCorollaCross.jpg',
    features: [
      'Tudo dos Tiers Básico e Intermediário +',
      'Consultor Virtual com Inteligência Artificial (Chatbot)',
      'Comparador Técnico de Veículos Lado a Lado',
      'Calculadora de TCO Anual, Dossiê & Favoritos (9 Páginas)'
    ],
    techStack: ['React 18', 'AI Engine', 'Local Storage', 'Tailwind CSS', 'Vite']
  }
];
