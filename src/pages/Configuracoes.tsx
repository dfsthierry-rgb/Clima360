import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Database, Download, Lock, Users, Save, CheckCircle2, Upload, Trash2, X } from 'lucide-react';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SurveyResponse, PILLARS, QUESTIONS } from '../data/mockData';

export function Configuracoes() {
  const { headcounts, setHeadcounts, allData, empresas, uploadData, clearData, lastUploadDate } = useAppContext();
  const [localHeadcounts, setLocalHeadcounts] = useState(headcounts);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const histIdenRef = useRef<HTMLInputElement>(null);
  const histSemIdenRef = useRef<HTMLInputElement>(null);
  const vigIdenRef = useRef<HTMLInputElement>(null);
  const vigSemIdenRef = useRef<HTMLInputElement>(null);

  const [pendingFiles, setPendingFiles] = useState<{
    histIden: File | null;
    histSemIden: File | null;
    vigIden: File | null;
    vigSemIden: File | null;
  }>({
    histIden: null,
    histSemIden: null,
    vigIden: null,
    vigSemIden: null,
  });

  const handleSave = () => {
    setHeadcounts(localHeadcounts);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadCSV = () => {
    const headers = ["ID", "Ano", "Anonimo", "Empresa", "Departamento", "Genero", "Sentimento", "eNPS", "Comentario"];
    const rows = allData.map(r => [
      r.id, r.yearLabel, r.isAnonymous ? "Sim" : "Nao", r.empresa, r.department, r.genero, r.sentiment, r.enpsScore, `"${r.comment.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clima_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const mapLikert = (val: string) => {
    if (!val) return 3;
    const v = val.trim().toLowerCase();
    if (v.includes("nunca")) return 1;
    if (v.includes("algumas")) return 2;
    if (v.includes("às vezes") || v.includes("ás vezes") || v.includes("as vezes") || v.includes("as veses")) return 3;
    if (v.includes("maioria das vezes")) return 4;
    if (v.includes("sempre")) return 5;
    return 3;
  };

  const parseFile = async (file: File | null, isAnon: boolean): Promise<SurveyResponse[]> => {
    if (!file) return [];
    return new Promise((resolve) => {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(processRawData(results.data, isAnon));
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          resolve(processRawData(data, isAnon));
        };
        reader.readAsBinaryString(file);
      } else {
        resolve([]);
      }
    });
  };

  const processRawData = (data: any[], isAnon: boolean): SurveyResponse[] => {
    const parsedResponses: SurveyResponse[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row["Carimbo de data/hora"]) continue;
      
      const findValue = (keywords: string[]) => {
        const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
        return key && row[key] ? String(row[key]).trim() : "Não Informado";
      };

      const ano = row["ANO"] ? String(row["ANO"]).trim() : "2024";
      const genero = findValue(["gênero", "genero", "sexo"]);
      const tempoCasa = findValue(["tempo de", "tempo na", "idade de empresa", "quanto tempo você", "tempo "]);
      const escolaridade = findValue(["escolaridade", "grau de", "formação", "formacao"]);
      const cursoDesejado = findValue(["curso", "pretende estudar", "graduação", "graduacao", "estudo"]);
      const moradia = findValue(["moradia", "onde mora", "casa própria", "residência"]);
      const idade = findValue(["idade", "faixa et", "anos você tem", "qual a sua", "anos "]);
      let area = findValue(["área", "area", "departamento", "setor", "unidade", "lotação", "lotacao"]);
      if (area === "Não Informado") area = "Geral";

      area = area.replace("Administrativo: Financeiro / Faturamento / RH", "Administrativo");

      const empresa = area.toLowerCase().includes("elasa") ? "Elasa" 
                    : area.toLowerCase().includes("zampese") ? "Zampese" 
                    : "Central Mesh São Paulo";

      const scores: Record<string, number> = {};
      let totalS = 0; let totalQ = 0;
      
      QUESTIONS.forEach((q, idx) => {
        const key = Object.keys(row).find(k => k.trim().toLowerCase() === q.text.toLowerCase() || k.trim().toLowerCase().includes(q.text.split(" ")[0].toLowerCase()));
        const val = key ? row[key] : "Sem Resposta";
        const num = mapLikert(String(val));
        scores[`q${idx+1}`] = num;
        totalS += num;
        totalQ++;
      });

      const avg = totalQ > 0 ? totalS / totalQ : 0;
      const enpsKey = Object.keys(row).find(k => k.toLowerCase().includes("e se te perguntassem") || k.toLowerCase().includes("recomendaria") || k.toLowerCase().includes("0 a 10") || k.toLowerCase().includes("zero a dez") || k.toLowerCase() === "enps");
      let enps = -1;
      if (enpsKey && row[enpsKey]) {
        const val = parseInt(String(row[enpsKey]));
        if (!isNaN(val)) enps = val;
      }
      if (enps === -1) {
        if (avg >= 4.5) enps = 10;
        else if (avg >= 4) enps = 9;
        else if (avg >= 3.5) enps = 8;
        else if (avg >= 3) enps = 7;
        else enps = 5;
      }

      const commentKeys = Object.keys(row).filter(k => k.toLowerCase().includes("motivo") || k.toLowerCase().includes("torna") || k.toLowerCase().includes("melhorado") || k.toLowerCase().includes("comentário") || k.toLowerCase().includes("sugestão"));
      const comments = commentKeys.map(k => row[k]).filter(v => v && String(v).trim().length > 0).join(" | ");

      parsedResponses.push({
        id: `res-${Date.now()}-${i}-${Math.random()}`,
        yearLabel: ano,
        isAnonymous: isAnon,
        empresa,
        department: area,
        genero: genero.length > 2 ? genero : "Não Informado",
        idade,
        tempoCasa,
        leader: "Todos",
        escolaridade,
        cursoDesejado,
        moradia,
        scores,
        enpsScore: enps,
        comment: comments,
        sentiment: avg >= 4 ? "Positivo" : avg < 3 ? "Negativo" : "Neutro"
      });
    }
    return parsedResponses;
  };

  const handleProcessAllFiles = async () => {
    let allNewData: SurveyResponse[] = [];
    
    const histIdenData = await parseFile(pendingFiles.histIden, false);
    const histSemIdenData = await parseFile(pendingFiles.histSemIden, true);
    const vigIdenData = await parseFile(pendingFiles.vigIden, false);
    const vigSemIdenData = await parseFile(pendingFiles.vigSemIden, true);

    allNewData = [...histIdenData, ...histSemIdenData, ...vigIdenData, ...vigSemIdenData];

    if (allNewData.length > 0) {
      await uploadData(allNewData);

      if (histIdenRef.current) histIdenRef.current.value = '';
      if (histSemIdenRef.current) histSemIdenRef.current.value = '';
      if (vigIdenRef.current) vigIdenRef.current.value = '';
      if (vigSemIdenRef.current) vigSemIdenRef.current.value = '';

      alert(`Dados carregados com sucesso! (${allNewData.length} registros inseridos)`);
      setPendingFiles({ histIden: null, histSemIden: null, vigIden: null, vigSemIden: null });
    } else {
      alert('Nenhum dado encontrado nos arquivos selecionados.');
    }
  };

  const handleFileSelect = (key: keyof typeof pendingFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPendingFiles(prev => ({ ...prev, [key]: file }));
  };

  const [customDepts, setCustomDepts] = useState<string[]>([]);
  const [removedCompanies, setRemovedCompanies] = useState<string[]>([]);
  const [newDeptName, setNewDeptName] = useState('');

  const hrCompanies = Array.from(new Set([
    "Elasa", "Zampese", "Central Mesh São Paulo", "Administrativo", "Operacao", 
    ...empresas, ...customDepts, ...Object.keys(localHeadcounts)
  ])).filter(c => !removedCompanies.includes(c));

  const handleAddDept = () => {
    if (newDeptName.trim() && !hrCompanies.includes(newDeptName.trim())) {
      setCustomDepts(prev => [...prev, newDeptName.trim()]);
      setRemovedCompanies(prev => prev.filter(c => c !== newDeptName.trim())); // un-remove if it was removed
      setLocalHeadcounts(prev => ({ ...prev, [newDeptName.trim()]: 0 }));
      setNewDeptName('');
    }
  };

  const handleRemoveDept = (dept: string) => {
    setRemovedCompanies(prev => [...prev, dept]);
    const newHc = { ...localHeadcounts };
    delete newHc[dept];
    setLocalHeadcounts(newHc);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
             <Database className="text-indigo-400" />
             <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Gerenciamento de Dados</h2>
          </div>
          {lastUploadDate && (
             <span className="text-xs text-slate-400">Última atualização: {lastUploadDate}</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Histórico Com Identificação</label>
            <input ref={histIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('histIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Histórico Sem Identificação</label>
            <input ref={histSemIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('histSemIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Ano Vigente Com Identificação</label>
            <input ref={vigIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('vigIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Ano Vigente Sem Identificação</label>
            <input ref={vigSemIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('vigSemIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleProcessAllFiles}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            <Upload size={18} />
            Carregar Bases Selecionadas
          </button>
          
          <button 
            onClick={async () => {
              if (window.confirm('Tem certeza que deseja limpar todas as bases? Ao continuar as bases serão apagadas.')) {
                await clearData();
                setLocalHeadcounts({});
                setCustomDepts([]);
                setRemovedCompanies([]);
                
                if (histIdenRef.current) histIdenRef.current.value = '';
                if (histSemIdenRef.current) histSemIdenRef.current.value = '';
                if (vigIdenRef.current) vigIdenRef.current.value = '';
                if (vigSemIdenRef.current) vigSemIdenRef.current.value = '';

                setPendingFiles({ histIden: null, histSemIden: null, vigIden: null, vigSemIden: null });
                
                alert('Bases limpas com sucesso.');
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-medium rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            Limpar Bases
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <Users className="text-indigo-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Dimensionamento de Headcount Corporativo</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {hrCompanies.map(emp => (
            <div key={emp} className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-400">{emp}</label>
                <button onClick={() => handleRemoveDept(emp)} className="text-slate-500 hover:text-rose-400 transition-colors p-1" title={`Excluir ${emp}`}>
                  <X size={14} />
                </button>
              </div>
              <input 
                type="number" 
                value={localHeadcounts[emp] || 0}
                onChange={e => setLocalHeadcounts({...localHeadcounts, [emp]: parseInt(e.target.value) || 0})}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
              />
            </div>
          ))}
        </div>

        <div className="flex items-end gap-4 mb-6 pt-4 border-t border-slate-800/50">
          <div className="flex flex-col gap-2 flex-1 max-w-xs">
            <label className="text-sm font-semibold text-slate-400">Adicionar Departamento</label>
            <input 
              type="text" 
              placeholder="Nome do Departamento"
              value={newDeptName}
              onChange={e => setNewDeptName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddDept()}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
            />
          </div>
          <button 
            onClick={handleAddDept}
            disabled={!newDeptName.trim()}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? "Gravado com Sucesso" : "Atualizar Quotas"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <Database className="text-indigo-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Repositório de Links (Bases de Dados)</h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Forms Vigente (Anônimo)</label>
            <input type="text" defaultValue="https://forms.gle/kiLJ7u8eVhbMdfbn9" className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 opacity-80" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Forms Vigente (Identificado)</label>
            <input type="text" defaultValue="https://forms.gle/DrbT95ccp4rgeAwC9" className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <Download className="text-indigo-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Exportação de Dados</h2>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download size={18} />
            Baixar CSV Unificado (Identificado/Anônimo)
          </button>
        </div>
      </div>

    </div>
  );
}
