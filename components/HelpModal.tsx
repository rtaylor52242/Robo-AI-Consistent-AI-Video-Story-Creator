import React from 'react';
import { X, Upload, FileText, Settings, Play, Download } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
             <h2 className="text-2xl font-bold text-blue-400">How to use Robo AI</h2>
             <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            <p className="text-slate-300 text-lg">
                Create consistent animated story clips from your character images using Google Veo models.
            </p>

            <div className="space-y-8">
                {/* Step 1 */}
                <section className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/50 text-blue-400 font-bold">1</div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-2">
                            <Upload className="w-4 h-4" /> Upload Reference Images
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Upload up to 10 images in the left panel. These serve as the visual base for your characters.
                            <br/>
                            <span className="text-blue-400/80 text-xs">Tip: Use the "Batch Upload" link to select multiple files at once.</span>
                        </p>
                    </div>
                </section>

                {/* Step 2 */}
                <section className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/50 text-purple-400 font-bold">2</div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" /> Input Prompts
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">
                            Enter your story prompts in the text box. The app automatically maps each line to an image slot (Line 1 → Image 1, Line 2 → Image 2).
                        </p>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 shadow-inner">
                            <p className="text-slate-500 mb-2">// Option A: Simple Text (One per line)</p>
                            <p className="mb-1">A robot walking through a neon city.</p>
                            <p className="mb-4">The robot waves at a flying car.</p>
                            
                            <p className="text-slate-500 mb-2">// Option B: JSON Format</p>
                            <p className="mb-1">{`{"prompt": "Cinematic shot of character running"}`}</p>
                            <p>{`{"prompt": "Close up of character smiling"}`}</p>
                        </div>
                    </div>
                </section>

                {/* Step 3 */}
                <section className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-500/50 text-amber-400 font-bold">3</div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-2">
                            <Settings className="w-4 h-4" /> Configure & Generate
                        </h3>
                        <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 ml-1">
                            <li>Select your desired <strong>Model</strong> (Veo 3 Standard or Fast).</li>
                            <li>Set <strong>Resolution</strong> (1080p recommended) and <strong>Aspect Ratio</strong>.</li>
                            <li>Ensure you have connected a paid <strong>Google API Key</strong>.</li>
                            <li>Click <strong className="text-blue-400">Generate All Videos</strong> to start batch processing.</li>
                        </ul>
                    </div>
                </section>

                 {/* Step 4 */}
                 <section className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/50 text-green-400 font-bold">4</div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-2">
                            <Download className="w-4 h-4" /> Preview & Export
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                           Watch your generated clips in the right-hand grid. You can download individual MP4 files or click <strong>Download All (ZIP)</strong> to get the full story package.
                        </p>
                    </div>
                </section>
            </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
            <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
                <Play className="w-4 h-4 fill-current" />
                Start Creating
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;