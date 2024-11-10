'use client';

import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search query:', query);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="flex gap-4 rounded-lg bg-gradient-to-r from-secondary to-secondary-dark py-5 px-6 text-white font-normal  items-end">
        <div className="flex-[1.5] flex flex-col gap-2">
            <div>Поиск события</div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Название, отрасль, город"
                className="w-full rounded-full px-4 h-10 text-black bg-white focus:outline-none focus:border-black border border-solid transition-colors" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <div>Даты проведения</div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Дата, диапазон дат" className="w-full" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <div>Отрасль</div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Отрасль" className="w-full" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <div>Город</div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Город" className="w-full" />
        </div>
        <div className="flex-[0.5] flex flex-col gap-2">
            <button type="submit" className="rounded-full px-4 h-10 bg-primary text-black hover:bg-primary-dark active:bg-primary-darker transition-colors">Поиск</button>
        </div>
      </div>
    </form>
  );
}
