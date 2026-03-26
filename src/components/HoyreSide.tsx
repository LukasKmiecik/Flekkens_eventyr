import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Sted } from '@/types/sted';

interface Props {
  steder: Sted[];
  aktivtSted: Sted;
  onVelgSted: (index: number) => void;
}

export default function HoyreSide({ steder, aktivtSted, onVelgSted }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const stederMedKoord = steder.filter(s => s.breddegrad != null && s.lengdegrad != null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Custom marker icons
    const defaultIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:24px;height:24px;background:hsl(0,60%,45%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const activeIcon = L.divIcon({
      className: 'custom-marker-active',
      html: `<div style="width:32px;height:32px;background:hsl(15,60%,50%);border:4px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.4);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add markers
    const sortedWithCoords = [...stederMedKoord].sort((a, b) => a.rekkefolge - b.rekkefolge);

    sortedWithCoords.forEach((s) => {
      const isActive = s.id === aktivtSted.id;
      const marker = L.marker([s.breddegrad!, s.lengdegrad!], {
        icon: isActive ? activeIcon : defaultIcon,
        zIndexOffset: isActive ? 1000 : 0,
      }).addTo(map);

      marker.bindTooltip(s.tittel, {
        permanent: false,
        direction: 'top',
        offset: [0, -14],
        className: 'font-body',
      });

      marker.on('click', () => {
        const idx = steder.findIndex(st => st.id === s.id);
        if (idx >= 0) onVelgSted(idx);
      });
    });

    // Draw route
    if (sortedWithCoords.length >= 2) {
      const routeCoords: L.LatLngExpression[] = sortedWithCoords.map(s => [s.breddegrad!, s.lengdegrad!]);
      L.polyline(routeCoords, {
        color: 'hsl(30, 80%, 50%)',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.8,
      }).addTo(map);
    }

    // Fit bounds
    if (aktivtSted.breddegrad != null && aktivtSted.lengdegrad != null) {
      map.setView([aktivtSted.breddegrad, aktivtSted.lengdegrad], 7);
    } else if (stederMedKoord.length > 0) {
      const bounds = L.latLngBounds(stederMedKoord.map(s => [s.breddegrad!, s.lengdegrad!]));
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([55, 10], 4);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [aktivtSted.id]);

  return (
    <div className="book-page h-full flex flex-col p-2 md:p-4">
      <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-2">Reiserute</h3>
      <div ref={mapRef} className="flex-1 rounded-lg overflow-hidden border-2 border-border min-h-[250px]" />
      {stederMedKoord.length === 0 && (
        <p className="text-center text-muted-foreground font-body text-sm mt-2">
          Ingen steder med koordinater ennå.
        </p>
      )}
    </div>
  );
}
