import React from 'react';
import { Download, Film, Package } from 'lucide-react';
import { StoryClip } from '../types';

interface OutputGridProps {
  slots: StoryClip[];
  onDownload: (id: number) => void;
  onDownloadAll: () => void;
}

const OutputGrid: React.FC<OutputGridProps> = ({ slots, onDownload, onDownloadAll }) => {
  const generatedCount = slots.filter(s => s.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-500" />
            Story Board
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review and export your generated clips.</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={onDownloadAll}
                disabled={generatedCount === 0}
                className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors text-sm
                    ${generatedCount > 0 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
                <Package className="w-4 h-4" />
                Download All (ZIP)
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {slots.map((slot) => (
            <div 
                key={slot.id} 
                className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-lg"
            >
                {/* Video Area */}
                <div className="aspect-video bg-black relative flex items-center justify-center">
                    {slot.status === 'completed' && slot.videoUrl ? (
                        <video 
                            src={slot.videoUrl} 
                            controls 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center p-4">
                            {slot.status === 'generating' && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-blue-400 animate-pulse">Rendering...</span>
                                </div>
                            )}
                            {slot.status === 'idle' && (
                                <span className="text-xs text-slate-600">Waiting for generation</span>
                            )}
                            {slot.status === 'error' && (
                                <span className="text-xs text-red-400 px-2">Error: {slot.error || 'Failed'}</span>
                            )}
                        </div>
                    )}

                    {/* Overlay Status Label */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] font-mono text-white">
                        {slot.id.toString().padStart(3, '0')}
                    </div>
                </div>

                {/* Info / Actions */}
                <div className="p-3 flex flex-col gap-2 flex-grow">
                    <div className="flex-grow">
                         <p className="text-xs text-slate-400 line-clamp-2" title={slot.prompt}>
                            {slot.prompt || <span className="italic opacity-50">No prompt provided</span>}
                         </p>
                    </div>
                    
                    <button
                        onClick={() => onDownload(slot.id)}
                        disabled={slot.status !== 'completed'}
                        className={`w-full py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors
                            ${slot.status === 'completed' 
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                                : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                    >
                        <Download className="w-3 h-3" />
                        Download MP4
                    </button>
                </div>
            </div>
        ))}
      </div>
      
      {/* Empty State Helper */}
      {generatedCount === 0 && slots.every(s => s.status === 'idle') && (
          <div className="flex-grow flex items-center justify-center text-slate-600 flex-col gap-2 mt-10 opacity-50">
              <Film className="w-12 h-12 mb-2" />
              <p>Ready to animate your stories.</p>
          </div>
      )}
    </div>
  );
};

export default OutputGrid;