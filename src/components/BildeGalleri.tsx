const BASE = import.meta.env.BASE_URL;

interface Props {
  bilder: string[];
  tittel: string;
  valgtIndex: number;
  onVelg: (index: number) => void;
}

export default function BildeGalleri({ bilder, tittel, valgtIndex, onVelg }: Props) {
  if (bilder.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
      {bilder.map((bilde, index) => (
        <button
          key={bilde}
          type="button"
          onClick={() => onVelg(index)}
          className={`flex-shrink-0 w-14 h-14 rounded-sm overflow-hidden border-2 transition-all ${
            index === valgtIndex
              ? "border-accent scale-105"
              : "border-border opacity-70 hover:opacity-100"
          }`}
          aria-label={`Velg bilde ${index + 1} for ${tittel}`}
        >
          <img
            src={`${BASE}${bilde}`}
            alt={`${tittel} ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}
