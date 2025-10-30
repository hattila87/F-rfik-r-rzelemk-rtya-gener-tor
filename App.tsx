

import React, { useState, useCallback } from 'react';
import type { CardData } from './types';
import { generateCardImage, generateGameInstructions } from './services/geminiService';
import PrintLayout from './components/PrintLayout';
import Instructions from './components/Instructions';
import Card from './components/Card';

const DEFAULT_EMOTIONS = 'Harag, Öröm, Bánat, Félelem, Meglepetés, Megvetés, Büszkeség, Szégyen';

const App: React.FC = () => {
  const [emotionsInput, setEmotionsInput] = useState(DEFAULT_EMOTIONS);
  const [generatedCards, setGeneratedCards] = useState<CardData[]>([]);
  const [gameInstructions, setGameInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCards([]);
    setGameInstructions('');
    setProgressMessage(null);

    const emotions = emotionsInput.split(',').map(e => e.trim()).filter(Boolean);
    if (emotions.length === 0) {
      setError('Kérlek, adj meg legalább egy érzelmet.');
      setIsLoading(false);
      return;
    }

    try {
      // Generate instructions can start in parallel with card generation
      const instructionsPromise = generateGameInstructions();

      // Generate cards sequentially to avoid API rate limiting
      const cards: CardData[] = [];
      for (const [index, emotion] of emotions.entries()) {
        setProgressMessage(`"${emotion}" kártya generálása... (${index + 1}/${emotions.length})`);
        const imageUrl = await generateCardImage(emotion);
        const newCard = { emotion, imageUrl };
        cards.push(newCard);
        setGeneratedCards([...cards]); // Update UI with the new card as it's generated

        // Add a delay between API calls to avoid rate limiting issues on free tiers.
        if (index < emotions.length - 1) {
          await new Promise(res => setTimeout(res, 1500));
        }
      }

      // Wait for instructions to finish
      const instructions = await instructionsPromise;
      setGameInstructions(instructions);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt.');
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [emotionsInput]);
  
  const handlePrint = () => {
      window.print();
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-amber-500 tracking-wider">Érzelemkártyák Férfikörökhöz</h1>
        <p className="mt-2 text-lg text-gray-400">Generálj és nyomtass szimbolikus kártyákat a mély beszélgetések elősegítéséhez.</p>
      </header>

      <main className="w-full max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-2xl">
          <label htmlFor="emotions" className="block text-lg font-semibold mb-2 text-amber-400">
            Érzelmek (vesszővel elválasztva)
          </label>
          <textarea
            id="emotions"
            value={emotionsInput}
            onChange={(e) => setEmotionsInput(e.target.value)}
            placeholder={DEFAULT_EMOTIONS}
            rows={3}
            className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            disabled={isLoading}
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-grow w-full sm:w-auto px-6 py-3 bg-amber-600 text-white font-bold text-lg rounded-md hover:bg-amber-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generálás...
                  </>
                ) : (
                  'Kártyák és Játék Generálása'
                )}
            </button>
            {generatedCards.length > 0 && !isLoading && (
                <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-bold text-lg rounded-md hover:bg-gray-700 transition-colors"
                >
                    Kártyák Nyomtatása
                </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">
            <strong>Hiba:</strong> {error}
          </div>
        )}

        <Instructions markdownText={gameInstructions} />

        {/* Card Preview Grid (visible on screen after generation is complete) */}
        {generatedCards.length > 0 && !isLoading && (
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-center text-amber-500 mb-6">Elkészült Kártyák</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {generatedCards.map((card) => (
                        <Card key={card.emotion} imageUrl={card.imageUrl} emotion={card.emotion} />
                    ))}
                </div>
            </div>
        )}
        
        {/* Printable Layout (always in DOM when cards exist, but hidden from screen) */}
        <div className="hidden print:block">
            {generatedCards.length > 0 && <PrintLayout cards={generatedCards} />}
        </div>
        
        {isLoading && (
            <div className="text-center mt-8 text-amber-400">
                <p className="text-xl">{progressMessage || 'Képek és játékleírás generálása...'}</p>
                <p className="text-gray-400">Ez a hozzáadott késleltetés miatt lassabb lehet. Kérlek, légy türelemmel.</p>
            </div>
        )}

        {/* This will show cards as they are generated during the loading state */}
        {isLoading && generatedCards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {generatedCards.map((card) => (
              <Card key={card.emotion} imageUrl={card.imageUrl} emotion={card.emotion} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;