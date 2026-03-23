'use client';

import { useState } from 'react';

interface Props {
  onCreateList: (title: string) => void;
}

export default function NewListPlaceholder({ onCreateList }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateList(title);
      setTitle('');
    }
  };

  return (
    <div className="flex flex-col min-w-[280px] w-full md:w-1/3 lg:w-1/5 snap-center opacity-60 hover:opacity-100 transition-opacity">
      <form onSubmit={handleSubmit} className="border-t-4 border-dashed border-gray-300 py-2 mb-2">
        <input
          type="text"
          placeholder="Name your new list..."
          className="w-full bg-transparent outline-none text-lg font-bold text-gray-500 placeholder-gray-400 leading-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </form>

      <div className="flex-1 border-2 border-dashed border-gray-100 rounded-sm min-h-[50px] flex flex-col items-center justify-center">
        <div className="w-full border-b border-dashed border-gray-100 h-8" />
        <div className="w-full border-b border-dashed border-gray-100 h-8" />
        <div className="w-full border-b border-dashed border-gray-100 h-8" />
        <span className="text-xs text-gray-300 mt-2">Tasks will go here</span>
      </div>
    </div>
  );
}
