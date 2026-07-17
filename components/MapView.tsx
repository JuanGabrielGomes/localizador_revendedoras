"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RevendedoraComDistancia } from "@/lib/types";

const revendedoraIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#2563eb;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapViewProps {
  userLocation: { lat: number; lng: number; label: string };
  revendedoras: RevendedoraComDistancia[];
}

function FitBounds({ userLocation, revendedoras }: MapViewProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...revendedoras.map((r) => [r.lat, r.lng] as [number, number]),
    ];
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
  }, [map, userLocation, revendedoras]);

  return null;
}

export function MapView({ userLocation, revendedoras }: MapViewProps) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          Você está aqui
          <br />
          {userLocation.label}
        </Popup>
      </Marker>
      {revendedoras.map((revendedora) => (
        <Marker
          key={revendedora.id}
          position={[revendedora.lat, revendedora.lng]}
          icon={revendedoraIcon}
        >
          <Popup>
            <strong>{revendedora.nome}</strong>
            <br />
            {revendedora.rua}, {revendedora.numero} - {revendedora.bairro}
            <br />
            {revendedora.distanciaKm.toFixed(1)} km
          </Popup>
        </Marker>
      ))}
      <FitBounds userLocation={userLocation} revendedoras={revendedoras} />
    </MapContainer>
  );
}
