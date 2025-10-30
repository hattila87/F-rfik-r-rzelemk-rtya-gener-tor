import React from 'react';
import type { CardData } from '../types';
import Card from './Card';

interface PrintLayoutProps {
  cards: CardData[];
}

// FIX: Changed the `chunkArray` arrow function to a standard function declaration.
// This avoids potential JSX parsing ambiguity with generic type parameters in a .tsx file,
// ensuring correct type inference for the `card` variable below.
function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ cards }) => {
  if (cards.length === 0) {
    return null;
  }

  const pages = chunkArray(cards, 8); // 8 cards per A4 page (2x4 grid)

  return (
    <div className="print-area">
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="w-[210mm] h-[297mm] bg-white p-[1cm] box-border shadow-2xl my-8 mx-auto page-break">
           <div className="grid grid-cols-2 gap-4 h-full">
            {/* FIX: Explicitly typed `card` as CardData. The type inference was failing, likely due to a complex interaction with the generic `chunkArray` function and JSX. */}
            {page.map((card: CardData) => (
              <Card key={card.emotion} imageUrl={card.imageUrl} emotion={card.emotion} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintLayout;