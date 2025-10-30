

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCardImage = async (emotion: string): Promise<string> => {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = `Tarot card in an artistic, painterly style. It features a powerful figure from European mythology embodying the emotion of "${emotion}". The character's expression and posture should be the main focus, conveying the emotion clearly and dramatically. For example, "Harag" (Anger) could be Ares, "Bánat" (Sorrow) could be Niobe. The background should be atmospheric and symbolic. Rich, deep colors. Full card art with no text or words.`;
      
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: '3:4', // Closer to tarot card aspect ratio
          },
      });

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

      if (base64ImageBytes) {
        return `data:image/png;base64,${base64ImageBytes}`;
      }
      
      lastError = new Error('API returned a response with no image data.');
      console.warn(`Attempt ${attempt} for "${emotion}" returned no image. Retrying...`);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Error on attempt ${attempt} for "${emotion}":`, lastError);

      // Add specific check for rate limit error to provide a better user message and avoid pointless retries.
      if (lastError.message.includes('"code":429') || lastError.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('API kvóta túllépve. Kérjük, ellenőrizd a számlázási beállításaidat. A Google API ingyenes szintje korlátozhatja a percenkénti kérések számát.');
      }
    }
    
    if (attempt < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, 1000 * attempt)); // Simple exponential backoff
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed for "${emotion}". Last error:`, lastError);
  throw new Error(`Nem sikerült képet generálni a következőhöz: "${emotion}".`);
};

export const generateGameInstructions = async (): Promise<string> => {
    try {
        const prompt = `Férfikör vezető vagy. Alkoss egy egyszerű, hatékony jégtörő játékot egy férficsoport számára, egyedi érzelem-tarot kártyapakli használatával. A cél a sebezhetőség és a kapcsolódás ösztönzése biztonságos, strukturált módon. A játék legyen könnyen elmagyarázható, és körülbelül 20-30 percet vegyen igénybe egy 5-8 fős csoport számára.

Az utasításokat világos, lépésről-lépésre formátumban add meg, kézikönyvbe illő stílusban. Használj Markdown formázást. A nyelvezet legyen közvetlen, bátorító és tisztelettudó.

Az utasításoknak tartalmazniuk kell:
- Egy megnyerő címet.
- Egy rövid célt.
- Játékosok száma.
- Szükséges eszközök.
- Előkészületek.
- Részletes játékmenet.
- Egy záró gondolatot vagy egy tippet a vezetőnek.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error('Error generating game instructions:', error);
        throw new Error('Nem sikerült a játékleírást legenerálni.');
    }
};