const fs = require('fs');

const rawSurvey = fs.readFileSync('/app/raw_survey.csv', 'utf-8');
const lines = rawSurvey.split('\n').filter(Boolean);

// The first row is headers
const headers = lines[0].split(';');

// Columns 3 to 37 are the questions (0 indexed)
// Carimbo de data/hora (0); TEMPO DE CASA (1); ÁREA DE TRABALHO: (2); ...
// 3: ESTE É UM LUGAR DESCONTRAIDO PARA TRABALHAR
// 36: O LIDER DE AREA CONTRATA PESSOAS QUE SE ENQUADRAM BEM AQUI
const questionHeaders = headers.slice(3, 37);

const pillarsMap = {
  "Ambiente e Estrutura": [
    "ESTE É UM LUGAR DESCONTRAIDO PARA TRABALHAR",
    "EU RECEBO EQUIPAMENTOS E RECURSOS NECESSÁRIOS PARA REALIZAR MEU TRABALHO",
    "ESTE É UM LUGAR FISICAMENTE SEGURO PARA TRABALHAR",
    "NOSSAS INSTALAÇÕES CONTRIBUEM PARA UM BOM AMBIENTE DE TRABALHO"
  ],
  "Engajamento e Propósito": [
    "EU GOSTO DE IR TRABALHAR TODAS AS MANHÃS",
    "AS PESSOAS AQUI ESTÃO DISPOSTAS A DAR MAIS DE SI PARA CONCLUIR O TRABALHO",
    "PARA MIM, NÃO É SÓ “MAIS UM EMPREGO”. MEU TRABALHO TEM UM SENTIDO ESPECIAL.",
    "QUANDO VEJO O QUE FAZEMOS POR AQUI, SINTO ORGULHO",
    "TENHO ORGULHO DE CONTAR AS PESSOAS QUE TRABALHO AQUI",
    "EU ME SINTO FELIZ EM FAZER PARTE DESTA EMPRESA",
    "PRETENDO TRABALHAR AQUI POR MUITO TEMPO",
    "SINTO QUE EU FAÇO A DIFERENÇA AQUI"
  ],
  "Liderança e Gestão": [
    "POSSO FAZER QUALQUER PERGUNTA RAZOAVEL AO LIDER DE AREA E OBTER RESPOSTAS DIRETAS",
    "O LIDER DE AREA AGRADECE O BOM TRABALHO E O ESFORÇO EXTRA",
    "O LIDER DE AREA INCENTIVA IDEIAS E SUGESTÕES E AS LEVAM EM CONSIDERAÇÃO DE FORMA SINCERA",
    "O LIDER DE AREA ME MANTÊM INFORMADO SOBRE ASSUNTOS IMPORTANTES E SOBRE MUDANÇAS NA ORGANIZAÇÃO",
    "O LIDER DE AREA TEM UMA VISÃO CLARA DE PARA ONDE ESTAMOS INDO E COMO FAZER PARA CHEGAR LÁ",
    "O LIDER DE AREA ENVOLVE PESSOAS EM DECISÕES A SEREM TOMADAS",
    "O LIDER DE AREA SABE COORDENAR PESSOAS E DISTRIBUIR TAREFAS ADEQUADAMENTE",
    "O LIDER DE AREA AGE DE ACORDO COM O QUE FALA",
    "ACREDITO QUE O LIDER DE AREA SÓ PROMOVE REDUÇÕES DE QUADRO COMO ÚLTIMO RECURSO",
    "O LIDER DE AREA MOSTRA INTERESSE SINCERO POR MIM COMO PESSOA E NÃO SOMENTE COMO EMPREGADO",
    "O LIDER DE AREA CONTRATA PESSOAS QUE SE ENQUADRAM BEM AQUI",
    "SE EU FOR TRATADO INJUSTAMENTE, ACREDITO QUE SEREI OUVIDO E ACABAREI RECEBENDO UM TRATAMENTO JUSTO"
  ],
  "Desenvolvimento Profissional": [
    "A EMPRESA ME OFERECE TREINAMENTO E OUTRAS FORMAS DE DESENVOLVIMENTO PARA O MEU CRESCIMENTO PROFISSIONAL",
    "POSSUO HABILIDADES NECESSARIAS PARA ATUAR NESTE TRABALHO"
  ],
  "Remuneração e Benefícios": [
    "AS PESSOAS AQUI SÃO REMUNERADAS ADEQUADAMENTE EM RELAÇÃO AO MERCADO",
    "OS BENEFICIOS SÃO ADEQUADOS EM RELAÇÃO AO MERCADO"
  ],
  "Relacionamento Interpessoal": [
    "POSSO SER EU MESMO POR AQUI",
    "AQUI AS PESSOAS SE IMPORTAM UMA COM AS OUTRAS",
    "EXISTE UM SENTIMENTO DE “FAMILIA” OU “EQUIPE” POR AQUI",
    "NÓSSempre COMEMORAMOS EVENTOS ESPECIAIS",
    "EU SOU CONSIDERADO IMPORTANTE INDEPENDENTEMENTE DE MINHA POSIÇÃO NA EMPRESA",
    "QUANDO SE ENTRA NESTA EMPRESA, FAZEM VOCÊ SE SENTIR BEM-VINDO"
  ]
};

const mapLikert = (val) => {
  const v = val.trim().toLowerCase();
  if (v.includes("nunca")) return 1;
  if (v.includes("algumas")) return 2;
  if (v.includes("às vezes") || v.includes("ás vezes") || v.includes("as vezes") || v.includes("as veses")) return 3;
  if (v.includes("maioria das vezes")) return 4;
  if (v.includes("sempre")) return 5;
  return 3;
};

const surveyData = [];
const empresasSet = new Set();
const ciclosSet = new Set();
const deptsSet = new Set();

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  if (parts.length < 43) continue;

  const ano = parts[41] ? parts[41].trim() : "2024";
  const genero = parts[42] ? parts[42].trim() : "Não Informado";
  const tempoCasa = parts[1] ? parts[1].trim() : "";
  const area = parts[2] ? parts[2].trim() : "";
  
  // Fake some company and leader based on area if not present
  const empresa = area.toLowerCase().includes("elasa") ? "Elasa" 
                : area.toLowerCase().includes("zampese") ? "Zampese" 
                : "Central Mesh SP";

  empresasSet.add(empresa);
  ciclosSet.add(ano);
  deptsSet.add(area);

  const scores = {};
  let totalS = 0; let totalQ = 0;
  for (let q = 0; q < questionHeaders.length; q++) {
    const qLabel = questionHeaders[q].trim();
    const qValue = parts[q+3] || "Sem Resposta";
    const num = mapLikert(qValue);
    scores[`q${q+1}`] = num;
    totalS += num;
    totalQ++;
  }

  const avg = totalQ > 0 ? totalS / totalQ : 0;
  let enps = 0;
  if (avg >= 4.5) enps = 10;
  else if (avg >= 4) enps = 9;
  else if (avg >= 3.5) enps = 8;
  else if (avg >= 3) enps = 7;
  else enps = 5;

  surveyData.push({
    id: `res-${i}`,
    yearLabel: ano,
    isAnonymous: true,
    empresa: empresa,
    department: area,
    genero: genero,
    idade: "",
    tempoCasa: tempoCasa,
    leader: "Todos", // Or assign random based on dept
    scores: scores,
    enpsScore: enps,
    comment: parts[38] || parts[39] || "",
    sentiment: avg >= 4 ? "Positivo" : avg < 3 ? "Negativo" : "Neutro"
  });
}

// Generate QUESTIONS array
const questionsArrayStr = questionHeaders.map((q, i) => {
  let pillarId = "p6"; // default
  if (pillarsMap["Ambiente e Estrutura"].includes(q)) pillarId = "p5";
  else if (pillarsMap["Engajamento e Propósito"].includes(q)) pillarId = "p7";
  else if (pillarsMap["Liderança e Gestão"].includes(q)) pillarId = "p3";
  else if (pillarsMap["Desenvolvimento Profissional"].includes(q)) pillarId = "p2";
  else if (pillarsMap["Remuneração e Benefícios"].includes(q)) pillarId = "p4";
  else if (pillarsMap["Relacionamento Interpessoal"].includes(q)) pillarId = "p1";
  
  return `{ id: "q${i+1}", pillarId: "${pillarId}", text: "${q.replace(/"/g, '\\"')}" }`;
}).join(",\n  ");

const mockDataString = `
export interface SurveyResponse {
  id: string;
  yearLabel: string;
  isAnonymous: boolean;
  empresa: string;
  department: string;
  genero: string;
  idade?: string;
  tempoCasa?: string;
  escolaridade?: string;
  moradia?: string;
  cursoDesejado?: string;
  leader: string;
  scores: Record<string, number>;
  enpsScore: number;
  comment: string;
  sentiment: "Positivo" | "Neutro" | "Negativo";
}

export const PILLARS = [
  { id: "p1", name: "Relacionamento Interpessoal" },
  { id: "p2", name: "Desenvolvimento Profissional" },
  { id: "p3", name: "Liderança e Gestão" },
  { id: "p4", name: "Remuneração e Benefícios" },
  { id: "p5", name: "Ambiente e Estrutura" },
  { id: "p6", name: "Outros" },
  { id: "p7", name: "Engajamento e Propósito" }
];

export const QUESTIONS = [
  ${questionsArrayStr}
];

export const EMPRESAS = ${JSON.stringify(Array.from(empresasSet))};
export const DEPARTAMENTOS = ${JSON.stringify(Array.from(deptsSet))};
export const CICLOS = ${JSON.stringify(Array.from(ciclosSet).sort().reverse())};
export const GENEROS = ["Masculino", "Feminino", "Não Informado"];
export const LEADERS = ["Todos"];

export const FAIXAS_ETARIAS = ["18 a 24", "25 a 34", "35 a 44", "45 a 54", "55+"];
export const TEMP_CASA = ["Até 1 ano", "Entre 1 e 5 anos", "Entre 6 e 10 anos", "Entre 10 e 20 anos", "Mais de 20 anos"];
export const ESCOLARIDADES = [];
export const MORADIAS = [];
export const CURSOS = [];

export const mockData: SurveyResponse[] = ${JSON.stringify(surveyData, null, 2)};

export const defaultHeadcounts: Record<string, number> = {
  "Elasa": 80,
  "Zampese": 150,
  "Central Mesh SP": 50
};
`;

fs.writeFileSync('/app/applet/src/data/mockData.ts', mockDataString);

console.log("Mock data generated!");
