import React, { useState } from 'react';
import { BrandKit } from '../../types';
import { Wand2, Upload } from 'lucide-react';

interface InputStepProps {
  onAnalyze: (text: string, brandKit: BrandKit) => void;
  isAnalyzing: boolean;
}

export const InputStep: React.FC<InputStepProps> = ({ onAnalyze, isAnalyzing }) => {
  // Using the exact example from the user's prompt
  const [text, setText] = useState("Jual kopi robusta dengan rasa coklat, untuk sarapan cepat, beli sekarang diskon 20%.");
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6"); // Default violet
  const [logoName, setLogoName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoName(e.target.files[0].name);
      // In a real app, we'd read this as base64 here
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(text, { primaryColor, secondaryColor: '#ffffff' });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Create Promotional Video</h2>
          <p className="text-slate-400">Enter your marketing copy and let the AI Architect build your video.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Marketing Copy / Script</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe your product and offer..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brand Color</label>
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                />
                <span className="text-slate-300 font-mono">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brand Logo</label>
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-700 text-slate-400 group-hover:border-purple-500 transition-colors">
                  <Upload size={18} />
                  <span className="truncate">{logoName || "Upload PNG/SVG"}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>Processing NLP Logic...</>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Implementation Plan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};