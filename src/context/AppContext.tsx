import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import localforage from 'localforage';
import { SurveyResponse, PILLARS, QUESTIONS } from '../data/mockData';

export interface Filters {
  ciclo: string;
  empresa: string;
  departamento: string;
  genero: string;
  tipoPesquisa: string;
  lider: string;
}

interface AppContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredData: SurveyResponse[];
  allData: SurveyResponse[];
  headcounts: Record<string, number>;
  setHeadcounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  empresas: string[];
  departamentos: string[];
  ciclos: string[];
  generos: string[];
  leaders: string[];
  uploadData: (newData: SurveyResponse[], newHeadcounts?: Record<string, number>) => Promise<void>;
  clearData: () => Promise<void>;
  lastUploadDate: string | null;
  isDataLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>({
    ciclo: 'Todos',
    empresa: 'Todos',
    departamento: 'Todos',
    genero: 'Todos',
    tipoPesquisa: 'Ambas',
    lider: 'Todos',
  });

  const [allData, setAllData] = useState<SurveyResponse[]>([]);
  const [headcounts, setHeadcounts] = useState<Record<string, number>>({});
  const [lastUploadDate, setLastUploadDate] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const storedData = await localforage.getItem<SurveyResponse[]>('survey_allData');
        const storedHeadcounts = await localforage.getItem<Record<string, number>>('survey_headcounts');
        const storedUploadDate = await localforage.getItem<string>('survey_lastUploadDate');
        
        if (storedData) setAllData(storedData);
        if (storedHeadcounts) setHeadcounts(storedHeadcounts);
        if (storedUploadDate) setLastUploadDate(storedUploadDate);
      } catch (err) {
        console.error("Error loading data from localforage", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, []);

  const uploadData = async (newData: SurveyResponse[], newHeadcounts?: Record<string, number>) => {
    const updatedData = [...allData, ...newData];
    setAllData(updatedData);
    await localforage.setItem('survey_allData', updatedData);

    if (newHeadcounts) {
      setHeadcounts(newHeadcounts);
      await localforage.setItem('survey_headcounts', newHeadcounts);
    }

    const dateStr = new Date().toLocaleString('pt-BR');
    setLastUploadDate(dateStr);
    await localforage.setItem('survey_lastUploadDate', dateStr);
  };

  const clearData = async () => {
    setAllData([]);
    setHeadcounts({});
    setLastUploadDate(null);
    await localforage.removeItem('survey_allData');
    await localforage.removeItem('survey_headcounts');
    await localforage.removeItem('survey_lastUploadDate');
  };

  const { empresas, departamentos, ciclos, generos, leaders } = useMemo(() => {
    const emp = new Set<string>();
    const dep = new Set<string>();
    const cic = new Set<string>();
    const gen = new Set<string>();
    const led = new Set<string>();

    allData.forEach(d => {
      if (d.empresa) emp.add(d.empresa);
      if (d.department) dep.add(d.department);
      if (d.yearLabel) cic.add(d.yearLabel);
      if (d.genero) gen.add(d.genero);
      if (d.leader) led.add(d.leader);
    });

    return {
      empresas: Array.from(emp).sort(),
      departamentos: Array.from(dep).sort(),
      ciclos: Array.from(cic).sort().reverse(),
      generos: Array.from(gen).sort(),
      leaders: Array.from(led).sort(),
    };
  }, [allData]);

  useEffect(() => {
    if (ciclos.length > 0 && filters.ciclo === 'Todos' && !filters.ciclo.includes('Todos')) {
      // Just keep 'Todos' as default or set to most recent
    }
  }, [ciclos]);

  const filteredData = useMemo(() => {
    return allData.filter(res => {
      if (filters.ciclo !== 'Todos' && res.yearLabel !== filters.ciclo) return false;
      if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
      if (filters.departamento !== 'Todos' && res.department !== filters.departamento) return false;
      if (filters.genero !== 'Todos' && res.genero !== filters.genero) return false;
      if (filters.lider !== 'Todos' && res.leader !== filters.lider) return false;
      if (filters.tipoPesquisa === 'Anônima' && !res.isAnonymous) return false;
      if (filters.tipoPesquisa === 'Identificada' && res.isAnonymous) return false;
      return true;
    });
  }, [allData, filters]);

  return (
    <AppContext.Provider value={{ filters, setFilters, filteredData, allData, headcounts, setHeadcounts, uploadData, clearData, lastUploadDate, isDataLoading, empresas, departamentos, ciclos, generos, leaders }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
