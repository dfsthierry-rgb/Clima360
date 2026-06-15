import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import localforage from 'localforage';
import { SurveyResponse, PILLARS, QUESTIONS } from '../data/mockData';
import { db, auth } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, writeBatch, getDoc, onSnapshot, query, arrayUnion } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export interface Filters {
  ciclo: string;
  empresa: string;
  departamento: string;
  genero: string;
  lider: string;
}

interface AppContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredData: SurveyResponse[];
  allData: SurveyResponse[];
  empresas: string[];
  departamentos: string[];
  ciclos: string[];
  generos: string[];
  leaders: string[];
  uploadData: (newData: SurveyResponse[], filenames?: string[]) => Promise<void>;
  clearData: () => Promise<void>;
  lastUploadDate: string | null;
  processedFilesGlobal: string[];
  isDataLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>({
    ciclo: 'Todos',
    empresa: 'Todos',
    departamento: 'Todos',
    genero: 'Todos',
    lider: 'Todos',
  });

  const [allData, setAllData] = useState<SurveyResponse[]>([]);
  const [lastUploadDate, setLastUploadDate] = useState<string | null>(null);
  const [processedFilesGlobal, setProcessedFilesGlobal] = useState<string[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Sync data with Firestore
  useEffect(() => {
    setIsDataLoading(true);

    const unsubSurveys = onSnapshot(collection(db, 'surveys'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as SurveyResponse);
      setAllData(data);
      setIsDataLoading(false);
    }, (error) => {
      console.error("Error loading surveys", error);
      setIsDataLoading(false);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastUploadDate) setLastUploadDate(data.lastUploadDate);
        if (data.processedFiles) setProcessedFilesGlobal(data.processedFiles);
      }
    });

    return () => {
      unsubSurveys();
      unsubConfig();
    };
  }, []);

  const uploadData = async (newData: SurveyResponse[], filenames: string[] = []) => {
    
    // Process in batches of 500
    for (let i = 0; i < newData.length; i += 500) {
      const batch = writeBatch(db);
      const chunk = newData.slice(i, i + 500);
      chunk.forEach(res => {
        const docRef = doc(db, 'surveys', res.id);
        batch.set(docRef, res);
      });
      await batch.commit();
    }

    const dateStr = new Date().toLocaleString('pt-BR');
    
    const configUpdate: any = { lastUploadDate: dateStr };
    if (filenames.length > 0) {
      configUpdate.processedFiles = arrayUnion(...filenames);
    }
    await setDoc(doc(db, 'config', 'global'), configUpdate, { merge: true });
  };

  const clearData = async () => {
    setIsDataLoading(true);
    
    // delete in batches
    const snap = await getDocs(collection(db, 'surveys'));
    let batch = writeBatch(db);
    let count = 0;
    
    for (const document of snap.docs) {
      batch.delete(document.ref);
      count++;
      if (count === 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) {
      await batch.commit();
    }

    await setDoc(doc(db, 'config', 'global'), { lastUploadDate: null, processedFiles: [] });
    setIsDataLoading(false);
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
      return true;
    });
  }, [allData, filters]);

  return (
    <AppContext.Provider value={{ filters, setFilters, filteredData, allData, uploadData, clearData, lastUploadDate, processedFilesGlobal, isDataLoading, empresas, departamentos, ciclos, generos, leaders }}>
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
