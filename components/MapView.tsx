"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RevendedoraComDistancia } from "@/lib/types";

const revendedoraIcon = new L.DivIcon({
  className: "",
  html: `
    <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#c9a227" stroke="#0b0b0d" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="#0b0b0d"/>
    </svg>
  `,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:18px;height:18px;border-radius:9999px;
      background:#0b0b0d;
      border:3px solid #c9a227;
      box-shadow:0 0 0 2px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
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
