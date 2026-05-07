/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Dashboard } from './screens/Dashboard';
import { AddMedicine } from './screens/AddMedicine';
import { SettingsScreen } from './screens/Settings';
import { HistoryScreen } from './screens/History';
import { AlarmOverlay } from './components/AlarmOverlay';
import { translations } from './translations';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine } from './types';

type Screen = 'splash' | 'dashboard' | 'add' | 'settings' | 'history';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [editingMed, setEditingMed] = useState<Medicine | undefined>(undefined);
  const { settings } = useApp();
  const t = translations[settings.language];

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('dashboard'), 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background flex flex-col items-center justify-center text-center z-[200]"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-surface-container-lowest p-10 rounded-[40px] shadow-2xl mb-8"
            >
              <Heart className="w-24 h-24 text-primary" fill="currentColor" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-headline-xl text-primary mb-2">MediRemind</h1>
              <p className="text-body-lg text-on-surface-variant max-w-[280px] mx-auto">
                {t.secureMedical}
              </p>
            </motion.div>
            <div className="absolute bottom-12 flex flex-col items-center gap-2 text-primary/40">
               <p className="text-label-md uppercase tracking-widest">{t.welcomeBack}</p>
               <div className="w-12 h-1 bg-primary/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-full h-full bg-primary"
                  />
               </div>
            </div>
          </motion.div>
        )}

        {screen === 'dashboard' && (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
             <Dashboard 
               onAdd={() => {
                 setEditingMed(undefined);
                 setScreen('add');
               }} 
               onEdit={(med) => {
                 setEditingMed(med);
                 setScreen('add');
               }}
               onSettings={() => setScreen('settings')} 
               onHistory={() => setScreen('history')} 
             />
          </motion.div>
        )}
        {screen === 'add' && (
          <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            <AddMedicine 
              medicineToEdit={editingMed}
              onBack={() => {
                setEditingMed(undefined);
                setScreen('dashboard');
              }} 
            />
          </motion.div>
        )}
        {screen === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            <SettingsScreen onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
        {screen === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            <HistoryScreen onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>

      <AlarmOverlay />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

