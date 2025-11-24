import React, { useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
}

export const FlashcardComponent: React.FC<FlashcardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-1000 w-full h-64 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl text-center">
           <h3 className="text-gold font-serif text-sm uppercase mb-4 tracking-widest">Pytanie</h3>
           <p className="text-lg md:text-xl font-medium text-white">{front}</p>
           <div className="absolute bottom-4 right-4 text-xs text-white/30">Kliknij aby odwrócić</div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-900 to-black border border-hot-pink/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,0,127,0.2)] text-center">
           <h3 className="text-hot-pink font-serif text-sm uppercase mb-4 tracking-widest">Odpowiedź</h3>
           <p className="text-lg md:text-xl font-medium text-white">{back}</p>
        </div>

      </div>
    </div>
  );
};