import React, { useRef } from 'react';
import { useApp } from '../AppContext';
import { translations } from '../translations';
import { Button, Card, Input, cn } from '../components/ui';
import { Globe, ArrowLeft, Volume2, Moon, ShieldCheck, Phone, Download, Upload, Trash2, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';

export const SettingsScreen = ({ onBack }: { onBack: () => void }) => {
  const { settings, setLanguage, isRTL, setSettings, exportData, importData } = useApp();
  const t = translations[settings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'ku', label: 'Kurdish', native: 'کوردی' },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          importData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto px-6 py-8 pb-32"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2 border-2 border-primary/10">
          <ArrowLeft className={isRTL ? 'rotate-180' : ''} />
        </Button>
        <h1 className="text-3xl font-black text-primary">{t.settings}</h1>
      </div>

      <div className="space-y-10">
        {/* Language Selection */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-outline uppercase tracking-wider">{t.language}</h2>
          <div className="grid grid-cols-1 gap-3">
            {languages.map(lang => (
              <Card 
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={settings.language === lang.code ? 'border-primary border-4 bg-primary-container/20 p-6' : 'p-6'}
              >
                <div className="flex justify-between items-center h-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Globe className="text-primary" />
                    </div>
                    <div>
                      <span className="text-2xl font-black block leading-tight">{lang.native}</span>
                      <span className="text-lg font-bold text-outline opacity-70">{lang.label}</span>
                    </div>
                  </div>
                  {settings.language === lang.code && <ShieldCheck className="text-primary w-10 h-10" />}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-outline uppercase tracking-wider">{t.sosContact}</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-error">
                <Phone size={24} />
                <span className="text-xl font-black uppercase">Emergency Number</span>
              </div>
              <Input 
                type="tel"
                value={settings.sosContact || ''}
                onChange={e => setSettings({ ...settings, sosContact: e.target.value })}
                placeholder="e.g. +1 234 567 890"
                className="h-20 text-3xl font-black tracking-widest text-center"
              />
              <p className="text-sm opacity-60 flex items-center gap-2">
                <Heart size={16} />
                This number will be used when you click SOS button.
              </p>
            </div>
          </Card>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-outline uppercase tracking-wider">App Preferences</h2>
          
          {/* Dark Mode Toggle */}
          <Card 
            className="p-6 flex justify-between items-center bg-surface-container"
            onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Moon className="text-primary" />
              </div>
              <span className="text-2xl font-black">{t.darkMode}</span>
            </div>
            <div className={cn(
              "w-16 h-8 rounded-full relative transition-colors duration-300",
              settings.darkMode ? "bg-primary" : "bg-outline-variant"
            )}>
               <motion.div 
                 animate={{ x: settings.darkMode ? 32 : 4 }}
                 className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md" 
               />
            </div>
          </Card>

          {/* Volume Control (Mock) */}
          <Card className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Volume2 className="text-primary" />
              </div>
              <span className="text-2xl font-black">Alarm Volume</span>
            </div>
            <span className="text-3xl font-black text-primary">80%</span>
          </Card>
        </section>

        {/* Data Management */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-outline uppercase tracking-wider">Data & Backup</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-1 rounded-[24px]"
              onClick={exportData}
            >
              <Download size={24} />
              <span className="text-xs uppercase font-black">{t.backup}</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-1 rounded-[24px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} />
              <span className="text-xs uppercase font-black">{t.restore}</span>
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImport}
            />
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-error h-20 rounded-[24px] bg-error/5"
            onClick={() => {
              if (confirm('Are you sure you want to delete all data?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            <Trash2 className="mr-2" />
            Delete All Data
          </Button>
        </section>
      </div>
    </motion.div>
  );
};
