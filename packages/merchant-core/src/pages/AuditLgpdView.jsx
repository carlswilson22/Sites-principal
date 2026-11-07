/**
 * packages/merchant-core/src/pages/AuditLgpdView.jsx
 * Governança, Trilha de Auditoria & Conformidade LGPD (Nível 3 - A8).
 * Acesso exclusivo para o Proprietário.
 */
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Download, UserX, Search, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function AuditLgpdView() {
  const [logs, setLogs] = useState([]);
  const [clientIdToExport, setClientIdToExport] = useState('');
  const [exportResult, setExportResult] = useState(null);
  const [anonFeedback, setAnonFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAuditLogs();
      setLogs(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLgpd = async (e) => {
    e.preventDefault();
    if (!clientIdToExport) return;
    const res = await apiClient.exportLgpdData(clientIdToExport);
    setExportResult(res);
  };

  const handleAnonymize = async () => {
    if (!clientIdToExport) return;
    if (!window.confirm('Atenção: A anonimização dos dados do titular é irreversível e atende ao Artigo 18 da LGPD (Direito ao Esquecimento). Deseja continuar?')) {
      return;
    }
    const res = await apiClient.anonymizeLgpd(clientIdToExport);
    setAnonFeedback(res);
    setExportResult(null);
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Governança, Auditoria & LGPD</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tier 3 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Registro imutável de ações sensíveis (quem, o quê, quando) e atendimento aos direitos dos titulares da Lei 13.709/2018.
          </p>
        </div>
      </div>

      {/* Seção LGPD: Atendimento aos Direitos do Titular */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Portal de Atendimento aos Direitos do Titular (Art. 18 LGPD)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Localize o cliente pelo código para exportar a totalidade de seus dados pessoais ou executar a anonimização irreversível:
        </p>

        <form onSubmit={handleExportLgpd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            required
            value={clientIdToExport}
            onChange={e => setClientIdToExport(e.target.value)}
            placeholder="Informe o ID do Cliente (ex: 1)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Dados (Art. 18, II)
          </button>
          <button
            type="button"
            onClick={handleAnonymize}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-xl border border-red-500/40 transition-colors"
          >
            <UserX className="w-4 h-4" />
            Anonimizar Titular (Art. 18, VI)
          </button>
        </form>

        {anonFeedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            {anonFeedback.message}
          </div>
        )}

        {exportResult && (
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Dossiê Exportado do Titular
            </h4>
            <pre className="text-[11px] bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 font-mono">
              {JSON.stringify(exportResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Trilha de Auditoria (Audit Logs) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Trilha de Auditoria e Eventos de Segurança</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Últimas 100 ações registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Data / Hora</th>
                <th className="px-5 py-3">Usuário</th>
                <th className="px-5 py-3">Papel</th>
                <th className="px-5 py-3">Ação Executada</th>
                <th className="px-5 py-3">Entidade Afetada</th>
                <th className="px-5 py-3">IP Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    Carregando registros de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors text-xs font-mono">
                    <td className="px-5 py-3 text-slate-400">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-3 font-sans font-medium text-slate-200">{l.user_name || 'Sistema'}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 text-slate-300">
                        {l.user_role}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-emerald-400">{l.action}</td>
                    <td className="px-5 py-3 text-slate-300">{l.entity} #{l.entity_id}</td>
                    <td className="px-5 py-3 text-slate-500">{l.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
