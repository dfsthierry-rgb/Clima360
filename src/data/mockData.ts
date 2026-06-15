
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
  computador?: string;
  internet?: string;
  estudandoAtualmente?: string;
  cursoAtual?: string;
  estadoCivil?: string;
  possuiFilhos?: string;
  qtdFilhos?: string;
  filhosMenor4?: string;
  filhos5a11?: string;
  filhos12a18?: string;
  filhosMaior18?: string;
  outrosDependentes?: string;
  rendaFamiliar?: string;
  harmoniaLar?: string;
  rendaSupre?: string;
  gostoFicarCasa?: string;
  ajudaCasa?: string;
  familiaHorasVagas?: string;
  atualizadoNoticias?: string;
  gostoEstudar?: string;
  atuoAreaFormado?: string;
  horasVagas?: string;
  maiorSonho?: string;
  proximoPassoSonho?: string;
  motivoPermanencia?: string;
  oQueTornaBomLugar?: string;
  oQuePodeMelhorar?: string;
  ondeQuerEstar5Anos?: string;
  nomeFuncionario?: string; // from Email or Nome if available
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
  { id: "p7", name: "Engajamento e Propósito" }
];

export const QUESTIONS = [
  { id: "q1", pillarId: "p5", text: "ESTE É UM LUGAR DESCONTRAIDO PARA TRABALHAR" },
  { id: "q2", pillarId: "p5", text: "EU RECEBO EQUIPAMENTOS E RECURSOS NECESSÁRIOS PARA REALIZAR MEU TRABALHO" },
  { id: "q3", pillarId: "p7", text: "EU GOSTO DE IR TRABALHAR TODAS AS MANHÃS" },
  { id: "q4", pillarId: "p5", text: "ESTE É UM LUGAR FISICAMENTE SEGURO PARA TRABALHAR" },
  { id: "q5", pillarId: "p7", text: "AS PESSOAS AQUI ESTÃO DISPOSTAS A DAR MAIS DE SI PARA CONCLUIR O TRABALHO" },
  { id: "q6", pillarId: "p3", text: "POSSO FAZER QUALQUER PERGUNTA RAZOAVEL AO LIDER DE AREA E OBTER RESPOSTAS DIRETAS" },
  { id: "q7", pillarId: "p2", text: "A EMPRESA ME OFERECE TREINAMENTO E OUTRAS FORMAS DE DESENVOLVIMENTO PARA O MEU CRESCIMENTO PROFISSIONAL" },
  { id: "q8", pillarId: "p2", text: "POSSUO HABILIDADES NECESSARIAS PARA ATUAR NESTE TRABALHO" },
  { id: "q9", pillarId: "p3", text: "O LIDER DE AREA AGRADECE O BOM TRABALHO E O ESFORÇO EXTRA" },
  { id: "q10", pillarId: "p4", text: "AS PESSOAS AQUI SÃO REMUNERADAS ADEQUADAMENTE EM RELAÇÃO AO MERCADO" },
  { id: "q11", pillarId: "p4", text: "OS BENEFICIOS SÃO ADEQUADOS EM RELAÇÃO AO MERCADO" },
  { id: "q12", pillarId: "p7", text: "PARA MIM, NÃO É SÓ “MAIS UM EMPREGO”. MEU TRABALHO TEM UM SENTIDO ESPECIAL." },
  { id: "q13", pillarId: "p3", text: "O LIDER DE AREA INCENTIVA IDEIAS E SUGESTÕES E AS LEVAM EM CONSIDERAÇÃO DE FORMA SINCERA" },
  { id: "q14", pillarId: "p7", text: "QUANDO VEJO O QUE FAZEMOS POR AQUI, SINTO ORGULHO" },
  { id: "q15", pillarId: "p3", text: "O LIDER DE AREA ME MANTÊM INFORMADO SOBRE ASSUNTOS IMPORTANTES E SOBRE MUDANÇAS NA ORGANIZAÇÃO" },
  { id: "q16", pillarId: "p3", text: "O LIDER DE AREA TEM UMA VISÃO CLARA DE PARA ONDE ESTAMOS INDO E COMO FAZER PARA CHEGAR LÁ" },
  { id: "q17", pillarId: "p3", text: "O LIDER DE AREA ENVOLVE PESSOAS EM DECISÕES A SEREM TOMADAS" },
  { id: "q18", pillarId: "p3", text: "O LIDER DE AREA SABE COORDENAR PESSOAS E DISTRIBUIR TAREFAS ADEQUADAMENTE" },
  { id: "q19", pillarId: "p1", text: "POSSO SER EU MESMO POR AQUI" },
  { id: "q20", pillarId: "p1", text: "AQUI AS PESSOAS SE IMPORTAM UMA COM AS OUTRAS" },
  { id: "q21", pillarId: "p3", text: "O LIDER DE AREA AGE DE ACORDO COM O QUE FALA" },
  { id: "q22", pillarId: "p5", text: "NOSSAS INSTALAÇÕES CONTRIBUEM PARA UM BOM AMBIENTE DE TRABALHO" },
  { id: "q23", pillarId: "p7", text: "TENHO ORGULHO DE CONTAR AS PESSOAS QUE TRABALHO AQUI" },
  { id: "q24", pillarId: "p1", text: "EXISTE UM SENTIMENTO DE “FAMILIA” OU “EQUIPE” POR AQUI" },
  { id: "q25", pillarId: "p1", text: "NÓSSempre COMEMORAMOS EVENTOS ESPECIAIS" },
  { id: "q26", pillarId: "p3", text: "ACREDITO QUE O LIDER DE AREA SÓ PROMOVE REDUÇÕES DE QUADRO COMO ÚLTIMO RECURSO" },
  { id: "q27", pillarId: "p3", text: "SE EU FOR TRATADO INJUSTAMENTE, ACREDITO QUE SEREI OUVIDO E ACABAREI RECEBENDO UM TRATAMENTO JUSTO" },
  { id: "q28", pillarId: "p3", text: "O LIDER DE AREA MOSTRA INTERESSE SINCERO POR MIM COMO PESSOA E NÃO SOMENTE COMO EMPREGADO" },
  { id: "q29", pillarId: "p7", text: "EU ME SINTO FELIZ EM FAZER PARTE DESTA EMPRESA" },
  { id: "q30", pillarId: "p7", text: "PRETENDO TRABALHAR AQUI POR MUITO TEMPO" },
  { id: "q31", pillarId: "p1", text: "EU SOU CONSIDERADO IMPORTANTE INDEPENDENTEMENTE DE MINHA POSIÇÃO NA EMPRESA" },
  { id: "q32", pillarId: "p7", text: "SINTO QUE EU FAÇO A DIFERENÇA AQUI" },
  { id: "q33", pillarId: "p1", text: "QUANDO SE ENTRA NESTA EMPRESA, FAZEM VOCÊ SE SENTIR BEM-VINDO" },
  { id: "q34", pillarId: "p3", text: "O LIDER DE AREA CONTRATA PESSOAS QUE SE ENQUADRAM BEM AQUI" }
];

export const EMPRESAS = ["Central Mesh São Paulo","Elasa"];
export const DEPARTAMENTOS = ["Administrativo: Financeiro / Faturamento / RH","Operação Elasa"];
export const CICLOS = ["2025"];
export const GENEROS = ["Feminino","Masculino"];
export const LEADERS = ["Todos"];

export const FAIXAS_ETARIAS = ["18 a 24", "25 a 34", "35 a 44", "45 a 54", "55+"];
export const TEMP_CASA = ["Até 1 ano", "Entre 1 e 5 anos", "Entre 6 e 10 anos", "Entre 10 e 20 anos", "Mais de 20 anos"];
export const ESCOLARIDADES = [];
export const MORADIAS = [];
export const CURSOS = [];

export const mockData: SurveyResponse[] = [];

export const defaultHeadcounts: Record<string, number> = {};
