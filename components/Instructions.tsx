
import React, { useState } from 'react';

interface InstructionsProps {
  markdownText: string;
}

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h2 key={index} className="text-2xl font-bold mt-4 mb-2 text-amber-400">{line.substring(2)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-bold mt-3 mb-1 text-amber-300">{line.substring(3)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
          return <br key={index} />;
      }
      return <p key={index} className="my-1">{line}</p>;
    });
  
    return <div>{lines}</div>;
};


const Instructions: React.FC<InstructionsProps> = ({ markdownText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdownText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!markdownText) return null;

  return (
    <div className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-amber-500">Jégtörő Játék Leírása</h2>
            <button
                onClick={handleCopy}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                {copied ? 'Másolva!' : 'Szöveg másolása'}
            </button>
        </div>
      <div className="prose prose-invert max-w-none text-gray-300">
        <SimpleMarkdownRenderer text={markdownText} />
      </div>
    </div>
  );
};

export default Instructions;
