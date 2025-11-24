import React from 'react';
import { Link } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-deep-purple to-black text-gray-100 flex flex-col font-sans selection:bg-hot-pink selection:text-white overflow-hidden relative">
      <header className="w-full py-6 px-4 md:px-8 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hot-pink to-gold flex items-center justify-center shadow-[0_0_15px_#FF007F] group-hover:scale-110 transition-transform">
                <span className="text-xl">💋</span>
             </div>
             <h1 className="text-2xl md:text-3xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-gold tracking-widest uppercase">
               Klops Naukowy
             </h1>
          </Link>
          <nav>
            <Link to="/" className="text-sm md:text-base font-bold text-pink-300 hover:text-white transition-colors uppercase tracking-wider">
              Start
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>

      {/* TŁO: Animowane akcenty - Sylwetki */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Lewa strona - różowa poświata i sylwetka */}
        <div className="absolute top-[20%] -left-[5%] w-[500px] h-[800px] opacity-20 animate-breathe mix-blend-screen text-hot-pink">
           <svg viewBox="0 0 200 600" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter blur-xl">
              <path d="M100,50 Q130,100 110,150 T90,250 Q60,300 80,400 T120,550" stroke="currentColor" strokeWidth="150" fill="none" strokeLinecap="round" />
           </svg>
        </div>
        
        {/* Prawa strona - złota sylwetka */}
        <div className="absolute bottom-0 -right-[10%] w-[600px] h-[900px] opacity-10 animate-float mix-blend-screen text-purple-500">
           <svg viewBox="0 0 300 800" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter blur-2xl">
               <path d="M150,100 Q100,200 140,300 T160,500 Q200,600 150,750" stroke="currentColor" strokeWidth="180" fill="none" strokeLinecap="round" />
           </svg>
        </div>

        {/* Abstrakcyjne kształty */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gold/10 rounded-full blur-[50px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-hot-pink/10 rounded-full blur-[80px] animate-sway"></div>
      </div>

      <footer className="py-6 text-center text-white/40 text-sm border-t border-white/5 relative z-10 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} Klops Naukowy. Powered by Gemini.</p>
      </footer>
    </div>
  );
};