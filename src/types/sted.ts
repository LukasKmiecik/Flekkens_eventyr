export interface Sted {
  id: string;
  mappe: string;
  tittel: string;
  land: string | null;
  by: string | null;
  sted: string | null;
  dato: string | null;
  beskrivelse: string | null;
  morsom_fakta: string | null;
  breddegrad: number | null;
  lengdegrad: number | null;
  rekkefolge: number | null;
  forsidebilde: string | null;
  bilder: string[];
}
