import React, { useState, useEffect } from 'react';
import { NLPAnalysis, StoryboardScene, BrandKit, VideoState } from '../../types';
import { generateScenePreview, generateVeoVideo } from '../../services/geminiService';
import { Play, CheckCircle2, Clock, Music, Volume2, Video, Loader2 } from 'lucide-react';

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
      
      // Generate previews sequentially to not hit rate limits too hard
      for (let i = 0; i < updatedScenes.length; i++) {
        if (!updatedScenes[i].previewImageUrl) {
          updatedScenes[i].previewImageUrl = await generateScenePreview(
            `${updatedScenes[i].visualPrompt}, style: ${nlpData.marketingMood}, professional product photography`
          );
          setScenes([...updatedScenes]); // Update UI incrementally
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
      // Simulate progress for UI feedback while waiting
      const progressInterval = setInterval(() => {
        setVideoState(prev => ({
          ...prev,
          progress: prev.progress < 90 ? prev.progress + 5 : prev.progress
        }));
      }, 2000);

      // Construct a full prompt for Veo based on the storyboard
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
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Phase 1: NLP Extraction</h3>
        
        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Detected Product</label>
            <div className="font-semibold text-white">{nlpData.productName}</div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Key Features (Entities)</label>
            <div className="flex flex-wrap gap-2">
              {nlpData.features.map((feature, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Target Situation</label>
            <div className="text-sm text-slate-300">{nlpData.targetAudience}</div>
          </div>

           <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Audio Logic</label>
            <div className="text-xs text-slate-300 font-mono mb-2">{nlpData.suggestedAudioRatio}</div>
            <div className="flex items-center gap-2 text-xs text-purple-400">
               <Music size={12} /> Mood: {nlpData.marketingMood}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: Storyboard Timeline */}
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Phase 2: Storyboard Logic</h3>

         <div className="grid grid-cols-1 gap-4 mb-8">
           {scenes.map((scene) => (
             <div 
                key={scene.id} 
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  activeSceneId === scene.id 
                    ? `border-[${brandKit.primaryColor}] bg-slate-900` 
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
                style={{ borderColor: activeSceneId === scene.id ? brandKit.primaryColor : undefined }}
             >
               {/* Scene Thumbnail */}
               <div className="w-32 h-20 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 relative">
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
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      scene.type === 'CTA' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {scene.type}
                    </span>
                    <span className="text-xs text-slate-500">Scene {scene.id} of 4</span>
                 </div>
                 <p className="text-sm text-slate-200 line-clamp-2">{scene.narrative}</p>
                 <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">Prompt: {scene.visualPrompt}</p>
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* RIGHT: Preview & Render */}
      <div className="w-96 border-l border-slate-800 bg-slate-900 p-6 flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Phase 3: Visual Synthesis</h3>

        {/* Player Container */}
        <div className="aspect-video bg-black rounded-xl border border-slate-700 overflow-hidden relative shadow-2xl mb-6">
           {videoState.videoUrl ? (
             <video src={videoState.videoUrl} controls autoPlay className="w-full h-full" />
           ) : (
             <div className="w-full h-full relative">
                {/* Simulated Overlay System */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded text-xs font-bold border border-white/20">
                      LOGO
                    </div>
                </div>
                {/* Active Image Preview */}
                {activeScene.previewImageUrl ? (
                    <img src={activeScene.previewImageUrl} className="w-full h-full object-cover opacity-80" alt="Active Scene" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950">
                        <span className="text-slate-600">Generating Preview...</span>
                    </div>
                )}
                
                {/* Simulated Text Overlay */}
                <div className="absolute bottom-8 left-6 right-6 z-20">
                    <h2 
                      className="text-2xl font-black uppercase italic tracking-tighter drop-shadow-lg"
                      style={{ color: brandKit.primaryColor }}
                    >
                      {activeScene.type === 'CTA' ? nlpData.cta : activeScene.type}
                    </h2>
                    <p className="text-white text-sm drop-shadow-md font-medium mt-1">
                        {activeScene.narrative}
                    </p>
                </div>
             </div>
           )}

           {videoState.isGenerating && (
             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
               <Loader2 className="animate-spin text-purple-500 mb-2" size={32} />
               <p className="text-white font-medium text-sm">Synthesizing Video (Veo Model)...</p>
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
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Audio Mixing Logic</span>
                    <Volume2 size={14} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                        <span>TTS Narrative</span>
                        <span>100%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Background Music ({nlpData.marketingMood})</span>
                        <span>30%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[30%]"></div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGenerateVideo}
                disabled={videoState.isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
            >
                {videoState.isGenerating ? (
                    'Processing...'
                ) : videoState.videoUrl ? (
                    <>
                        <CheckCircle2 size={20} /> Video Ready
                    </>
                ) : (
                    <>
                        <Video size={20} /> Generate Final Video (Veo)
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};