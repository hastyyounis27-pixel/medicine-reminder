import React, { useEffect, useState, useRef } from 'react';
import { Medicine } from '../types';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Button } from '../components/ui';
import { CheckCircle, Clock, BellRing, AlarmClockOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AlarmOverlay = () => {
  const { medicines, markAsTaken, settings } = useApp();
  const [activeAlarm, setActiveAlarm] = useState<Medicine | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const t = translations[settings.language];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHhMm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dayOfWeek = now.getDay();
      const dayOfMonth = now.getDate();
      
      const dueMed = medicines.find(med => {
        const today = new Date().toISOString().split('T')[0];
        const isCompleted = med.completed?.[today];
        
        // Frequency check
        let isFrequencyDue = false;
        if (med.frequency === 'daily') isFrequencyDue = true;
        else if (med.frequency === 'weekly') isFrequencyDue = med.daysOfWeek?.includes(dayOfWeek) || false;
        else if (med.frequency === 'monthly') isFrequencyDue = med.daysOfWeek?.includes(dayOfMonth) || false;

        return !isCompleted && isFrequencyDue && med.time === currentHhMm;
      });

      if (dueMed && (!activeAlarm || activeAlarm.id !== dueMed.id)) {
        setActiveAlarm(dueMed);
        
        // Play custom sound or default
        const soundUri = dueMed.alarmSound?.uri || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(soundUri);
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => console.log('Audio autoplay blocked'));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [medicines, activeAlarm]);

  const handleTaken = () => {
    if (activeAlarm) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      markAsTaken(activeAlarm.id);
      setActiveAlarm(null);
    }
  };

  const handleSnooze = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveAlarm(null);
  };

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          <main className="flex-1 flex flex-col items-center justify-between py-12 px-6 text-center">
            {/* Top Warning Banner */}
            <div className="w-full">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-flex items-center gap-4 bg-error px-10 py-5 rounded-full border-4 border-white shadow-[0_0_40px_rgba(255,0,0,0.5)]"
              >
                <BellRing className="text-white w-10 h-10" />
                <span className="text-2xl font-black text-white uppercase tracking-widest">{t.urgentReminder}</span>
              </motion.div>
            </div>

            {/* Huge Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter mt-4">
              {t.timeToTake}
            </h1>

            {/* Medication Identity (Center Stage) */}
            <div className="flex flex-col items-center gap-6 my-4 w-full">
              <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-[60px] overflow-hidden border-[12px] border-primary-fixed shadow-[0_20px_80px_rgba(0,0,0,0.8)] bg-surface-container flex items-center justify-center">
                {activeAlarm.photo ? (
                  <img src={activeAlarm.photo} alt={activeAlarm.name} className="w-full h-full object-cover" />
                ) : (
                  <Clock className="w-48 h-48 text-primary opacity-30" />
                )}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-black text-primary-fixed-dim">{activeAlarm.name}</h2>
                <p className="text-3xl md:text-4xl font-bold text-surface-variant bg-white/10 px-8 py-3 rounded-full inline-block">
                  {activeAlarm.dosage}
                </p>
              </div>
            </div>

            {/* Massive Action Buttons */}
            <div className="w-full max-w-3xl flex flex-col gap-6 mb-4">
              <Button 
                onClick={handleTaken}
                className="h-28 text-4xl font-black uppercase rounded-[40px] bg-[#00E676] text-[#002113] border-8 border-white shadow-[0_15px_40px_rgba(0,230,118,0.4)] active:scale-95 transition-transform flex gap-6"
              >
                <CheckCircle className="w-12 h-12" strokeWidth={4} />
                {t.taken}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleSnooze}
                  className="h-20 text-2xl font-black uppercase rounded-[32px] border-4 border-white/40 text-white bg-white/10 active:scale-95 transition-transform flex gap-4"
                >
                  <AlarmClockOff className="w-8 h-8" />
                  {t.snooze}
                </Button>
                
                <Button 
                  variant="error"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    setActiveAlarm(null);
                  }}
                  className="h-20 text-2xl font-black uppercase rounded-[32px] border-4 border-white/40 shadow-lg active:scale-95 transition-transform flex gap-4"
                >
                  <Square className="w-8 h-8" fill="currentColor" />
                  STOP
                </Button>
              </div>
            </div>
          </main>

          {/* Background Animated Glow */}
          <div className="fixed inset-0 -z-10 bg-gradient-to-b from-primary/20 via-black to-black">
             <motion.div 
               animate={{ opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[150px] rounded-full"
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
