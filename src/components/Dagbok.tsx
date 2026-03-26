import { useState, useEffect } from 'react';
import type { Sted } from '@/types/sted';
import VenstreSide from './VenstreSide';
import HoyreSide from './HoyreSide';

const BASE = import.meta.env.BASE_URL;

export default function Dagbok() {
  const [steder, setSteder] = useState<Sted[]>([]);
  const [aktivIndex, setAktivIndex] = useState(0);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState(false);

  useEffect(() => {
    fetch(`${BASE}generert/steder.json`)
      .then(r => {
        if (!r.ok) throw new Error('Feil');
        return r.json();
      })
      .then((data: Sted[]) => {
        setSteder(data);
        setLaster(false);
      })
      .catch(() => {
        setFeil(true);
        setLaster(false);
      });
  }, []);

  if (laster) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-display text-3xl text-foreground animate-pulse">Laster reisedagbok...</p>
      </div>
    );
  }

  if (feil || steder.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="font-display text-3xl text-foreground mb-2">
            {feil ? 'Kunne ikke laste inn data' : 'Ingen steder funnet'}
          </p>
          <p className="font-body text-muted-foreground">
            Legg til mapper i /steder/ og bygg prosjektet på nytt.
          </p>
        </div>
      </div>
    );
  }

  const aktivtSted = steder[aktivIndex];
  const forrige = () => setAktivIndex(i => Math.max(0, i - 1));
  const neste = () => setAktivIndex(i => Math.min(steder.length - 1, i + 1));

  return (
    <div className="h-screen flex flex-col items-center justify-center p-3 md:p-6 lg:p-8 overflow-hidden relative"
         style={{
           backgroundImage: `url('${BASE}images/map-bg.jpg')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
         }}
    >
      {/* Soft overlay to keep diary as focal point */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      {/* Content above overlay */}
      <div className="relative z-10 flex flex-col items-center flex-1 min-h-0 w-full">
        {/* Header */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 md:mb-6 text-center shrink-0 drop-shadow-sm">
          Maskotens reisedagbok
        </h1>

        {/* Book — fixed height container */}
        <div className="book-cover w-full max-w-6xl rounded-xl p-2 md:p-3 flex-1 min-h-0">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-1 h-full">
            {/* Left page */}
            <div className="flex-1 min-h-0 rounded-l-lg lg:rounded-l-lg rounded-t-lg lg:rounded-t-none overflow-hidden">
              <VenstreSide sted={aktivtSted} />
            </div>

            {/* Book spine */}
            <div className="hidden lg:block w-2 bg-leather opacity-40 self-stretch shrink-0" />

            {/* Right page */}
            <div className="flex-1 min-h-0 rounded-r-lg lg:rounded-r-lg rounded-b-lg lg:rounded-b-none overflow-hidden">
              <HoyreSide steder={steder} aktivtSted={aktivtSted} onVelgSted={setAktivIndex} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-4 md:mt-6 shrink-0">
          <button className="nav-btn" onClick={forrige} disabled={aktivIndex === 0}>
            ← Forrige
          </button>
          <span className="font-body text-muted-foreground text-sm">
            {aktivIndex + 1} / {steder.length}
          </span>
          <button className="nav-btn" onClick={neste} disabled={aktivIndex === steder.length - 1}>
            Neste →
          </button>
        </div>
      </div>
    </div>
  );
}
