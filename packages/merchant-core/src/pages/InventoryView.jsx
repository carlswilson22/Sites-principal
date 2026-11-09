/**
 * packages/merchant-core/src/pages/InventoryView.jsx
 * Gestão de Estoque, Fotos e Ficha Técnica do Anúncio (E3, E4, E5 - Nível 1)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { storeSync } from '../services/storeSync';
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  ArrowLeft,
  ArrowRight,
  Star,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Itens de série padronizados para marcação rápida (E5)
const STANDARD_FEATURES = [
  'Ar-condicionado Digital',
  'Direção Elétrica Progressiva',
  'Central Multimídia com Apple CarPlay / Android Auto',
  'Câmera de Ré com Linhas Guias',
  'Sensor de Estacionamento Traseiro',
  'Controle Eletrônico de Estabilidade (ESP)',
  'Assistente de Partida em Rampas (Hill Assist)',
  'Faróis e Lanternas Full LED',
  'Rodas de Liga Leve Diamantadas',
  'Bancos em Couro com Ajuste de Altura',
  'Chave Presencial com Partida por Botão (Start/Stop)',
  'Airbags Frontais, Laterais e de Cortina',
  'Freios ABS com Distribuição Eletrônica (EBD)',
  'Piloto Automático Adaptativo / Cruise Control'
];

export function InventoryView({ storeKey = 'autoelite', defaultVehicles = [] }) {
  const { hasRole } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // todos, proprio, consignado, vendido, oculto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Estado do formulário de veículo (E3, E5)
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    category: 'sedan',
    year: '2023/2023',
    km: 25000,
    transmission: 'Automático',
    fuel: 'Flex',
    color: 'Branco',
    doors: 4,
    engine: '1.0 Turbo',
    power: '120 cv',
    price: 85000,
    status: 'disponivel',
    ownership_type: 'proprio',
    is_published: 1,
    days_in_stock: 15,
    notes: 'Veículo revisado com perícia cautelar 100% aprovada.',
    features: ['Ar-condicionado Digital', 'Direção Elétrica Progressiva', 'Central Multimídia com Apple CarPlay / Android Auto'],
    tags: ['Único Dono', 'Laudo Cautelar Aprovado', 'Garantia']
  });

  // Estado do gestor de fotos (E4: até 20 fotos, capa, ordem, remoção)
  const [photosList, setPhotosList] = useState([]);

  // Carga reativa de veículos com storeSync
  useEffect(() => {
    const list = storeSync.getVehicles(storeKey, defaultVehicles);
    setVehicles(list);

    const unsub = storeSync.subscribe(storeKey, (detail) => {
      if (detail.type === 'VEHICLES_UPDATED') {
        setVehicles(detail.vehicles);
      }
    });
    return unsub;
  }, [storeKey]);

  // Filtragem dinâmica
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.color.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'proprio') return v.ownership_type === 'proprio' && v.status === 'disponivel';
      if (filterStatus === 'consignado') return v.ownership_type === 'consignado';
      if (filterStatus === 'vendido') return v.status === 'vendido';
      if (filterStatus === 'oculto') return v.is_published === 0;

      return true;
    });
  }, [vehicles, searchTerm, filterStatus]);

  // Abertura de modal para criar ou editar
  const handleOpenEdit = (v = null) => {
    if (v) {
      setSelectedVehicle(v);
      setFormData({
        title: v.title,
        version: v.version,
        category: v.category || 'sedan',
        year: v.year,
        km: v.km,
        transmission: v.transmission,
        fuel: v.fuel,
        color: v.color,
        doors: v.doors || 4,
        engine: v.engine || '',
        power: v.power || '',
        price: v.price,
        status: v.status,
        ownership_type: v.ownership_type,
        is_published: v.is_published,
        days_in_stock: v.days_in_stock,
        notes: v.notes || '',
        features: v.features || [],
        tags: v.tags || []
      });
    } else {
      setSelectedVehicle(null);
      setFormData({
        title: '',
        version: '',
        category: 'sedan',
        year: '2023/2023',
        km: 20000,
        transmission: 'Automático',
        fuel: 'Flex',
        color: 'Preto',
        doors: 4,
        engine: '1.0',
        power: '100 cv',
        price: 75000,
        status: 'disponivel',
        ownership_type: 'proprio',
        is_published: 1,
        days_in_stock: 0,
        notes: 'Veículo em excelente estado de conservação.',
        features: ['Ar-condicionado Digital', 'Direção Elétrica Progressiva'],
        tags: ['Garantia']
      });
    }
    setIsModalOpen(true);
  };

  // Salvar veículo (E3, E5) com storeSync
  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;

    if (selectedVehicle) {
      // Editar
      const updatedItem = { ...selectedVehicle, ...formData };
      const updatedList = storeSync.saveVehicle(storeKey, updatedItem, defaultVehicles);
      setVehicles(updatedList);
    } else {
      // Criar
      const newVehicle = {
        ...formData,
        cover_photo: '/images/FotoChevroletTracker.jpg',
        photos: ['/images/FotoChevroletTracker.jpg']
      };
      const updatedList = storeSync.saveVehicle(storeKey, newVehicle, defaultVehicles);
      setVehicles(updatedList);
    }
    setIsModalOpen(false);
  };

  // Alternar visibilidade no site (Publicado / Oculto)
  const handleTogglePublish = (id) => {
    const v = vehicles.find(item => item.id === id);
    if (v) {
      const updatedItem = { ...v, is_published: v.is_published ? 0 : 1 };
      const updatedList = storeSync.saveVehicle(storeKey, updatedItem, defaultVehicles);
      setVehicles(updatedList);
    }
  };

  // Excluir veículo (E3)
  const handleDeleteVehicle = (id) => {
    if (window.confirm('Tem certeza de que deseja remover este veículo do estoque?')) {
      const updatedList = storeSync.deleteVehicle(storeKey, id, defaultVehicles);
      setVehicles(updatedList);
    }
  };

  // Abertura do gestor de fotos (E4)
  const handleOpenPhotos = (v) => {
    setSelectedVehicle(v);
    setPhotosList(v.photos && v.photos.length > 0 ? [...v.photos] : ['/images/placeholder-carro.jpg']);
    setIsPhotosModalOpen(true);
  };

  // Adicionar foto com validação de tipo e tamanho (E4)
  const handleAddPhotoFile = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photosList.length + files.length > 20) {
      alert('Limite excedido: Você pode enviar até no máximo 20 fotos por veículo.');
      return;
    }

    // Processamento e validação no cliente (E4)
    files.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`Arquivo inválido (${file.name}). Apenas formatos JPEG, PNG e WebP são aceitos.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`Arquivo muito pesado (${file.name}). Tamanho máximo: 10MB.`);
        return;
      }

      // Converte para URL local otimizada
      const objectUrl = URL.createObjectURL(file);
      setPhotosList(prev => [...prev, objectUrl]);
    });
  };

  // Definir foto de capa
  const handleSetCover = (index) => {
    const updated = [...photosList];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected); // Capa fica no topo (índice 0)
    setPhotosList(updated);
  };

  // Reordenar fotos (mover para esquerda ou direita)
  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photosList.length) return;
    const updated = [...photosList];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);
    setPhotosList(updated);
  };

  // Remover foto
  const handleRemovePhoto = (index) => {
    if (photosList.length <= 1) {
      alert('O veículo deve possuir ao menos 1 foto.');
      return;
    }
    setPhotosList(prev => prev.filter((_, i) => i !== index));
  };

  // Salvar fotos no veículo (E4) com storeSync
  const handleSavePhotos = () => {
    if (selectedVehicle) {
      const updatedVehicle = {
        ...selectedVehicle,
        cover_photo: photosList[0] || selectedVehicle.cover_photo,
        photos: photosList
      };
      const updatedList = storeSync.saveVehicle(storeKey, updatedVehicle, defaultVehicles);
      setVehicles(updatedList);
    }
    setIsPhotosModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Barra de Ações do Estoque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Car className="w-6 h-6 text-blue-400" />
            Gestão de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre, edite fotos e controle os veículos publicados na vitrine digital.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenEdit(null)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Veículo
        </button>
      </div>

      {/* 2. Filtros e Busca Rápida (E3) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por modelo, versão ou cor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Chips de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'proprio', label: 'Próprios' },
            { id: 'consignado', label: 'Consignados' },
            { id: 'vendido', label: 'Vendidos' },
            { id: 'oculto', label: 'Ocultos' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tabela / Cards de Veículos (E3, E4, E5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredVehicles.map(car => {
          const isStale = car.days_in_stock > 60 && car.status === 'disponivel';

          return (
            <div
              key={car.id}
              className={`rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between overflow-hidden group ${
                isStale ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Imagem de Capa com Badges */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={car.cover_photo || car.imagemPrincipal || '/images/placeholder-carro.jpg'}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      car.status === 'vendido'
                        ? 'bg-emerald-500/90 text-white'
                        : car.ownership_type === 'consignado'
                        ? 'bg-purple-600/90 text-white'
                        : 'bg-blue-600/90 text-white'
                    }`}>
                      {car.status === 'vendido' ? 'Vendido' : car.ownership_type}
                    </span>

                    {/* Alerta de Dias em Estoque (> 60 dias) */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isStale
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800/90 text-slate-300'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {car.days_in_stock} dias
                    </span>
                  </div>

                  {/* Botão de Visibilidade (Publicado / Oculto) */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(car.id)}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                      car.is_published
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                    }`}
                    title={car.is_published ? 'Publicado na Vitrine (Clique para ocultar)' : 'Oculto na Vitrine (Clique para publicar)'}
                  >
                    {car.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <span className="text-lg font-black tracking-tight">
                      R$ {car.price?.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{car.km?.toLocaleString('pt-BR')} km</span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{car.title}</h3>
                    <p className="text-xs text-slate-400">{car.version} • {car.year}</p>
                  </div>

                  {/* Etiquetas de Destaque (E5) */}
                  {car.tags && car.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {car.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Descrição Curta */}
                  <p className="text-xs text-slate-400 line-clamp-2 pt-1">{car.notes}</p>
                </div>
              </div>

              {/* Ações do Card */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPhotos(car)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  Fotos ({car.photos?.length || 1})
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(car)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Editar Veículo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {hasRole(['proprietario', 'gerente']) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(car.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Excluir Veículo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modal de Cadastro e Edição (E3, E5) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-400" />
                {selectedVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo no Estoque'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo / Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Chevrolet Tracker"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Versão Completa</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: 1.2 Turbo Premier AT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="119900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ano Modelo / Fab</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="2023/2023"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quilometragem (KM)</label>
                  <input
                    type="number"
                    value={formData.km}
                    onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cor</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Estoque (E3)</label>
                  <select
                    value={formData.ownership_type}
                    onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="proprio">Próprio da Loja</option>
                    <option value="consignado">Consignado de Terceiro</option>
                    <option value="parceiro">Parceiro / Repasse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Situação de Venda</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>

              {/* Ficha do Anúncio (E5): Descrição Editável */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Anúncio (E5)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Descreva destaques, revisões e diferenciais do carro..."
                />
              </div>

              {/* Ficha do Anúncio (E5): Itens de Série com Lista de Marcação */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Itens de Série (Marcação Rápida - E5)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {STANDARD_FEATURES.map((item, idx) => {
                    const isChecked = formData.features.includes(item);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-600/10 text-blue-300 font-semibold' : 'text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormData({ ...formData, features: formData.features.filter(f => f !== item) });
                            } else {
                              setFormData({ ...formData, features: [...formData.features, item] });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal do Gestor de Fotos (E4: até 20 fotos, capa, reordenar, remover) */}
      {isPhotosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  Galeria de Fotos: {selectedVehicle?.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Até 20 fotos por veículo. A primeira imagem é a Capa Principal do anúncio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotosModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Upload de Imagens */}
              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center">
                <Upload className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Clique ou arraste até {20 - photosList.length} fotos adicionais
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Formatos aceitos: JPG, PNG, WebP (máx. 10MB por foto com compressão automática)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAddPhotoFile}
                  className="hidden"
                />
              </label>

              {/* Grid de Fotos com Capa e Reordenação (E4) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photosList.map((url, index) => {
                  const isCover = index === 0;

                  return (
                    <div
                      key={index}
                      className={`relative rounded-xl overflow-hidden border bg-slate-950 aspect-video flex flex-col justify-between group ${
                        isCover ? 'border-blue-500 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30' : 'border-slate-800'
                      }`}
                    >
                      <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />

                      {/* Badge de Capa */}
                      {isCover && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-white" />
                          CAPA
                        </div>
                      )}

                      {/* Botões de Ação na Foto (E4: Capa, Reordenar, Remover) */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(index)}
                            className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-500 transition-colors"
                            title="Tornar foto de capa"
                          >
                            Tornar Capa
                          </button>
                        )}

                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, -1)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
                            title="Mover para esquerda"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {index < photosList.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, 1)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
                            title="Mover para direita"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total: <strong className="text-white">{photosList.length} / 20</strong> fotos
              </span>
              <button
                type="button"
                onClick={handleSavePhotos}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30"
              >
                Salvar Galeria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

