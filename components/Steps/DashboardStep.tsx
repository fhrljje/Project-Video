import React, { useState, useEffect } from 'react';
import { NLPAnalysis, StoryboardScene, BrandKit, VideoState } from '../../types';
import { generateScenePreview, generateVeoVideo } from '../../services/geminiService';
import { Play, CheckCircle2, Clock, Music, Volume2, Video, Loader2, Sliders, LayoutTemplate } from 'lucide-react';

interface DashboardStepProps {
  nlpData: NLPAnalysis;
  storyboard: StoryboardScene[];
  brandKit: BrandKit;
}

export const DashboardStep: React.FC<DashboardStepProps> = ({ nlpData, storyboard, brandKit }) => {
  const [scenes, setScenes] = useState<StoryboardScene[]>(storyboard);
  const [activeSceneId, setActiveSceneId] = useState<number>(1);
  const [generatingPreviews, setGeneratingPreviews] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>({ isGenerating: false, progress: 0 });

  useEffect(() => {
    const loadPreviews = async () => {
      setGeneratingPreviews(true);
      const updatedScenes = [...scenes];
      
      // Generate previews sequentially
      for (let i = 0; i < updatedScenes.length; i++) {
        if (!updatedScenes[i].previewImageUrl) {
          updatedScenes[i].previewImageUrl = await generateScenePreview(
            `${updatedScenes[i].visualPrompt}, style: ${nlpData.marketingMood}, professional product photography, ${brandKit.primaryColor} lighting`
          );
          setScenes([...updatedScenes]); 
        }
      }
      setGeneratingPreviews(false);
    };

    loadPreviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateVideo = async () => {
    setVideoState({ isGenerating: true, progress: 10 });
    
    try {
      const progressInterval = setInterval(() => {
        setVideoState(prev => ({
          ...prev,
          progress: prev.progress < 90 ? prev.progress + 5 : prev.progress
        }));
      }, 2000);

      const fullVideoPrompt = `
        Create a cinematic ${nlpData.marketingMood} commercial. 
        Sequence:
        1. ${scenes[0].visualPrompt}
        2. ${scenes[1].visualPrompt}
        3. ${scenes[2].visualPrompt}
        4. ${scenes[3].visualPrompt}
        Smooth transitions. Brand color theme: ${brandKit.primaryColor}.
      `;

      const videoUrl = await generateVeoVideo(fullVideoPrompt);
      
      clearInterval(progressInterval);
      setVideoState({ isGenerating: false, progress: 100, videoUrl });
    } catch (error) {
        console.error(error);
      setVideoState({ isGenerating: false, progress: 0, error: "Failed to generate video. Please try again." });
    }
  };

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  return (
    <div className="flex h-full w-full">
      {/* LEFT: NLP Analysis & Logic */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/30 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <LayoutTemplate className="text-slate-500" size={16} />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Architectural Plan</h3>
        </div>
        
        <div className="space-y-6">
          {/* Entity 1: Product */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1 uppercase">Entity 1: Product</label>
            <div className="font-semibold text-white">{nlpData.productName}</div>
          </div>

          {/* Entity 2: Features */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 uppercase">Entity 2: Features</label>
            <div className="flex flex-wrap gap-2">
              {nlpData.features.map((feature, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Entity 3: Target */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1 uppercase">Entity 3: Target</label>
            <div className="text-sm text-slate-300">{nlpData.targetAudience}</div>
          </div>

           {/* Entity 4: CTA */}
           <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1 uppercase">Entity 4: CTA & Incentive</label>
            <div className="text-sm text-green-400 font-medium">{nlpData.cta}</div>
          </div>

           <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1 uppercase">Mood Logic</label>
            <div className="flex items-center gap-2 text-sm text-purple-400">
               <Music size={14} /> {nlpData.marketingMood}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: Storyboard Timeline */}
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phase 2: Storyboard (25s MVP)</h3>
            <span className="text-xs text-slate-600 font-mono">Total: {scenes.reduce((acc, s) => acc + s.duration, 0)}s</span>
         </div>

         <div className="grid grid-cols-1 gap-4 mb-8">
           {scenes.map((scene) => (
             <div 
                key={scene.id} 
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  activeSceneId === scene.id 
                    ? `bg-slate-900` 
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
                style={{ borderColor: activeSceneId === scene.id ? brandKit.primaryColor : undefined }}
             >
               {/* Scene Thumbnail */}
               <div className="w-32 h-20 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 relative shadow-lg">
                 {scene.previewImageUrl ? (
                   <img src={scene.previewImageUrl} alt="preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <Loader2 className="animate-spin text-slate-600" size={20} />
                   </div>
                 )}
                 <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                   {scene.duration}s
                 </div>
               </div>

               {/* Scene Info */}
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      scene.type === 'CTA' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                      scene.type === 'HOOK' ? 'bg-purple-900/20 text-purple-400 border-purple-900/50' :
                      'bg-blue-900/20 text-blue-400 border-blue-900/50'
                    }`}>
                      {scene.type}
                    </span>
                    <span className="text-xs text-slate-500">Scene {scene.id}</span>
                 </div>
                 <p className="text-sm text-slate-200 line-clamp-2 mb-2">{scene.narrative}</p>
                 
                 {/* Visual Instruction Viz */}
                 <div className="bg-black/30 p-2 rounded text-[10px] text-slate-400 font-mono border border-slate-800/50">
                    <span className="text-yellow-600/80">VISUAL INSTR:</span> {scene.visualPrompt}
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* RIGHT: Preview & Render */}
      <div className="w-96 border-l border-slate-800 bg-slate-900 p-6 flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Phase 3: Visual Synthesis</h3>

        {/* Player Container */}
        <div className="aspect-video bg-black rounded-xl border border-slate-700 overflow-hidden relative shadow-2xl mb-6 group">
           {videoState.videoUrl ? (
             <video src={videoState.videoUrl} controls autoPlay className="w-full h-full" />
           ) : (
             <div className="w-full h-full relative">
                
                {/* ARCHITECT NOTE: PART 4 - BRANDING 
                    Logo is strictly Top-Right, but HIDDEN on CTA scene as per spec.
                */}
                {activeScene.type !== 'CTA' && (
                  <div className="absolute top-4 right-4 z-20 animate-fade-in">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold border border-white/20 flex items-center gap-1 shadow-lg">
                        {brandKit.logoUrl ? <img src={brandKit.logoUrl} className="w-4 h-4 object-contain"/> : <div className="w-3 h-3 rounded-full bg-current" style={{color: brandKit.primaryColor}} />}
                        LOGO
                      </div>
                  </div>
                )}

                {/* Active Image Preview */}
                {activeScene.previewImageUrl ? (
                    <img src={activeScene.previewImageUrl} className="w-full h-full object-cover opacity-90 transition-opacity" alt="Active Scene" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950">
                        <span className="text-slate-600">Generating Preview...</span>
                    </div>
                )}
                
                {/* Simulated Text Overlay - Using Brand Color */}
                <div className="absolute bottom-8 left-6 right-6 z-20">
                    <h2 
                      className="text-2xl font-black uppercase italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      style={{ color: brandKit.primaryColor }}
                    >
                      {activeScene.type === 'CTA' ? nlpData.cta.split(' ').slice(0, 3).join(' ') : activeScene.type}
                    </h2>
                    <p className="text-white text-sm drop-shadow-md font-medium mt-1 text-shadow-sm">
                        {activeScene.narrative}
                    </p>
                </div>
             </div>
           )}

           {/* Veo Loading State */}
           {videoState.isGenerating && (
             <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
               <Loader2 className="animate-spin text-purple-500 mb-3" size={32} />
               <p className="text-white font-medium text-sm tracking-wide">Synthesizing Video (Veo 3.1)</p>
               <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                 <div 
                    className="h-full bg-purple-500 transition-all duration-500" 
                    style={{ width: `${videoState.progress}%` }}
                 />
               </div>
             </div>
           )}
        </div>

        {/* Controls */}
        <div className="mt-auto">
            {/* ARCHITECT NOTE: PART 3 - AUDIO MIXING */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-2">
                      <Sliders size={12} />
                      <span className="uppercase font-bold">Audio Mixing Priority</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {/* TTS - 100% */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Narrative (TTS)</span>
                          <span className="text-white">100%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      </div>
                    </div>

                    {/* Music - 30% */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Background Music ({nlpData.marketingMood})</span>
                          <span className="text-white">30%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-[30%]"></div>
                      </div>
                    </div>

                    {/* SFX - 10% */}
                     <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>SFX (Transisi/Pop)</span>
                          <span className="text-white">10%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 w-[10%]"></div>
                      </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGenerateVideo}
                disabled={videoState.isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all border border-white/10 disabled:opacity-50"
            >
                {videoState.isGenerating ? (
                    'Rendering...'
                ) : videoState.videoUrl ? (
                    <>
                        <CheckCircle2 size={20} /> Video Ready
                    </>
                ) : (
                    <>
                        <Video size={20} /> Generate (Veo)
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};