import React from 'react';
import { Film, Zap, Layers, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  brandColor: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, brandColor }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${brandColor}20` }}>
            <Film className="w-6 h-6" style={{ color: brandColor }} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">PromoGen AI</h1>
            <p className="text-xs text-slate-400">System Architect MVP</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium text-slate-400">
           <span className="flex items-center gap-1"><Zap size={14} /> Gemini 2.5 Flash</span>
           <span className="flex items-center gap-1"><Layers size={14} /> Veo 3.1</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
};