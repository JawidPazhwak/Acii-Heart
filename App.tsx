import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateAsciiHeart } from './services/geminiService';

// --- SVG Icons ---
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
  </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


// --- UI Components ---

const GenerativeLoader: React.FC = () => {
    const [scrambledText, setScrambledText] = useState('');
    const chars = '-=*/+<>!@#$%^&()_{}[]?|';
    
    useEffect(() => {
        const generateScramble = () => {
            let text = '';
            // Approximate size of the display area
            const lines = 15;
            const charsPerLine = 40;
            for (let i = 0; i < lines; i++) {
                for (let j = 0; j < charsPerLine; j++) {
                    text += chars[Math.floor(Math.random() * chars.length)];
                }
                text += '\n';
            }
            return text;
        };

        const intervalId = setInterval(() => {
            setScrambledText(generateScramble());
        }, 100);

        // Set initial state
        setScrambledText(generateScramble());

        return () => clearInterval(intervalId);
    }, [chars]);

    return (
        <div className="flex flex-col items-center text-pink-400 w-full h-full justify-center">
            <pre className="text-pink-400/50 text-xs font-mono whitespace-pre text-center overflow-hidden">
                {scrambledText}
            </pre>
            <p className="mt-4 text-sm absolute bottom-4 bg-gray-900/50 px-4 py-1 rounded">Generating your heart...</p>
        </div>
    );
};


interface AsciiDisplayProps {
  art: string;
  isLoading: boolean;
}

const AsciiDisplay: React.FC<AsciiDisplayProps> = ({ art, isLoading }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset copied state when new art is generated
    setCopied(false);
  }, [art]);

  const handleCopy = () => {
    if (art && !isLoading) {
      navigator.clipboard.writeText(art);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border border-pink-500/30 rounded-lg shadow-lg p-4 min-h-[300px] flex items-center justify-center overflow-hidden">
      {isLoading ? (
        <GenerativeLoader />
      ) : (
        <pre className="text-pink-300 text-xs md:text-sm font-mono whitespace-pre text-center overflow-x-auto animate-pulse-heart">
          {art}
        </pre>
      )}
      {!isLoading && art && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-gray-700/50 text-gray-300 hover:bg-pink-500/50 hover:text-white transition-all duration-200"
          aria-label="Copy to clipboard"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      )}
    </div>
  );
};

const Header: React.FC = () => (
    <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            ASCII <span className="text-pink-400">Heart</span> Generator
        </h1>
        <p className="text-gray-400">Crafted with love &amp; code</p>
    </header>
);

interface GenerateButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg shadow-lg hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:from-pink-700 disabled:to-rose-700 disabled:cursor-not-allowed disabled:scale-100"
    >
        <HeartIcon />
        {isLoading ? 'Creating...' : 'Generate New Heart'}
    </button>
);


const Footer: React.FC = () => (
    <footer className="text-center text-gray-500 text-sm mt-12">
        <p>Find your perfect ASCII heart.</p>
    </footer>
);

// --- Question Modal Component ---
const questions = [
  "Do you smile when you see my name pop up?",
  "Have you ever imagined us on a romantic getaway?",
  "Would you let me steal your hoodie?",
  "Do you think we’d make a cute couple?",
  "Have you ever blushed because of something I said?"
];

interface QuestionModalProps {
    question: string;
    onYes: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onYes }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [noPosition, setNoPosition] = useState({ top: -200, left: -200 }); // Start off-screen

    const moveButton = useCallback(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const buttonWidth = 90; // approximate width of the button
            const buttonHeight = 60; // approximate height

            const newLeft = Math.random() * (clientWidth - buttonWidth);
            const newTop = Math.random() * (clientHeight - buttonHeight);

            setNoPosition({ top: newTop, left: newLeft });
        }
    }, []);

    useEffect(() => {
      // Set initial position after the component mounts
      const timer = setTimeout(moveButton, 100);
      return () => clearTimeout(timer);
    }, [moveButton]);

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                ref={containerRef}
                className="bg-gray-800 border border-pink-500/50 rounded-lg shadow-2xl p-8 text-center w-full max-w-md h-64 relative flex flex-col items-center justify-start"
            >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-10">{question}</h2>
                <button
                    onClick={onYes}
                    className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 z-10"
                >
                    Yes
                </button>
                <button
                    onMouseEnter={moveButton}
                    onTouchStart={(e) => {
                        e.preventDefault(); // Prevents click event on touch devices
                        moveButton();
                    }}
                    style={{
                        position: 'absolute',
                        top: `${noPosition.top}px`,
                        left: `${noPosition.left}px`,
                        transition: 'top 0.3s ease, left 0.3s ease',
                    }}
                    className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-lg"
                >
                    No
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
  const [asciiArt, setAsciiArt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInitialGeneration, setIsInitialGeneration] = useState(true);


  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    // Simulate loading for a better user experience and to let the animation play
    setTimeout(() => {
        const art = generateAsciiHeart();
        setAsciiArt(art);
        setIsLoading(false);
        if (isInitialGeneration) {
            // Delay showing questions slightly so the heart appears first
            setTimeout(() => setShowQuestions(true), 500);
            setIsInitialGeneration(false);
        }
    }, 750);
  }, [isInitialGeneration]);

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYesClick = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
    } else {
        setShowQuestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
        {showQuestions && (
            <QuestionModal
                question={questions[currentQuestionIndex]}
                onYes={handleYesClick}
            />
        )}
        <div 
            className="absolute inset-0 z-0 opacity-20 animate-gradient" 
            style={{
                backgroundImage: 'radial-gradient(circle at top left, #ff007f, transparent 40%), radial-gradient(circle at bottom right, #7f00ff, transparent 40%)'
            }}
        />
        <div className="relative z-10 flex flex-col items-center w-full">
            <Header />
            <main className="w-full flex flex-col items-center gap-8 px-4">
                <AsciiDisplay art={asciiArt} isLoading={isLoading} />
                <GenerateButton onClick={handleGenerate} isLoading={isLoading} />
            </main>
            <Footer />
        </div>
    </div>
  );
}
