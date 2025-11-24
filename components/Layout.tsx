import React from 'react';
import { Link } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-deep-purple to-black text-gray-100 flex flex-col font-sans selection:bg-hot-pink selection:text-white">
      <header className="w-full py-6 px-4 md:px-8 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hot-pink to-gold flex items-center justify-center shadow-[0_0_15px_#FF007F] group-hover:scale-110 transition-transform">
                <span className="text-xl">💄</span>
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

      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {/* Decorative background elements */}
        <div className="fixed top-20 left-10 w-64 h-64 bg-hot-pink/20 rounded-full blur-[100px] -z-10 animate-pulse-slow pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-float pointer-events-none"></div>
        
        {children}
      </main>

      <footer className="py-6 text-center text-white/40 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Klops Naukowy. Powered by Gemini.</p>
      </footer>
    </div>
  );
};