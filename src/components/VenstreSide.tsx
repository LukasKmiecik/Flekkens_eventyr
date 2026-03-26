import type { Sted } from '@/types/sted';
import BildeGalleri from './BildeGalleri';
import MorsomFakta from './MorsomFakta';

interface Props {
  sted: Sted;
}

const BASE = import.meta.env.BASE_URL;

export default function VenstreSide({ sted }: Props) {
  const hovedbilde = sted.forsidebilde
    ? `${BASE}${sted.forsidebilde}`
    : sted.bilder.length > 0
    ? `${BASE}${sted.bilder[0]}`
    : null;

  return (
    <div className="book-page flex flex-col h-full p-4 md:p-6 lg:p-8 overflow-hidden">
      {/* Title — fixed region */}
      <div className="shrink-0">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground text-center mb-1 leading-tight">
          {sted.tittel}
        </h2>

        {sted.dato && (
          <p className="text-center text-muted-foreground font-body text-sm mb-3">
            {sted.by && `${sted.by}, `}{sted.land && `${sted.land} · `}{sted.dato}
          </p>
        )}
      </div>

      {/* Main photo — fixed aspect ratio */}
      <div className="shrink-0">
        {hovedbilde ? (
          <div className="photo-frame tape-decoration mx-auto mb-3 max-w-xs w-full">
            <img
              src={hovedbilde}
              alt={sted.tittel}
              className="w-full rounded-sm object-cover aspect-[4/3]"
            />
          </div>
        ) : (
          <div className="photo-frame mx-auto mb-3 max-w-xs w-full flex items-center justify-center aspect-[4/3] bg-muted rounded-sm">
            <span className="text-muted-foreground font-body text-sm">Ingen bilder</span>
          </div>
        )}
      </div>

      {/* Gallery — fixed region */}
      {sted.bilder.length > 1 && (
        <div className="shrink-0 mb-2">
          <BildeGalleri bilder={sted.bilder} tittel={sted.tittel} />
        </div>
      )}

      {/* Scrollable description area — takes remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {sted.beskrivelse && (
          <p className="font-body text-foreground text-sm md:text-base leading-relaxed mb-3">
            {sted.beskrivelse}
          </p>
        )}

        {sted.morsom_fakta && <MorsomFakta tekst={sted.morsom_fakta} />}
      </div>
    </div>
  );
}
