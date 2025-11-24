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
    // For PDF/DOCX in a pure frontend demo without heavy libs, we guide user or try raw read
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center max-w-2xl animate-float">
        <h2 className="text-4xl md:text-6xl font-serif text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Rozpocznij Naukę <span className="text-hot-pink">z Klasą</span>
        </h2>
        <p className="text-lg text-gray-300">
          Wgraj swoje notatki, a nasza inteligentna asystentka przygotuje dla Ciebie spersonalizowany plan.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Aesthetic accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-hot-pink/20 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-pink-200 text-sm font-bold mb-2 tracking-wider uppercase">
              Wklej treść materiału
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 bg-black/40 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:border-hot-pink focus:ring-1 focus:ring-hot-pink transition-all resize-none scrollbar-thin scrollbar-thumb-hot-pink scrollbar-track-transparent"
              placeholder="Wklej tutaj tekst z PDF, DOCX lub notatek..."
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end">
             <div className="flex-1">
                <label className="block text-pink-200 text-sm font-bold mb-2 tracking-wider uppercase">
                   Lub wgraj plik (.txt, .md, .csv)
                </label>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-pink-50 file:text-hot-pink
                    hover:file:bg-pink-100 cursor-pointer"
                />
                {fileError && <p className="text-red-400 text-xs mt-2">{fileError}</p>}
             </div>
             
             <div className="flex-1">
               <label className="block text-pink-200 text-sm font-bold mb-2 tracking-wider uppercase">
                 Ilość dni nauki: <span className="text-gold text-lg">{days}</span>
               </label>
               <input 
                 type="range" 
                 min="1" 
                 max="14" 
                 value={days} 
                 onChange={(e) => setDays(Number(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-hot-pink"
               />
             </div>
          </div>

          <div className="pt-4 flex justify-center">
             <Button onClick={handleSubmit} isLoading={appState === AppState.GENERATING} disabled={!text}>
               Stwórz Plan Nauki ✨
             </Button>
          </div>
          
          {appState === AppState.ERROR && (
             <p className="text-center text-red-400 mt-4">Wystąpił błąd podczas generowania. Spróbuj ponownie.</p>
          )}
        </div>
      </div>
      
      {/* Decorative Image Placeholder - Glamorous/Safe */}
      <div className="fixed -right-20 bottom-0 opacity-20 pointer-events-none hidden lg:block">
         <img src="https://picsum.photos/seed/fashion/400/800" alt="Decoration" className="mask-image-gradient h-[600px] w-auto object-cover rounded-tl-3xl grayscale hover:grayscale-0 transition-all duration-1000" style={{maskImage: 'linear-gradient(to top, black 50%, transparent 100%)'}} />
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
    <div className="max-w-6xl mx-auto">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-white">
             {plan.planName} <span className="text-base font-sans text-gray-400 ml-2">(Dzień {activeDay.day}/{plan.totalDays})</span>
          </h2>
          <Button variant="secondary" onClick={() => navigate('/')} className="!py-2 !px-4 text-sm">
             Nowy Plan
          </Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Day Navigation */}
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <h3 className="text-gold font-bold uppercase tracking-wider mb-4 text-sm">Harmonogram</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-600">
                   {plan.schedule.map((day, idx) => (
                      <button
                        key={day.day}
                        onClick={() => { setActiveDayIndex(idx); setActiveTab('summary'); }}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 border-l-4 ${
                           idx === activeDayIndex 
                           ? 'bg-hot-pink/20 border-hot-pink text-white shadow-[0_0_10px_rgba(255,0,127,0.3)]' 
                           : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                         <div className="font-bold text-xs uppercase mb-1">Dzień {day.day}</div>
                         <div className="text-sm truncate">{day.topic}</div>
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
             <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-1 border border-white/10 shadow-2xl min-h-[600px] flex flex-col">
                
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                   {['summary', 'flashcards', 'quiz'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                           activeTab === tab 
                           ? 'text-hot-pink bg-white/5 border-b-2 border-hot-pink' 
                           : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                         {tab === 'summary' ? 'Notatki' : tab === 'flashcards' ? 'Fiszki' : 'Quiz'}
                      </button>
                   ))}
                </div>

                <div className="p-8 flex-grow">
                   <h3 className="text-2xl font-serif text-white mb-6 border-l-4 border-gold pl-4">
                      {activeDay.topic}
                   </h3>

                   {/* Content: Summary */}
                   {activeTab === 'summary' && (
                      <div className="prose prose-invert prose-pink max-w-none">
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/5 leading-relaxed text-gray-300 whitespace-pre-line">
                            {activeDay.summary}
                         </div>
                      </div>
                   )}

                   {/* Content: Flashcards */}
                   {activeTab === 'flashcards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {activeDay.flashcards.map((card, idx) => (
                            <FlashcardComponent key={idx} front={card.front} back={card.back} />
                         ))}
                         {activeDay.flashcards.length === 0 && <p>Brak fiszek na ten dzień.</p>}
                      </div>
                   )}

                   {/* Content: Quiz */}
                   {activeTab === 'quiz' && (
                      <div className="space-y-8">
                         {activeDay.quiz.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                               <p className="text-lg font-bold text-white mb-4">{qIdx + 1}. {q.question}</p>
                               <div className="space-y-2">
                                  {q.options.map((opt, oIdx) => (
                                     <button 
                                        key={oIdx}
                                        className="w-full text-left p-3 rounded-lg bg-black/40 hover:bg-hot-pink/20 border border-white/10 hover:border-hot-pink transition-all text-gray-300 hover:text-white"
                                        onClick={(e) => {
                                           const btn = e.currentTarget;
                                           if (oIdx === q.correctAnswerIndex) {
                                              btn.classList.add('!bg-green-600', '!border-green-400');
                                           } else {
                                              btn.classList.add('!bg-red-600', '!border-red-400');
                                           }
                                        }}
                                     >
                                        {opt}
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