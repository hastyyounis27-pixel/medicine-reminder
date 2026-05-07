import React from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Button, Card, cn } from '../components/ui';
import { ArrowLeft, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const HistoryScreen = ({ onBack }: { onBack: () => void }) => {
  const { history, settings, isRTL } = useApp();
  const t = translations[settings.language];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto px-6 py-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className={isRTL ? 'rotate-180' : ''} />
        </Button>
        <h1 className="text-headline-md text-primary">{t.medicineHistory}</h1>
      </div>

      <div className="space-y-6">
        {history.length === 0 ? (
          <Card className="py-20 text-center opacity-50">
            <Calendar className="w-16 h-16 mx-auto mb-4" />
            <p className="text-headline-md">No records found</p>
          </Card>
        ) : (
          history.map((log, idx) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn("p-6", log.status === 'taken' ? 'border-l-8 border-secondary' : 'border-l-8 border-error')}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black">{log.medicineName}</h3>
                    <p className="text-xl font-bold text-outline mt-1">{log.dosage}</p>
                    <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-surface-container">
                      {log.status === 'taken' ? (
                        <CheckCircle className="text-secondary w-8 h-8" />
                      ) : (
                        <AlertCircle className="text-error w-8 h-8" />
                      )}
                      <span className={cn("text-xl font-black", log.status === 'taken' ? 'text-secondary' : 'text-error')}>
                        {log.status === 'taken' ? `${t.takenAt} ${format(log.timestamp, 'HH:mm')}` : t.missed}
                      </span>
                    </div>
                  </div>
                  <span className="text-outline text-lg font-bold bg-surface-container-high px-4 py-2 rounded-full">
                    {format(log.timestamp, 'MMM d')}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
