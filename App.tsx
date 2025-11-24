import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { generateStudyPlan } from './services/geminiService';
import { AppState, StudyPlanResponse, DailyPlan } from './types';
import { FlashcardComponent } from './components/Flashcard';

// --- VIEWS ---

// 1. Home / Upload View
const HomeView: React.FC<{ 
  onPlanGenerated: (plan: StudyPlanResponse) => void; 
  setAppState: (s: AppState) => void; 
  appState: AppState 
}> = ({ onPlanGenerated, setAppState, appState }) => {
  const [text, setText] = useState('');
  const [days, setDays] = useState(3);
  const [fileError, setFileError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    // Simple text based reading for txt/csv/md
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setText(ev.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileError('Przepraszamy, w tej wersji demo prosimy o wklejenie tekstu z plików PDF/DOCX ręcznie dla najlepszych rezultatów.');
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setAppState(AppState.GENERATING);
    try {
      const plan = await generateStudyPlan(text, days);
      onPlanGenerated(plan);
      setAppState(AppState.READY);
    } catch (e) {
      console.error(e);
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 relative z-20">
      <div className="text-center max-w-2xl animate-float">
        <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]">
          Ucz się <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-purple-400 to-gold">Seksownie & Mądrze</span>
        </h2>
        <p className="text-lg text-pink-100 font-light tracking-wide">
          Wgraj notatki. Odbierz plan. Zdominuj materiał.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,127,0.15)] relative overflow-hidden group hover:border-hot-pink/50 transition-colors duration-500">
        
        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-hot-pink text-xs font-bold mb-2 tracking-[0.2em] uppercase">
              MATERIAŁ ŹRÓDŁOWY
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-hot-pink focus:bg-white/10 focus:ring-1 focus:ring-hot-pink transition-all resize-none scrollbar-thin scrollbar-thumb-hot-pink scrollbar-track-transparent placeholder-white/20"
              placeholder="Wklej tutaj swoje notatki, rozdziały książki lub artykuły..."
            />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-end">
             <div className="flex-1">
                <label className="block text-hot-pink text-xs font-bold mb-2 tracking-[0.2em] uppercase">
                   PLIK (.TXT, .MD)
                </label>
                <div className="relative group/file">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-6
                      file:rounded-full file:border-0
                      file:text-xs file:font-bold file:uppercase file:tracking-wider
                      file:bg-gradient-to-r file:from-purple-900 file:to-hot-pink file:text-white
                      hover:file:shadow-[0_0_15px_#FF007F] cursor-pointer transition-all"
                  />
                </div>
                {fileError && <p className="text-red-400 text-xs mt-2">{fileError}</p>}
             </div>
             
             <div className="flex-1">
               <label className="block text-hot-pink text-xs font-bold mb-2 tracking-[0.2em] uppercase flex justify-between">
                 INTENSYWNOŚĆ (DNI) <span className="text-gold text-lg font-serif">{days}</span>
               </label>
               <input 
                 type="range" 
                 min="1" 
                 max="14" 
                 value={days} 
                 onChange={(e) => setDays(Number(e.target.value))}
                 className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-hot-pink hover:accent-gold transition-all"
               />
             </div>
          </div>

          <div className="pt-6 flex justify-center">
             <Button onClick={handleSubmit} isLoading={appState === AppState.GENERATING} disabled={!text} className="w-full md:w-auto text-lg">
               Generuj Klopsa ✨
             </Button>
          </div>
          
          {appState === AppState.ERROR && (
             <p className="text-center text-red-500 mt-4 font-bold bg-black/50 p-2 rounded">Ups! Coś poszło nie tak. Spróbuj ponownie.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard / Plan View
const DashboardView: React.FC<{ plan: StudyPlanResponse | null }> = ({ plan }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const navigate = useNavigate();

  if (!plan) return <Navigate to="/" />;

  const activeDay: DailyPlan = plan.schedule[activeDayIndex];

  return (
    <div className="max-w-6xl mx-auto relative z-20">
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-white drop-shadow-md">
              {plan.planName}
            </h2>
            <p className="text-pink-300 text-sm tracking-wider uppercase mt-1">
              Dzień {activeDay.day} z {plan.totalDays} &bull; {activeDay.topic}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/')} className="!py-2 !px-6 text-xs uppercase tracking-widest">
             Zacznij od nowa
          </Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Day Navigation */}
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 sticky top-24">
                <h3 className="text-gold font-bold uppercase tracking-[0.2em] mb-6 text-xs text-center border-b border-white/10 pb-4">Twój Harmonogram</h3>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-hot-pink/50">
                   {plan.schedule.map((day, idx) => (
                      <button
                        key={day.day}
                        onClick={() => { setActiveDayIndex(idx); setActiveTab('summary'); }}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-l-2 relative overflow-hidden group ${
                           idx === activeDayIndex 
                           ? 'bg-gradient-to-r from-hot-pink/30 to-purple-900/30 border-hot-pink text-white shadow-[0_0_20px_rgba(255,0,127,0.2)]' 
                           : 'border-white/5 text-gray-400 hover:bg-white/5 hover:text-white hover:border-gold/50'
                        }`}
                      >
                         <div className="font-serif font-bold text-lg mb-1 relative z-10">Dzień {day.day}</div>
                         <div className="text-xs uppercase tracking-wide opacity-80 truncate relative z-10">{day.topic}</div>
                         {/* Hover glow */}
                         <div className="absolute inset-0 bg-hot-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
             <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hot-pink via-purple-500 to-gold"></div>
                
                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/20">
                   {['summary', 'flashcards', 'quiz'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-5 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all relative ${
                           activeTab === tab 
                           ? 'text-white bg-white/5' 
                           : 'text-gray-500 hover:text-pink-200'
                        }`}
                      >
                         {tab === 'summary' ? 'Wiedza' : tab === 'flashcards' ? 'Fiszki' : 'Quiz'}
                         {activeTab === tab && (
                           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-hot-pink shadow-[0_0_10px_#FF007F]"></div>
                         )}
                      </button>
                   ))}
                </div>

                <div className="p-6 md:p-10 flex-grow">
                   {/* Content: Summary */}
                   {activeTab === 'summary' && (
                      <div className="animate-float" style={{animationDuration: '10s'}}>
                         <div className="prose prose-invert prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-pink-100 max-w-none">
                            <h3 className="text-3xl mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{activeDay.topic}</h3>
                            <div className="bg-white/5 p-8 rounded-2xl border border-white/5 leading-loose text-lg font-light tracking-wide shadow-inner">
                               {activeDay.summary}
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Content: Flashcards */}
                   {activeTab === 'flashcards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {activeDay.flashcards.map((card, idx) => (
                            <FlashcardComponent key={idx} front={card.front} back={card.back} />
                         ))}
                         {activeDay.flashcards.length === 0 && <p className="text-center w-full text-gray-500 italic">Brak fiszek na ten dzień.</p>}
                      </div>
                   )}

                   {/* Content: Quiz */}
                   {activeTab === 'quiz' && (
                      <div className="space-y-10 max-w-3xl mx-auto">
                         {activeDay.quiz.map((q, qIdx) => (
                            <div key={qIdx} className="group">
                               <h4 className="text-xl font-serif text-white mb-6 pl-4 border-l-4 border-hot-pink">
                                 {q.question}
                               </h4>
                               <div className="grid gap-4">
                                  {q.options.map((opt, oIdx) => (
                                     <button 
                                        key={oIdx}
                                        className="relative overflow-hidden w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group-quiz-btn"
                                        onClick={(e) => {
                                           const btn = e.currentTarget;
                                           // Reset siblings
                                           const parent = btn.parentElement;
                                           if(parent) {
                                             Array.from(parent.children).forEach(child => {
                                               child.classList.remove('ring-2', 'ring-green-500', 'ring-red-500', 'bg-green-900/50', 'bg-red-900/50');
                                               child.classList.add('opacity-50');
                                             });
                                           }
                                           btn.classList.remove('opacity-50');
                                           
                                           if (oIdx === q.correctAnswerIndex) {
                                              btn.classList.add('ring-2', 'ring-green-500', 'bg-green-900/50');
                                           } else {
                                              btn.classList.add('ring-2', 'ring-red-500', 'bg-red-900/50');
                                           }
                                        }}
                                     >
                                        <span className="relative z-10 text-gray-200 font-light">{opt}</span>
                                     </button>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const navigate = useNavigate();

  const handlePlanGenerated = (plan: StudyPlanResponse) => {
    setStudyPlan(plan);
    navigate('/plan');
  };

  return (
    <Layout>
       <Routes>
          <Route path="/" element={
             <HomeView 
                onPlanGenerated={handlePlanGenerated} 
                setAppState={setAppState} 
                appState={appState} 
             />
          } />
          <Route path="/plan" element={<DashboardView plan={studyPlan} />} />
       </Routes>
    </Layout>
  );
};

// Wrap App in HashRouter here for GitHub Pages compatibility
const RootApp: React.FC = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default RootApp;