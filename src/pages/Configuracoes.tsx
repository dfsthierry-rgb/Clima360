import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Database, Download, Lock, Users, Save, CheckCircle2, Upload, Trash2, X } from 'lucide-react';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SurveyResponse, PILLARS, QUESTIONS } from '../data/mockData';
import { cn } from '../lib/utils';

export function Configuracoes() {
  const { allData, empresas, uploadData, clearData, lastUploadDate, processedFilesGlobal } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingFiles, setPendingFiles] = useState<{
    baseIden: File | null;
    baseSemIden: File | null;
  }>({
    baseIden: null,
    baseSemIden: null,
  });

  const baseIdenRef = useRef<HTMLInputElement>(null);
  const baseSemIdenRef = useRef<HTMLInputElement>(null);

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
    
    // Scale 1 (1 point)
    if (v.includes("nunca") || v === "1" || v.includes("discordo totalmente")) return 1;
    
    // Scale 2 (2 points)
    if (v.includes("raramente") || v.includes("quase nunca") || v === "2" || v.includes("discordo em parte") || v.includes("discordo parcialmente")) return 2;
    
    // Scale 3 (3 points)
    if (v.includes("às vezes") || v.includes("ás vezes") || v.includes("as vezes") || v.includes("as veses") || v.includes("algumas vezes") || v === "3" || v.includes("neutro") || v.includes("não concordo nem discordo")) return 3;
    
    // Scale 4 (4 points)
    if (v.includes("maioria das vezes") || v.includes("frequentemente") || v.includes("quase sempre") || v.includes("muitas vezes") || v === "4" || v.includes("concordo em parte") || v.includes("concordo parcialmente")) return 4;
    
    // Scale 5 (5 points)
    if (v.includes("sempre") || v.includes("quase que constantemente") || v === "5" || v.includes("concordo totalmente")) return 5;
    
    // Attempt standard parse if it's purely a number
    const asNum = parseInt(v, 10);
    if (!isNaN(asNum) && asNum >= 1 && asNum <= 5) return asNum;

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
        for (const kw of keywords) {
          const key = Object.keys(row).find(k => k.toLowerCase().includes(kw));
          if (key && row[key] !== undefined && String(row[key]).trim() !== "") {
            return String(row[key]).trim();
          }
        }
        return "Não Informado";
      };
      
      const findValueExact = (keywords: string[]) => {
        for (const kw of keywords) {
          const key = Object.keys(row).find(k => k.toLowerCase() === kw.toLowerCase() || k.toLowerCase().startsWith(kw.toLowerCase() + ":") || k.toLowerCase().startsWith(kw.toLowerCase() + " "));
          if (key && row[key] !== undefined && String(row[key]).trim() !== "") {
            return String(row[key]).trim();
          }
        }
        return "Não Informado";
      };

      const ano = row["ANO"] ? String(row["ANO"]).trim() : "2024";
      const genero = findValue(["gênero", "genero", "sexo"]);
      
      // Force tempoCasa from Sem Identificação as per request if isAnon, otherwise empty, or just use exact
      const tempoCasaRaw = findValueExact(["tempo de casa", "tempo na empresa", "idade de empresa", "tempo"]);
      const tempoCasa = isAnon ? tempoCasaRaw : "Não Informado";
      
      const escolaridade = findValue(["escolaridade", "grau de", "formação", "formacao"]);
      const cursoDesejado = findValue(["quais os próximos cursos", "pretende estudar", "qual graduação", "gostaria de fazer os seguintes", "qual curso"]);
      const moradia = findValue(["moradia", "habitação", "habitacao", "onde mora", "casa própria", "residência"]);
      const idade = findValue(["idade", "faixa et", "anos você tem", "qual a sua"]);
      const computador = findValue(["computador", "notebook"]);
      const internet = findValue(["internet"]);
      const leader = findValueExact(["lider", "líder", "gestor", "chefia", "liderança", "quem é seu", "quem e seu", "supervisor", "coordenador", "diretor", "nome do lider", "seu lider"]);

      let extractedName = "Não Informado";
      const nameKeys = Object.keys(row).filter(k => {
          const lower = k.toLowerCase().trim();
          // specifically match known variations
          return lower.includes('nome') || lower.includes('name') || lower.includes('e-mail') || lower.includes('email') || lower.includes('dados pessoais');
      }).filter(k => {
          const lower = k.toLowerCase();
          return !lower.includes('lider') && !lower.includes('líder') && !lower.includes('gestor') && !lower.includes('chefia') && !lower.includes('supervisor');
      });

      let bestKey = nameKeys.find(k => k.toLowerCase().includes('dados pessoais - nome')) ||
                    nameKeys.find(k => k.toLowerCase().includes('nome:')) ||
                    nameKeys.find(k => k.toLowerCase().includes('nome')) ||
                    nameKeys.find(k => k.toLowerCase().includes('email')) ||
                    nameKeys[0];
      
      if (bestKey && row[bestKey] !== undefined && String(row[bestKey]).trim() !== "") {
          extractedName = String(row[bestKey]).trim();
      }
      const nomeFuncionario = extractedName;

      const estudandoAtualmente = findValue(["estudando atualmente", "estuda atualmente"]);
      const cursoAtual = findValue(["qual curso", "se sim, qual"]);
      const estadoCivil = findValue(["estado civil", "civil"]);
      const possuiFilhos = findValue(["possui filhos"]);
      const qtdFilhos = findValue(["se sim, quantos"]);
      const filhosMenor4 = findValue(["menor que 4"]);
      const filhos5a11 = findValue(["entre 5 e 11"]);
      const filhos12a18 = findValue(["entre 12 e 18"]);
      const filhosMaior18 = findValue(["acima de 18"]);
      const outrosDependentes = findValue(["outros dependentes"]);
      const rendaFamiliar = findValue(["renda", "renda familiar"]);
      const harmoniaLar = findValue(["harmonia no meu lar", "harmonia"]);
      const rendaSupre = findValue(["renda familiar supre", "supre todas"]);
      const gostoFicarCasa = findValue(["gosto de ficar em casa"]);
      const ajudaCasa = findValue(["ajudamos uns aos outros", "ajudamos"]);
      const familiaHorasVagas = findValue(["nas horas vagas", "sempre com minha familia"]);
      const atualizadoNoticias = findValue(["atualizado com as noticias", "atualizado com as notícias"]);
      const gostoEstudar = findValue(["gosto de estudar", "mantendo-me sempre atualizado"]);
      const atuoAreaFormado = findValue(["atuo na area que sou formado", "atuo na área"]);
      const horasVagas = findValue(["descreva o que gosta de fazer nas horas vagas", "horas vagas", "gosta de fazer"]);
      const maiorSonho = findValue(["maior sonho"]);
      const proximoPassoSonho = findValue(["próximo passo", "proximo passo", "buscar meu sonho"]);

      const motivoPermanencia = findValue(["o principal motivo que me faz permanecer", "motivo para permanecer", "ancoragem", "permanecer na empresa", "motivo que o faz permanecer", "permanecer nela"]);
      const oQueTornaBomLugar = findValue(["o que torna a empresa um bom", "o que torna a sua empresa um bom lugar", "pontos fortes", "o que a empresa tem de bom", "bom lugar para", "bom lugar", "torna a empresa", "torna a sua empresa", "pontos positivos", "o que você mais gosta", "o que mais gosta", "agrada", "um lugar"]);
      const oQuePodeMelhorar = findValue(["o que precisa ser melhorado na sua empresa", "precisa ser melhorado", "pontos a melhorar", "dores", "fraquezas", "melhorado", "pontos negativos"]);
      const ondeQuerEstar5Anos = findValue(["onde você quer estar daqui 5 anos"]);

      let areaRaw = findValueExact(["área de trabalho", "area de trabalho", "departamento"]);
      let area = isAnon ? areaRaw : "Não Informado";
      if (area === "Não Informado" && areaRaw !== "Não Informado") area = areaRaw; 
      if (area === "Não Informado") area = "Geral";

      area = area.replace("Administrativo: Financeiro / Faturamento / RH", "Administrativo");

      const explicitEmpresaRaw = findValueExact(["empresa"]);
      const explicitEmpresa = !isAnon ? explicitEmpresaRaw : "Não Informado";
      let empresa = explicitEmpresa !== "Não Informado" ? explicitEmpresa : "Central Mesh São Paulo";
      
      if (explicitEmpresa === "Não Informado" && isAnon && areaRaw !== "Não Informado") {
        const areaLower = areaRaw.toLowerCase();
        if (areaLower.includes("elasa")) empresa = "Elasa";
        else if (areaLower.includes("zampese")) empresa = "Zampese";
        else if (areaLower.includes("curitiba")) empresa = "Central Mesh Curitiba";
        else if (areaLower.includes("pernambuco")) empresa = "Central Mesh Pernambuco";
      }

      const scores: Record<string, number> = {};
      let totalS = 0; let totalQ = 0;
      
      QUESTIONS.forEach((q, idx) => {
        const cleanQ = q.text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
        const firstWords = cleanQ.split(" ").slice(0, 8).join(" ");
        const key = Object.keys(row).find(k => {
          const cleanK = k.toLowerCase().replace(/[^\w\s]/gi, '').trim();
          return cleanK === cleanQ || cleanK.includes(firstWords) || cleanQ.includes(cleanK);
        });
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
        if (avg >= 4.2) enps = 10;
        else if (avg >= 3.8) enps = 9;
        else if (avg >= 3.2) enps = 8;
        else if (avg >= 2.6) enps = 7;
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
        leader,
        escolaridade,
        cursoDesejado,
        moradia,
        computador,
        internet,
        estudandoAtualmente,
        cursoAtual,
        estadoCivil,
        possuiFilhos,
        qtdFilhos,
        filhosMenor4,
        filhos5a11,
        filhos12a18,
        filhosMaior18,
        outrosDependentes,
        rendaFamiliar,
        harmoniaLar,
        rendaSupre,
        gostoFicarCasa,
        ajudaCasa,
        familiaHorasVagas,
        atualizadoNoticias,
        gostoEstudar,
        atuoAreaFormado,
        horasVagas,
        maiorSonho,
        proximoPassoSonho,
        motivoPermanencia,
        oQueTornaBomLugar,
        oQuePodeMelhorar,
        ondeQuerEstar5Anos,
        nomeFuncionario,
        scores,
        enpsScore: enps,
        comment: comments,
        sentiment: avg >= 4 ? "Positivo" : avg < 3 ? "Negativo" : "Neutro"
      });
    }
    return parsedResponses;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; action: 'upload' | 'clear' | null }>({ isOpen: false, action: null });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const executeAction = async () => {
    if (passwordInput !== '1133') {
      setPasswordError('Senha incorreta.');
      return;
    }
    
    setPasswordError('');
    setPasswordModal({ isOpen: false, action: null });
    setPasswordInput('');
    setIsProcessing(true);

    try {
      if (passwordModal.action === 'upload') {
        let allNewData: SurveyResponse[] = [];
        let loadedFiles: string[] = [];
        
        if (pendingFiles.baseIden) {
          const baseIdenData = await parseFile(pendingFiles.baseIden, false);
          allNewData = [...allNewData, ...baseIdenData];
          loadedFiles.push("Com Identificação");
        }

        if (pendingFiles.baseSemIden) {
          const baseSemIdenData = await parseFile(pendingFiles.baseSemIden, true);
          allNewData = [...allNewData, ...baseSemIdenData];
          loadedFiles.push("Sem Identificação");
        }

        if (allNewData.length > 0) {
          await clearData();
          await uploadData(allNewData, loadedFiles);

          if (baseIdenRef.current) baseIdenRef.current.value = '';
          if (baseSemIdenRef.current) baseSemIdenRef.current.value = '';

          setPendingFiles({ baseIden: null, baseSemIden: null });
        }
      } else if (passwordModal.action === 'clear') {
        await clearData();
        
        if (baseIdenRef.current) baseIdenRef.current.value = '';
        if (baseSemIdenRef.current) baseSemIdenRef.current.value = '';

        setPendingFiles({ baseIden: null, baseSemIden: null });
      }
    } catch (err: any) {
      console.error('Erro na operação:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAllFiles = async () => {
    setPasswordModal({ isOpen: true, action: 'upload' });
  };

  const handleFileSelect = (key: keyof typeof pendingFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPendingFiles(prev => ({ ...prev, [key]: file }));
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
            <label className="text-sm font-semibold text-slate-400">Base Com Identificação</label>
            <input ref={baseIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('baseIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Base Sem Identificação</label>
            <input ref={baseSemIdenRef} type="file" accept=".csv, .xlsx, .xls" onChange={e => handleFileSelect('baseSemIden', e)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          </div>
        </div>

        {processedFilesGlobal && processedFilesGlobal.length > 0 && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <h3 className="text-sm font-bold text-emerald-400 mb-2">Bases Carregadas:</h3>
            <ul className="list-disc list-inside pl-4 text-emerald-300 text-sm">
              {processedFilesGlobal.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            disabled={(!pendingFiles.baseIden && !pendingFiles.baseSemIden) || isProcessing}
            onClick={handleProcessAllFiles}
            className={cn("flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors", 
              ((!pendingFiles.baseIden && !pendingFiles.baseSemIden) || isProcessing) ? "opacity-50 cursor-not-allowed" : "")}
          >
            <Upload size={18} />
            {isProcessing ? 'Processando...' : 'Carregar Bases Selecionadas'}
          </button>
          
          <button 
            disabled={isProcessing}
            onClick={() => setPasswordModal({ isOpen: true, action: 'clear' })}
            className={cn("flex items-center gap-2 px-6 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-medium rounded-lg transition-colors", 
              isProcessing ? "opacity-50 cursor-not-allowed" : "")}
          >
            <Trash2 size={18} />
            {isProcessing ? 'Limpando...' : 'Limpar Bases'}
          </button>
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

      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-indigo-400" />
                Autenticação Necessária
              </h3>
              <button 
                onClick={() => {
                  setPasswordModal({ isOpen: false, action: null });
                  setPasswordInput('');
                  setPasswordError('');
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              {passwordModal.action === 'upload' 
                ? 'Para carregar e processar as bases de dados, é necessário confirmar a senha de administrador.' 
                : 'Esta ação apagará todos os dados de pesquisa permanentemente. Digite a senha para confirmar.'}
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Senha de acesso"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') executeAction();
                }}
              />
              
              {passwordError && (
                <p className="text-sm text-rose-400 flex items-center gap-1.5">
                  <X size={14} /> {passwordError}
                </p>
              )}

              <button
                onClick={executeAction}
                className={cn("w-full py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2", 
                  passwordModal.action === 'clear' 
                    ? "bg-rose-600 hover:bg-rose-500 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white")}
              >
                <CheckCircle2 size={18} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
