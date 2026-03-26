import { useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface Props {
  bilder: string[];
  tittel: string;
}

export default function BildeGalleri({ bilder, tittel }: Props) {
  const [valgt, setValgt] = useState(0);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
      {bilder.map((bilde, i) => (
        <button
          key={bilde}
          onClick={() => setValgt(i)}
          className={`flex-shrink-0 w-14 h-14 rounded-sm overflow-hidden border-2 transition-all ${
            i === valgt ? 'border-accent scale-105' : 'border-border opacity-70 hover:opacity-100'
          }`}
        >
          <img
            src={`${BASE}${bilde}`}
            alt={`${tittel} ${i + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}
