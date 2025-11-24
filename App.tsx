import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputStep } from './components/Steps/InputStep';
import { DashboardStep } from './components/Steps/DashboardStep';
import { BrandKit, NLPAnalysis, StoryboardScene } from './types';
import { analyzeMarketingText, generateStoryboard } from './services/geminiService';

export default function App() {
  const [step, setStep] = useState<'INPUT' | 'DASHBOARD'>('INPUT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data Store
  const [brandKit, setBrandKit] = useState<BrandKit>({ primaryColor: '#8b5cf6', secondaryColor: '#ffffff' });
  const [nlpData, setNlpData] = useState<NLPAnalysis | null>(null);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);

  useEffect(() => {
    // API Key Handling for Paid Services (Veo)
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          try {
             await window.aistudio.openSelectKey();
          } catch (e) {
             console.error("API Key selection failed or dismissed", e);
             setError("API Key is required to use the Generative Video features.");
          }
        }
      }
    };
    checkApiKey();
  }, []);

  const handleAnalyze = async (text: string, kit: BrandKit) => {
    setLoading(true);
    setBrandKit(kit);
    setError(null);

    try {
      // 1. NLP Analysis
      const analysis = await analyzeMarketingText(text);
      setNlpData(analysis);

      // 2. Generate Storyboard based on Analysis
      const scenes = await generateStoryboard(analysis, kit.primaryColor);
      setStoryboard(scenes);

      setStep('DASHBOARD');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during AI processing.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center">
           <div>
              <h2 className="text-xl font-bold text-red-500 mb-2">System Error</h2>
              <p className="text-slate-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 rounded">Reload App</button>
           </div>
        </div>
     )
  }

  return (
    <Layout brandColor={brandKit.primaryColor}>
      {step === 'INPUT' && (
        <InputStep onAnalyze={handleAnalyze} isAnalyzing={loading} />
      )}
      {step === 'DASHBOARD' && nlpData && (
        <DashboardStep 
          nlpData={nlpData} 
          storyboard={storyboard} 
          brandKit={brandKit} 
        />
      )}
    </Layout>
  );
}