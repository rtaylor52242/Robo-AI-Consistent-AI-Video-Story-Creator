import React, { useState, useEffect, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import OutputGrid from './components/OutputGrid';
import HelpModal from './components/HelpModal';
import { StoryClip, VideoSettings } from './types';
import { generateStoryClip, requestApiKey, checkApiKey } from './services/geminiService';
import { getFilename, getZipFilename } from './utils/fileUtils';

const App: React.FC = () => {
  // State
  const [slots, setSlots] = useState<StoryClip[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      imageFile: null,
      imageUrl: null,
      prompt: '',
      status: 'idle',
      videoUrl: null,
    }))
  );

  const [settings, setSettings] = useState<VideoSettings>({
    model: 'veo-3.1-generate-preview',
    durationSeconds: 8,
    resolution: '1080p',
    aspectRatio: '16:9',
    consistencyMode: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Check API key on mount and focus
  const verifyKey = useCallback(async () => {
    try {
        const hasKey = await checkApiKey();
        setHasApiKey(hasKey);
    } catch (e) {
        console.error("Error checking API key:", e);
    }
  }, []);

  useEffect(() => {
      verifyKey();
      window.addEventListener('focus', verifyKey);
      return () => window.removeEventListener('focus', verifyKey);
  }, [verifyKey]);

  // Handlers
  const updateSlotFile = (id: number, file: File) => {
    const url = URL.createObjectURL(file);
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, imageFile: file, imageUrl: url } : slot
      )
    );
  };

  const parsePrompts = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim() !== '');
    
    setSlots((prev) =>
      prev.map((slot, index) => {
        let promptText = '';
        const rawLine = lines[index];

        if (rawLine) {
          try {
            // Try parsing as JSON
            const json = JSON.parse(rawLine);
            if (json.prompt) {
              promptText = json.prompt;
            } else {
              promptText = rawLine;
            }
          } catch {
            // Fallback to raw text
            promptText = rawLine;
          }
        }

        return { ...slot, prompt: promptText };
      })
    );
  };

  const handleGenerateAll = async () => {
    if (!hasApiKey) {
        await requestApiKey();
        await verifyKey();
        if (!await checkApiKey()) return;
    }

    const validSlots = slots.filter((s) => s.imageFile && s.prompt);
    if (validSlots.length === 0) {
      alert("Please upload at least one image and provide a corresponding prompt.");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    // Reset statuses for valid slots
    setSlots(prev => prev.map(s => 
        (s.imageFile && s.prompt) ? { ...s, status: 'generating', error: undefined } : s
    ));

    let completedCount = 0;
    const total = validSlots.length;

    // We run them sequentially or with limited concurrency to avoid rate limits?
    // Veo is heavy, let's do sequential for safety in this demo, or parallel if user has quota.
    // Parallel is better for UX.
    
    const promises = validSlots.map(async (slot) => {
      try {
        if (!slot.imageFile) return;
        
        const url = await generateStoryClip(slot.imageFile, slot.prompt, settings);
        
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id
              ? { ...s, status: 'completed', videoUrl: url }
              : s
          )
        );
      } catch (error: any) {
        console.error(`Error generating slot ${slot.id}:`, error);
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id
              ? { ...s, status: 'error', error: error.message || 'Failed' }
              : s
          )
        );
      } finally {
        completedCount++;
        setProgress((completedCount / total) * 100);
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };

  const handleDownloadSingle = (id: number) => {
    const slot = slots.find((s) => s.id === id);
    if (slot && slot.videoUrl) {
      const a = document.createElement('a');
      a.href = slot.videoUrl;
      a.download = getFilename(slot.id);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadAll = async () => {
    if (!window.JSZip) {
        alert("Zip library not loaded.");
        return;
    }

    const zip = new window.JSZip();
    const folder = zip.folder("RoboAI_Story_Clips");
    const completedSlots = slots.filter(s => s.status === 'completed' && s.videoUrl);

    if (completedSlots.length === 0) return;

    // We need to fetch the blobs to zip them
    const fetchPromises = completedSlots.map(async (slot) => {
        if (!slot.videoUrl) return;
        try {
            const response = await fetch(slot.videoUrl);
            const blob = await response.blob();
            folder.file(getFilename(slot.id), blob);
        } catch (e) {
            console.error("Failed to download file for zip", e);
        }
    });

    await Promise.all(fetchPromises);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = getZipFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans relative">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Left Column: 40% width on large screens */}
      <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 h-full">
        <ControlPanel
          slots={slots}
          settings={settings}
          onUpdateSlot={updateSlotFile}
          onUpdatePrompts={parsePrompts}
          onUpdateSettings={setSettings}
          onGenerateAll={handleGenerateAll}
          isGenerating={isGenerating}
          progress={progress}
          hasApiKey={hasApiKey}
          onRequestKey={async () => {
              await requestApiKey();
              await verifyKey();
          }}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      </div>

      {/* Right Column: Remaining width */}
      <div className="flex-grow h-full">
        <OutputGrid
          slots={slots}
          onDownload={handleDownloadSingle}
          onDownloadAll={handleDownloadAll}
        />
      </div>
    </div>
  );
};

export default App;