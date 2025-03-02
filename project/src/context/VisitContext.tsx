import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Symptom {
  id: string;
  name: string;
  severity: number;
  category: string;
}

export interface MedicalVisit {
  id: string;
  doctorName: string;
  visitDate: string;
  reason: string;
  diagnosis: string;
  notes: string;
  followUpDate?: string;
  medications?: string[];
  symptoms: Symptom[];
  testResults?: string[];
  category: string; 
  userId: string;
  createdAt: string;
}

interface VisitContextType {
  visits: MedicalVisit[];
  addVisit: (visit: Omit<MedicalVisit, 'id' | 'createdAt'>) => Promise<void>;
  updateVisit: (id: string, visit: Partial<MedicalVisit>) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
  getVisit: (id: string) => MedicalVisit | undefined;
  loading: boolean;
  error: string | null;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);


export function useVisits() {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error('useVisits must be used within a VisitProvider');
  }
  return context;
}


export function VisitProvider({ children }: { children: React.ReactNode }) {
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('visits', JSON.stringify(visits));
  }, [visits]);


  async function addVisit(visitData: Omit<MedicalVisit, 'id' | 'createdAt'>) {
    try {
      setLoading(true);
      setError(null);
      
      const newVisit: MedicalVisit = {
        ...visitData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setVisits(prevVisits => [...prevVisits, newVisit]);
    } catch (err) {
      setError('Failed to add visit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  async function updateVisit(id: string, visitData: Partial<MedicalVisit>) {
    try {
      setLoading(true);
      setError(null);
      
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === id ? { ...visit, ...visitData } : visit
        )
      );
    } catch (err) {
      setError('Failed to update visit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  async function deleteVisit(id: string) {
    try {
      setLoading(true);
      setError(null);
      
      setVisits(prevVisits => prevVisits.filter(visit => visit.id !== id));
    } catch (err) {
      setError('Failed to delete visit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  function getVisit(id: string) {
    return visits.find(visit => visit.id === id);
  }

  const value = {
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisit,
    loading,
    error
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}