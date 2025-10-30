import React from 'react';

interface CardProps {
  imageUrl: string;
  emotion: string;
}

const Card: React.FC<CardProps> = ({ imageUrl, emotion }) => {
  return (
    <div className="aspect-[2.5/3.5] w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden relative flex flex-col justify-end border-2 border-gray-700 print:border-black">
      <img src={imageUrl} alt={emotion} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <h3 className="relative p-2 sm:p-3 text-center text-white font-bold text-sm sm:text-base md:text-lg tracking-wider uppercase" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
        {emotion}
      </h3>
    </div>
  );
};

export default Card;
