import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, AppSettings, HistoryLog, Language } from './types';

interface AppContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
  markAsTaken: (medicineId: string) => void;
  history: HistoryLog[];
  settings: AppSettings;
  setLanguage: (lang: Language) => void;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isRTL: boolean;
  exportData: () => void;
  importData: (json: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  darkMode: false,
  alarmSound: 'default',
  volume: 80,
  refillNotification: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('mediremind_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const savedMeds = localStorage.getItem('mediremind_medicines');
    if (savedMeds) setMedicines(JSON.parse(savedMeds));
    
    const savedHistory = localStorage.getItem('mediremind_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('mediremind_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('mediremind_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mediremind_settings', JSON.stringify(settings));
    document.dir = settings.language === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = settings.language;
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const addMedicine = (med: Medicine) => {
    setMedicines(prev => [...prev, med]);
  };

  const updateMedicine = (med: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === med.id ? med : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const markAsTaken = (medicineId: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const today = new Date().toISOString().split('T')[0];
    const newCompleted = { ...med.completed, [today]: true };
    
    // Decrement stock if present
    const newStock = med.stock !== undefined ? Math.max(0, med.stock - 1) : undefined;
    
    updateMedicine({ ...med, completed: newCompleted, stock: newStock });

    const log: HistoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      medicineId,
      medicineName: med.name,
      timestamp: Date.now(),
      status: 'taken',
      dosage: med.dosage
    };
    setHistory(prev => [log, ...prev]);
  };

  const setLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const exportData = () => {
    const data = {
      medicines,
      history,
      settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediremind_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.medicines) setMedicines(data.medicines);
      if (data.history) setHistory(data.history);
      if (data.settings) setSettings(data.settings);
      alert('Data imported successfully!');
    } catch (e) {
      alert('Failed to import data: Invalid format.');
    }
  };

  return (
    <AppContext.Provider value={{
      medicines,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      markAsTaken,
      history,
      settings,
      setLanguage,
      setSettings,
      isRTL: settings.language !== 'en',
      exportData,
      importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
