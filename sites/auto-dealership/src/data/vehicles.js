export const vehiclesData = [
  {
    id: 1,
    nome: "Chevrolet Tracker",
    versao: "1.2 Turbo Premier AT",
    categoria: "suv",
    ano: "2023/2023",
    km: 22400,
    cambio: "Automático 6m",
    combustivel: "Flex",
    cor: "Branco Summit",
    portas: 4,
    motor: "1.2 Turbo 3 cil.",
    potencia: "133 cv",
    preco: 119900,
    parcela: { entrada: 35000, vezes: 48, valor: 2490 },
    destaque: true,
    periciado: true,
    imagemPrincipal: "/images/FotoChevroletTracker.jpg",
    imagens: [
      "/images/FotoChevroletTracker.jpg",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-89214-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Estrutura e longarinas originais e intocadas",
      pintura: "Pintura original de fábrica sem repinturas",
      mecanica: "Motor, injeção e transmissão revisados em concessionária",
      sinistroLeilao: "Histórico limpo (Nada Consta)"
    },
    opcionais: [
      "Teto Solar Panorâmico",
      "Alerta de Colisão Frontal com Frenagem Autônoma",
      "Assistente de Estacionamento Park Assist",
      "Central MyLink 8\" com Apple CarPlay sem fio",
      "Bancos em Couro Bicolor",
      "Carregador de Celular por Indução"
    ],
    fichaTecnica: {
      consumoUrbano: "11,2 km/l (G)",
      consumoRodoviario: "13,5 km/l (G)",
      portaMalas: "393 Litros",
      tanque: "44 Litros",
      airbags: "6 Airbags",
      freios: "ABS + EBD + Controle de Estabilidade"
    }
  },
  {
    id: 2,
    nome: "Toyota Corolla Cross",
    versao: "2.0 XRE DirectShift",
    categoria: "suv",
    ano: "2022/2023",
    km: 34100,
    cambio: "Automático CVT 10m",
    combustivel: "Flex",
    cor: "Cinza Granito",
    portas: 4,
    motor: "2.0 Dynamic Force",
    potencia: "177 cv",
    preco: 139900,
    parcela: { entrada: 45000, vezes: 48, valor: 2890 },
    destaque: true,
    periciado: true,
    imagemPrincipal: "/images/FotoCorollaCross.jpg",
    imagens: [
      "/images/FotoCorollaCross.jpg",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-77412-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Monobloco íntegro, sem deformidades",
      pintura: "Micro-retoque estético em para-choque dianteiro (aprovado)",
      mecanica: "Todas as revisões feitas na Toyota por tempo",
      sinistroLeilao: "Nada Consta"
    },
    opcionais: [
      "Pacote Toyota Safety Sense (ACC + Alerta de Faixa)",
      "Faróis Full LED",
      "Paddle Shift no Volante",
      "Chave Presencial Smart Entry",
      "Bancos em Couro",
      "Câmera de Ré com Linhas Guias"
    ],
    fichaTecnica: {
      consumoUrbano: "11,5 km/l (G)",
      consumoRodoviario: "12,8 km/l (G)",
      portaMalas: "440 Litros",
      tanque: "47 Litros",
      airbags: "7 Airbags (inclusive joelho)",
      freios: "Discos nas 4 rodas com ABS"
    }
  },
  {
    id: 3,
    nome: "Volkswagen Polo",
    versao: "1.0 TSI Highline",
    categoria: "hatch",
    ano: "2023/2024",
    km: 14800,
    cambio: "Automático 6m",
    combustivel: "Flex",
    cor: "Vermelho Sunset",
    portas: 4,
    motor: "1.0 170 TSI",
    potencia: "116 cv",
    preco: 98900,
    parcela: { entrada: 30000, vezes: 48, valor: 2090 },
    destaque: false,
    periciado: true,
    imagemPrincipal: "/images/FotoPoloTSI.jpg",
    imagens: [
      "/images/FotoPoloTSI.jpg",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-99014-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Colunas e soleiras 100% preservadas",
      pintura: "100% Original de Fábrica",
      mecanica: "Garantia de fábrica vigente até 2026",
      sinistroLeilao: "Nada Consta"
    },
    opcionais: [
      "Painel Digital Active Info Display 10,25\"",
      "Multimídia VW Play 10,1\" com Apps Integrados",
      "Ar-condicionado Climatronic Touch",
      "Rodas aro 17 diamantadas",
      "Sensores de Estacionamento Dianteiros e Traseiros",
      "Volante multifuncional com troca de marchas"
    ],
    fichaTecnica: {
      consumoUrbano: "12,1 km/l (G)",
      consumoRodoviario: "15,1 km/l (G)",
      portaMalas: "300 Litros",
      tanque: "52 Litros",
      airbags: "4 Airbags",
      freios: "ABS com EBD e Controle de Tração"
    }
  },
  {
    id: 4,
    nome: "Hyundai HB20",
    versao: "Platinum Plus 1.0 Turbo TGDI",
    categoria: "hatch",
    ano: "2023/2023",
    km: 19800,
    cambio: "Automático 6m",
    combustivel: "Flex",
    cor: "Azul Sapphire",
    portas: 4,
    motor: "1.0 Turbo GDI",
    potencia: "120 cv",
    preco: 92900,
    parcela: { entrada: 28000, vezes: 48, valor: 1950 },
    destaque: false,
    periciado: true,
    imagemPrincipal: "/images/FotoHyundaiHB20.jpg",
    imagens: [
      "/images/FotoHyundaiHB20.jpg",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-44128-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Longarinas sem sinais de impacto",
      pintura: "Excelente estado de conservação",
      mecanica: "Revisões em dia na concessionária",
      sinistroLeilao: "Sem restrições financeiras ou leilão"
    },
    opcionais: [
      "Assistente de Ponto Cego e Tráfego Cruzado",
      "Frenagem Autônoma de Emergência",
      "Bancos em Couro Preto com acabamento refinado",
      "Partida remota do motor pela chave",
      "Carregador por Indução",
      "Faróis com Projetor e DRL em LED"
    ],
    fichaTecnica: {
      consumoUrbano: "11,8 km/l (G)",
      consumoRodoviario: "14,0 km/l (G)",
      portaMalas: "300 Litros",
      tanque: "50 Litros",
      airbags: "6 Airbags",
      freios: "ABS com EBD"
    }
  },
  {
    id: 5,
    nome: "Fiat Pulse",
    versao: "Audace 1.0 Turbo 200 CVT",
    categoria: "suv",
    ano: "2023/2023",
    km: 26000,
    cambio: "Automático CVT 7m",
    combustivel: "Flex",
    cor: "Cinza Strato com Teto Preto",
    portas: 4,
    motor: "1.0 Turbo 200",
    potencia: "130 cv",
    preco: 97900,
    parcela: { entrada: 29000, vezes: 48, valor: 2050 },
    destaque: false,
    periciado: true,
    imagemPrincipal: "/images/FotoFiatPulse.jpg",
    imagens: [
      "/images/FotoFiatPulse.jpg",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-63201-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Estrutural original íntegro",
      pintura: "Original sem repintura",
      mecanica: "Conjunto motor/câmbio 100% testado",
      sinistroLeilao: "Nada Consta"
    },
    opcionais: [
      "Central Multimídia 10.1\" sem fio",
      "Frenagem Autônoma de Emergência e Alerta de Faixa",
      "Carregador por Indução para Celular",
      "Câmera de ré e sensor de estacionamento",
      "Pintura bicolor original de fábrica",
      "Modo Sport com botão no volante"
    ],
    fichaTecnica: {
      consumoUrbano: "12,0 km/l (G)",
      consumoRodoviario: "14,4 km/l (G)",
      portaMalas: "370 Litros",
      tanque: "47 Litros",
      airbags: "4 Airbags",
      freios: "ABS com EBD e TC+"
    }
  },
  {
    id: 6,
    nome: "Honda Civic G10",
    versao: "2.0 EXL CVT",
    categoria: "sedan",
    ano: "2021/2021",
    km: 48500,
    cambio: "Automático CVT 7m",
    combustivel: "Flex",
    cor: "Prata Platinum",
    portas: 4,
    motor: "2.0 i-VTEC",
    potencia: "155 cv",
    preco: 124900,
    parcela: { entrada: 40000, vezes: 48, valor: 2590 },
    destaque: true,
    periciado: true,
    imagemPrincipal: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-11984-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Estrutura dianteira e traseira seladas de fábrica",
      pintura: "Pintura em excelente conservação com vitrificação",
      mecanica: "Histórico completo de revisões no manual carimbado",
      sinistroLeilao: "Nada Consta"
    },
    opcionais: [
      "Painel Digital TFT configurável",
      "Freio de Estacionamento Eletrônico com Brake Hold",
      "Bancos em Couro com ajuste de altura",
      "Ar-condicionado Dual Zone",
      "Rodas aro 17 escurecidas",
      "Sensor crepuscular e de chuva"
    ],
    fichaTecnica: {
      consumoUrbano: "10,5 km/l (G)",
      consumoRodoviario: "13,0 km/l (G)",
      portaMalas: "519 Litros",
      tanque: "56 Litros",
      airbags: "6 Airbags",
      freios: "Discos nas 4 rodas com ABS e VSA"
    }
  },
  {
    id: 7,
    nome: "Toyota Hilux",
    versao: "SRV 2.8 4x4 Turbodiesel AT",
    categoria: "pickup",
    ano: "2022/2022",
    km: 52000,
    cambio: "Automático 6m",
    combustivel: "Diesel",
    cor: "Branco Polar",
    portas: 4,
    motor: "2.8 Turbodiesel 1GD",
    potencia: "204 cv",
    preco: 229900,
    parcela: { entrada: 75000, vezes: 48, valor: 4690 },
    destaque: true,
    periciado: true,
    imagemPrincipal: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-30281-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Chassi sobre longarinas sem empeno ou corrosão",
      pintura: "Original sem histórico de sinistro",
      mecanica: "Tração 4x4 com reduzida testada e operacional",
      sinistroLeilao: "Veículo de procedência comprovada"
    },
    opcionais: [
      "Tração 4x4 com seletor eletrônico e bloqueio de diferencial",
      "Capota marítima e protetor de caçamba original",
      "Bancos em Couro com regulagem elétrica",
      "Ar-condicionado digital Dual Zone",
      "Central Multimídia JBL com GPS e TV Digital",
      "Santo antônio cromado e estribos laterais"
    ],
    fichaTecnica: {
      consumoUrbano: "10,1 km/l (D)",
      consumoRodoviario: "11,3 km/l (D)",
      capacidadeCarga: "1.000 kg",
      tanque: "80 Litros",
      airbags: "7 Airbags",
      freios: "ABS com EBD e Assistente de Descida (DAC)"
    }
  },
  {
    id: 8,
    nome: "BMW 320i",
    versao: "M Sport 2.0 Turbo ActiveFlex",
    categoria: "esportivo",
    ano: "2023/2023",
    km: 16200,
    cambio: "Automático ZF 8m",
    combustivel: "Flex",
    cor: "Portimao Blue",
    portas: 4,
    motor: "2.0 TwinPower Turbo",
    potencia: "184 cv",
    preco: 289900,
    parcela: { entrada: 90000, vezes: 48, valor: 5990 },
    destaque: true,
    periciado: true,
    imagemPrincipal: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"
    ],
    laudoCautelar: {
      status: "100% Aprovado",
      codigoLaudo: "AMT-95510-DF",
      perito: "Perícia Cautelar Certificada",
      estrutura: "Integridade estrutural alemã 100% impecável",
      pintura: "Tratamento cerâmico de pintura 9H com garantia",
      mecanica: "Manutenção estritamente na concessionária Eurobike",
      sinistroLeilao: "Laudo cautelar blindado sem apontamentos"
    },
    opcionais: [
      "Pacote M Sport Aerodinâmico completo",
      "BMW Live Cockpit Professional em tela curva integrada",
      "Teto solar elétrico de cristal",
      "Sistema de som Harman Kardon Surround",
      "Faróis BMW Laserlight",
      "Head-Up Display colorido no para-brisa"
    ],
    fichaTecnica: {
      consumoUrbano: "10,7 km/l (G)",
      consumoRodoviario: "13,2 km/l (G)",
      aceleracao: "0-100 km/h em 7,1s",
      portaMalas: "365 Litros",
      airbags: "6 Airbags",
      freios: "M Sport com pinças azuis e discos ventilados"
    }
  }
];
