import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Sted } from "@/types/sted";

interface Props {
  steder: Sted[];
  aktivtSted: Sted;
  onVelgSted: (index: number) => void;
}

export default function HoyreSide({ steder, aktivtSted, onVelgSted }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const stederMedKoord = useMemo(
    () => steder.filter((s) => s.breddegrad != null && s.lengdegrad != null),
    [steder]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    if (stederMedKoord.length > 0) {
      const bounds = L.latLngBounds(
        stederMedKoord.map((s) => [s.breddegrad!, s.lengdegrad!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([55, 10], 4);
    }

    return () => {
      map.remove();
      mapInstance.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, [stederMedKoord]);

  useEffect(() => {
    const map = mapInstance.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const defaultIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="width:24px;height:24px;background:hsl(0,60%,45%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const activeIcon = L.divIcon({
      className: "custom-marker-active",
      html: `<div style="width:34px;height:34px;background:hsl(15,60%,50%);border:4px solid white;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.45);"></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const sortedWithCoords = [...stederMedKoord].sort((a, b) => {
      const aOrder = a.rekkefolge ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.rekkefolge ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.dato && b.dato && a.dato !== b.dato) return a.dato.localeCompare(b.dato);
      return a.tittel.localeCompare(b.tittel);
    });

    sortedWithCoords.forEach((s) => {
      const isActive = s.id === aktivtSted.id;

      const marker = L.marker([s.breddegrad!, s.lengdegrad!], {
        icon: isActive ? activeIcon : defaultIcon,
        zIndexOffset: isActive ? 1000 : 0,
      }).addTo(markersLayer);

      marker.bindTooltip(s.tittel, {
        permanent: false,
        direction: "top",
        offset: [0, -14],
        className: "font-body",
      });

      marker.on("click", () => {
        const idx = steder.findIndex((st) => st.id === s.id);
        if (idx >= 0) onVelgSted(idx);
      });
    });

    if (sortedWithCoords.length >= 2) {
      const routeCoords: L.LatLngExpression[] = sortedWithCoords.map((s) => [
        s.breddegrad!,
        s.lengdegrad!,
      ]);

      routeLayerRef.current = L.polyline(routeCoords, {
        color: "hsl(30, 80%, 50%)",
        weight: 3,
        dashArray: "8, 8",
        opacity: 0.8,
      }).addTo(map);
    }

    if (aktivtSted.breddegrad != null && aktivtSted.lengdegrad != null) {
      map.flyTo([aktivtSted.breddegrad, aktivtSted.lengdegrad], 10, {
        duration: 1.1,
      });
    } else if (stederMedKoord.length > 0) {
      const bounds = L.latLngBounds(
        stederMedKoord.map((s) => [s.breddegrad!, s.lengdegrad!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [steder, stederMedKoord, aktivtSted, onVelgSted]);

  return (
    <div className="book-page h-full flex flex-col p-3 md:p-4 lg:p-5">
      <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-2">
        Reiserute
      </h3>

      <div
        ref={mapRef}
        className="flex-1 rounded-lg overflow-hidden border-2 border-border min-h-[280px] md:min-h-[360px]"
      />

      {stederMedKoord.length === 0 && (
        <p className="text-center text-muted-foreground font-body text-sm mt-2">
          Ingen steder med koordinater ennå.
        </p>
      )}
    </div>
  );
}
