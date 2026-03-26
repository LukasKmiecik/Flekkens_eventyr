import { useEffect, useMemo, useState } from "react";
import type { Sted } from "@/types/sted";
import BildeGalleri from "./BildeGalleri";
import MorsomFakta from "./MorsomFakta";

interface Props {
  sted: Sted;
}

const BASE = import.meta.env.BASE_URL;

export default function VenstreSide({ sted }: Props) {
  const startIndex = useMemo(() => {
    if (!sted.bilder.length) return 0;
    if (!sted.forsidebilde) return 0;

    const found = sted.bilder.findIndex((bilde) => bilde === sted.forsidebilde);
    return found >= 0 ? found : 0;
  }, [sted]);

  const [valgtBildeIndex, setValgtBildeIndex] = useState(startIndex);

  useEffect(() => {
    setValgtBildeIndex(startIndex);
  }, [startIndex, sted.id]);

  const valgtBilde =
    sted.bilder.length > 0 ? `${BASE}${sted.bilder[valgtBildeIndex]}` : null;

  return (
    <div className="book-page flex flex-col h-full p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="shrink-0">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground text-center mb-1 leading-tight">
          {sted.tittel}
        </h2>

        {(sted.dato || sted.by || sted.land) && (
          <p className="text-center text-muted-foreground font-body text-sm mb-3">
            {sted.by ? `${sted.by}` : ""}
            {sted.by && sted.land ? ", " : ""}
            {sted.land ? `${sted.land}` : ""}
            {(sted.by || sted.land) && sted.dato ? " · " : ""}
            {sted.dato ? sted.dato : ""}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {valgtBilde ? (
          <div className="photo-frame tape-decoration mx-auto mb-3 max-w-xs w-full">
            <img
              src={valgtBilde}
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

      <div className="shrink-0 mb-2">
        <BildeGalleri
          bilder={sted.bilder}
          tittel={sted.tittel}
          valgtIndex={valgtBildeIndex}
          onVelg={setValgtBildeIndex}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {sted.beskrivelse ? (
          <p className="font-body text-foreground text-sm md:text-base leading-relaxed mb-3">
            {sted.beskrivelse}
          </p>
        ) : (
          <p className="font-body text-muted-foreground text-sm md:text-base mb-3">
            Ingen beskrivelse.
          </p>
        )}

        {sted.morsom_fakta && <MorsomFakta tekst={sted.morsom_fakta} />}
      </div>
    </div>
  );
}
