import React, { useState, useRef } from 'react';
import { Medicine, Frequency } from '../types';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Button, Input, Card, cn } from '../components/ui';
import { Camera, ChevronLeft, Save, Mic, Music, Play, Square, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../services/soundService';

export const AddMedicine = ({ onBack, medicineToEdit }: { onBack: () => void; medicineToEdit?: Medicine }) => {
  const { addMedicine, updateMedicine, deleteMedicine, settings, isRTL } = useApp();
  const t = translations[settings.language];
  
  const [formData, setFormData] = useState<Partial<Medicine>>(medicineToEdit || {
    name: '',
    dosage: '',
    category: '',
    time: '08:00',
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    stock: 0,
    refillThreshold: 5,
    startDate: new Date().toISOString().split('T')[0],
    alarmSound: { type: 'default', uri: '' }
  });

  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const uri = URL.createObjectURL(blob);
        setFormData(prev => ({
          ...prev,
          alarmSound: { type: 'voice', uri, label: 'Voice Recording' }
        }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePickFile = async () => {
    const { uri, name } = await soundService.pickAudioFile();
    setFormData(prev => ({
      ...prev,
      alarmSound: { type: 'mp3', uri, label: name }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.time) return;
    
    if (medicineToEdit) {
      updateMedicine({ ...medicineToEdit, ...formData } as Medicine);
    } else {
      addMedicine({
        ...formData as Medicine,
        id: Math.random().toString(36).substr(2, 9),
        completed: {},
      });
    }
    onBack();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-6 py-8 pb-32"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2 border-2 border-primary/10">
          <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
        </Button>
        <h1 className="text-3xl font-black text-primary">{t.addMedicine}</h1>
      </div>

      <div 
        onClick={() => photoInputRef.current?.click()}
        className="bg-surface-container-high rounded-[32px] h-48 flex flex-col items-center justify-center border-4 border-dashed border-primary/20 mb-8 cursor-pointer hover:border-primary group transition-all overflow-hidden"
      >
        {formData.photo ? (
          <img src={formData.photo} alt="Med" className="w-full h-full object-cover" />
        ) : (
          <>
            <Camera className="w-16 h-16 text-primary/40 group-hover:text-primary mb-2" />
            <span className="text-xl font-black text-primary">{t.takePhoto}</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={photoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, photo: reader.result as string });
            reader.readAsDataURL(file);
          }
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-xl font-black px-1">{t.medicineName}</label>
          <Input 
            className="h-20 text-2xl"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Lisinopril"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xl font-black px-1">{t.dosage}</label>
            <Input 
              className="h-20 text-2xl"
              value={formData.dosage}
              onChange={e => setFormData({ ...formData, dosage: e.target.value })}
              placeholder="e.g. 1 Tablet"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xl font-black px-1">{t.time}</label>
            <Input 
              className="h-20 text-2xl"
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xl font-black px-1">Alarm Sound</label>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="wait">
              {formData.alarmSound?.uri ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-secondary-container p-6 rounded-[24px] flex justify-between items-center border-2 border-secondary"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/40 p-3 rounded-full">
                      {formData.alarmSound.type === 'voice' ? <Mic /> : <Music />}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{formData.alarmSound.label || 'Custom Sound'}</p>
                      <p className="text-sm opacity-70 uppercase tracking-widest">{formData.alarmSound.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="rounded-full w-12 h-12 p-0 bg-white/20"
                      onClick={() => {
                        const audio = new Audio(formData.alarmSound!.uri);
                        audio.play();
                      }}
                    >
                      <Play fill="currentColor" size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="rounded-full w-12 h-12 p-0 text-error bg-error/10"
                      onClick={() => setFormData({ ...formData, alarmSound: { type: 'default', uri: '' } })}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className={cn("flex-1 h-20 rounded-[24px] flex flex-col gap-1 items-center", isRecording && "border-error text-error bg-error/10 animate-pulse")}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                  >
                    {isRecording ? <Square size={24} /> : <Mic size={24} />}
                    <span className="text-xs uppercase tracking-tighter">
                      {isRecording ? 'Stop' : 'Record Voice'}
                    </span>
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 h-20 rounded-[24px] flex flex-col gap-1 items-center"
                    onClick={handlePickFile}
                  >
                    <Music size={24} />
                    <span className="text-xs uppercase tracking-tighter">Choose File</span>
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xl font-black px-1">{t.notes}</label>
          <textarea 
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full min-h-32 p-6 rounded-[24px] border-2 border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-0 text-xl font-bold"
            placeholder="Add any helpful notes here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xl font-black px-1">{t.frequency}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as Frequency[]).map(f => (
                <Button 
                  key={f}
                  type="button"
                  variant={formData.frequency === f ? 'primary' : 'outline'}
                  onClick={() => setFormData({ ...formData, frequency: f })}
                  className="h-16 text-sm uppercase font-black px-0"
                >
                  {t[f]}
                </Button>
              ))}
            </div>
          </div>
          {formData.frequency === 'weekly' && (
            <div className="space-y-3">
              <label className="text-xl font-black px-1">{t.selectDays}</label>
              <div className="flex justify-between gap-1">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = formData.daysOfWeek || [];
                      const newDays = days.includes(idx) ? days.filter(d => d !== idx) : [...days, idx];
                      setFormData({ ...formData, daysOfWeek: newDays });
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full text-xs font-black transition-all",
                      formData.daysOfWeek?.includes(idx) ? "bg-primary text-white" : "bg-surface-container-high text-outline"
                    )}
                  >
                    {t[day as keyof typeof t].toString()[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {formData.frequency === 'monthly' && (
            <div className="space-y-3">
              <label className="text-xl font-black px-1">Day of Month</label>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setFormData({ ...formData, daysOfWeek: [day] })}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xs font-black transition-all",
                      formData.daysOfWeek?.[0] === day ? "bg-primary text-white" : "bg-surface-container-high text-outline"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xl font-black px-1">{t.stockLevel}</label>
            <Input 
              className="h-20 text-3xl font-black text-center"
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xl font-black px-1">Low Stock Alert</label>
            <Input 
              className="h-20 text-3xl font-black text-center"
              type="number"
              value={formData.refillThreshold}
              onChange={e => setFormData({ ...formData, refillThreshold: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="pt-8 flex flex-col gap-4">
          <Button type="submit" className="w-full h-24 text-2xl font-black flex gap-4 rounded-[32px] shadow-2xl">
            <Save size={32} />
            {t.save}
          </Button>
          
          {medicineToEdit && (
            <Button 
              type="button"
              variant="ghost"
              className="w-full h-20 text-xl font-black text-error bg-error/5 rounded-[24px]"
              onClick={() => {
                if (confirm('Delete this medicine?')) {
                  deleteMedicine(medicineToEdit.id);
                  onBack();
                }
              }}
            >
              <Trash2 className="mr-2" />
              Delete Medicine
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
};
