import React, { useState, useRef } from 'react';
import { Upload, FileText, Settings, Play, CheckCircle, Plus, CircleHelp } from 'lucide-react';
import { StoryClip, VideoSettings } from '../types';

interface ControlPanelProps {
  slots: StoryClip[];
  settings: VideoSettings;
  onUpdateSlot: (id: number, file: File) => void;
  onUpdatePrompts: (text: string) => void;
  onUpdateSettings: (settings: VideoSettings) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
  progress: number;
  hasApiKey: boolean;
  onRequestKey: () => void;
  onOpenHelp: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  slots,
  settings,
  onUpdateSlot,
  onUpdatePrompts,
  onUpdateSettings,
  onGenerateAll,
  isGenerating,
  progress,
  hasApiKey,
  onRequestKey,
  onOpenHelp
}) => {
  const [rawPromptText, setRawPromptText] = useState('');
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdateSlot(id, e.target.files[0]);
    }
  };

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file, index) => {
        if (index < 10) {
          onUpdateSlot(index + 1, file); // 1-based ID
        }
      });
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawPromptText(e.target.value);
    onUpdatePrompts(e.target.value);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-900 border-r border-slate-800 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Control Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure your consistent story assets.</p>
        </div>
        <button 
            onClick={onOpenHelp}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="View Help"
        >
            <CircleHelp className="w-6 h-6" />
        </button>
      </div>

      {/* API Key Section */}
      {!hasApiKey && (
        <div className="bg-amber-900/30 border border-amber-600/50 p-4 rounded-lg">
          <p className="text-amber-200 text-sm mb-3">Veo requires a paid API key.</p>
          <button
            onClick={onRequestKey}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-sm transition-colors"
          >
            Connect Google AI Studio
          </button>
           <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="block mt-2 text-xs text-center text-amber-400 hover:underline"
          >
            View Billing Documentation
          </a>
        </div>
      )}

      {/* 1. Reference Images */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" /> Reference Images
            </h3>
            <label className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                Batch Upload (Max 10)
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultiUpload} />
            </label>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
                slot.imageUrl ? 'border-blue-500/50 bg-slate-800' : 'border-slate-700 hover:border-slate-600 bg-slate-900'
              }`}
            >
              {slot.imageUrl ? (
                <>
                  <img src={slot.imageUrl} alt={`Slot ${slot.id}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        onClick={() => fileInputRefs.current[slot.id]?.click()}
                        className="text-xs bg-slate-800 text-white px-2 py-1 rounded"
                    >
                        Replace
                    </button>
                  </div>
                  <div className="absolute top-1 left-1 bg-black/60 text-[10px] px-1 rounded text-white">#{slot.id}</div>
                </>
              ) : (
                <button
                  onClick={() => fileInputRefs.current[slot.id]?.click()}
                  className="flex flex-col items-center text-slate-500 hover:text-slate-400"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Img {slot.id}</span>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => {
                    fileInputRefs.current[slot.id] = el;
                }}
                onChange={(e) => handleFileChange(slot.id, e)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Prompt Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" /> Prompts (JSON or Text)
        </h3>
        <textarea
          value={rawPromptText}
          onChange={handlePromptChange}
          placeholder={`Paste prompts here. One per line or JSON format.
Example:
{"prompt": "Character running across a field"}
{"prompt": "Character waving hello"}
...`}
          className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-slate-500">
            Auto-mapped: Line 1 → Image 1, Line 2 → Image 2, etc.
        </p>
      </div>

      {/* 3. Video Settings */}
      <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Generation Settings</h3>
        
        <div className="space-y-3">
            <div>
                <label className="text-xs text-slate-400 block mb-1">Model</label>
                <select 
                    value={settings.model}
                    onChange={(e) => onUpdateSettings({...settings, model: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                    <option value="veo-3.1-generate-preview">Veo 3 (Standard)</option>
                    <option value="veo-3.1-fast-generate-preview">Veo 3 (Fast)</option>
                    <option disabled>Sora 2 (Coming Soon)</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Resolution</label>
                    <select 
                        value={settings.resolution}
                        onChange={(e) => onUpdateSettings({...settings, resolution: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    >
                        <option value="1080p">1080p HD</option>
                        <option value="720p">720p</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Aspect Ratio</label>
                    <select 
                        value={settings.aspectRatio}
                        onChange={(e) => onUpdateSettings({...settings, aspectRatio: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1"
                    >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="1:1">1:1 (Square)</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-300">Consistency Mode</span>
                <button 
                    onClick={() => onUpdateSettings({...settings, consistencyMode: !settings.consistencyMode})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${settings.consistencyMode ? 'bg-blue-500' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.consistencyMode ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        </div>
      </div>

      {/* 4. Generate Button */}
      <div className="pt-4 pb-10">
        <button
            onClick={onGenerateAll}
            disabled={isGenerating || !hasApiKey}
            className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                ${isGenerating 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : !hasApiKey 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'
                }`}
        >
            {isGenerating ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating {Math.round(progress)}%
                </>
            ) : (
                <>
                    <Play className="w-5 h-5 fill-current" />
                    Generate All Videos
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;