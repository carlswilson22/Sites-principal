import enterpriseHome from '../assets/enterprise-home.jpg';

export const modelsList = [
  {
    id: 'auto-dealership',
    title: 'AutoElite Seminovos (Modelo 1)',
    tagline: 'Vitrine direta · Busca em primeiro plano',
    tier: 'Básico',
    category: 'Tier 1 • Básico',
    badge: 'Tier 1 • Básico',
    status: 'available',
    path: 'auto-dealership/',
    previewImage: 'images/tracker.jpg',
    presentation: 'catalog',
    description: 'Uma loja objetiva, com abertura em duas colunas, busca rápida e uma vitrine de veículos em grade. Para quem quer levar o cliente da pesquisa ao anúncio com poucos passos.',
    features: [
      'Busca direta na abertura do site',
      'Catálogo em grade e navegação compacta',
      'Galeria e simulador dentro do anúncio',
      'Atendimento no site e contato com a loja',
      'Páginas de estoque e apresentação da empresa'
    ],
    techStack: ['React 18', 'Tailwind CSS', 'Vite', 'Lucide Icons']
  },
  {
    id: 'luxury-dealership',
    title: 'DriveNow Multimarcas (Modelo 2)',
    tagline: 'Showroom editorial · Fotografia em destaque',
    tier: 'Intermediário',
    category: 'Tier 2 • Intermediário',
    badge: 'Tier 2 • Intermediário',
    status: 'available',
    path: 'luxury-dealership/',
    previewImage: 'images/corolla.jpg',
    presentation: 'editorial',
    description: 'Uma experiência de showroom: abertura cinematográfica, marca centralizada e uma coleção de veículos com fotografias amplas. A apresentação convida o cliente a explorar cada escolha com calma.',
    features: [
      'Abertura com vídeo e apresentação editorial',
      'Anúncios horizontais com fotos amplas',
      'Simulação de financiamento no anúncio',
      'Avaliação do usado na troca',
      'Concierge no anúncio e módulos de gestão'
    ],
    techStack: ['React 18', 'Tailwind CSS', 'Finance Engine', 'Vite']
  },
  {
    id: 'popular-dealership',
    title: 'Enterprise Veículos',
    tagline: 'Vitrine panorâmica · Escolhas lado a lado',
    tier: 'Completo',
    category: 'Tier 3 • Mais Completo',
    badge: 'Tier 3 • Mais Completo',
    status: 'available',
    path: 'popular-dealership/',
    previewImage: enterpriseHome,
    presentation: 'explorer',
    description: 'Uma vitrine panorâmica com animação em destaque, espaço para reunir suas escolhas e filtros em uma faixa horizontal. Fotos amplas e comparação de veículos ajudam o cliente a explorar antes de decidir.',
    features: [
      'Vídeo panorâmico e filtros na página inicial',
      'Comparação de até três veículos e favoritos',
      'Visualizador 360° incluído nos anúncios compatíveis',
      'Calculadora de custo total e dossiê do veículo',
      'Atendimento e financiamento dentro do anúncio'
    ],
    techStack: ['React 18', 'AI Engine', 'Local Storage', 'Tailwind CSS', 'Vite']
  }
];
