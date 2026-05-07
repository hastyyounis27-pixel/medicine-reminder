import React from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Button, Card, cn } from '../components/ui';
import { Settings, History, CheckCircle, Plus, Phone, Bell, Heart, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Medicine } from '../types';

export const Dashboard = ({ onAdd, onHistory, onSettings, onEdit }: { onAdd: () => void; onHistory: () => void; onSettings: () => void; onEdit: (med: Medicine) => void }) => {
  const { medicines, markAsTaken, settings, isRTL } = useApp();
  const t = translations[settings.language];
  
  const today = new Date().toISOString().split('T')[0];
  const sortedMedicines = [...medicines].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <header className="px-6 py-8 bg-surface-container-low shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Heart className="text-primary w-8 h-8" />
          <h1 className="text-headline-md font-bold text-primary">{t.appName}</h1>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
          <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=100&h=100&fit=crop" alt="Doctor" />
        </div>
      </header>

      <main className="px-6 pt-8 space-y-8 max-w-2xl mx-auto w-full">
        <section>
          <p className="text-on-surface-variant font-bold text-label-lg mb-1">
            {format(new Date(), 'EEEE, MMM d')}
          </p>
          <h2 className="text-headline-xl text-on-surface">{t.today}</h2>
        </section>

        <div className="space-y-4">
          {sortedMedicines.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 opacity-60">
              <Bell className="w-16 h-16 mb-4 text-outline" />
              <p className="text-body-lg">{t.noMedicines}</p>
            </Card>
          ) : (
            sortedMedicines.map((med, idx) => {
              const isTaken = med.completed?.[today];
              return (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={cn("p-6", isTaken ? 'opacity-70 bg-surface-variant' : '')}>
                    <div className="flex gap-6">
                      <div 
                        className="w-24 h-24 rounded-2xl bg-primary-fixed flex items-center justify-center flex-shrink-0 shadow-inner cursor-pointer"
                        onClick={() => onEdit(med)}
                      >
                        {med.photo ? (
                          <img src={med.photo} alt={med.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <div className="text-primary font-black text-4xl">
                            {med.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="cursor-pointer" onClick={() => onEdit(med)}>
                          <div className="flex justify-between items-start">
                            <h3 className={cn("text-3xl font-black", isTaken && "line-through opacity-50")}>{med.name}</h3>
                            <span className="text-primary font-black text-2xl">{med.time}</span>
                          </div>
                          <p className={cn("text-on-surface-variant text-xl font-bold mt-1", !isTaken && med.stock !== undefined && med.stock <= (med.refillThreshold || 0) && "text-error")}>
                            {med.dosage}
                            {med.stock !== undefined && (
                              <span className="block text-sm opacity-60 mt-1 uppercase tracking-tighter">
                                {med.stock} {t.stockRemaining}
                                {med.stock <= (med.refillThreshold || 0) && ` - ${t.refillWarning}`}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-6">
                          {isTaken ? (
                            <div className="flex items-center gap-3 text-secondary font-black text-xl bg-secondary/10 p-4 rounded-xl">
                              <CheckCircle className="w-8 h-8" />
                              <span>{t.taken}</span>
                            </div>
                          ) : (
                            <Button className="w-full h-20 text-2xl font-black rounded-2xl shadow-lg" onClick={() => markAsTaken(med.id)}>
                              <CheckCircle className="w-8 h-8 mr-3" />
                              {t.markAsTaken}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <section className="bg-error-container p-6 rounded-2xl border-4 border-error/50 flex flex-col items-center text-center gap-4 shadow-xl">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Phone className="w-16 h-16 text-error" />
          </motion.div>
          <h3 className="text-3xl font-black text-error uppercase">{t.sos}</h3>
          <p className="text-xl font-bold opacity-80">{t.sosDesc}</p>
          <Button 
            variant="error" 
            className="w-full h-24 text-3xl font-black rounded-3xl shadow-2xl"
            onClick={() => {
              if (settings.sosContact) {
                window.location.href = `tel:${settings.sosContact}`;
              } else {
                alert('Please set an emergency contact in Settings first.');
                onSettings();
              }
            }}
          >
            {t.sos}
          </Button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-surface shadow-2xl px-4 py-4 flex justify-around items-center border-t border-surface-container z-20">
        <Button variant="ghost" onClick={() => {}} className="bg-primary-container text-on-primary-container">
          <History className="mr-2" />
          {t.today}
        </Button>
        <Button variant="ghost" onClick={onHistory}>
          <History className="mr-2" />
          {t.history}
        </Button>
        <Button variant="ghost" onClick={onSettings}>
          <Settings className="mr-2" />
          {t.settings}
        </Button>
      </nav>

      <Button
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl z-30"
        onClick={onAdd}
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
};
