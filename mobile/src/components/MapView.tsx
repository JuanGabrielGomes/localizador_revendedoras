import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { RevendedoraComDistancia } from "@localizador/shared";
import { colors, radius } from "@/theme/tokens";

interface MapViewProps {
  userLocation: { lat: number; lng: number; label: string };
  revendedoras: RevendedoraComDistancia[];
}

/**
 * Reaproveita o mesmo Leaflet/OpenStreetMap do app web (sem API key), rodando
 * dentro de uma WebView — não existe binding nativo de Leaflet para React
 * Native. Alternativa mais "nativa" seria `react-native-maps`, mas no Android
 * ele exige uma API key do Google Maps (billing no Google Cloud), o que
 * quebraria o princípio de "zero API key" seguido no projeto inteiro. Fica
 * documentado como possível evolução futura no README.
 */
function buildMapHtml({ userLocation, revendedoras }: MapViewProps): string {
  const points = revendedoras.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    nome: r.nome,
    endereco: `${r.rua}, ${r.numero} - ${r.bairro}`,
    distanciaKm: r.distanciaKm.toFixed(1),
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const userLocation = ${JSON.stringify(userLocation)};
    const points = ${JSON.stringify(points)};

    const map = L.map("map", { zoomControl: true }).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const userIcon = L.divIcon({
      className: "",
      html: '<div style="width:16px;height:16px;border-radius:9999px;background:#0b0b0d;border:3px solid #d9a441;box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const revendedoraIcon = L.divIcon({
      className: "",
      html: '<svg width="26" height="37" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#d9a441" stroke="#0b0b0d" stroke-width="1.5"/>' +
        '<circle cx="14" cy="14" r="5" fill="#0b0b0d"/></svg>',
      iconSize: [26, 37],
      iconAnchor: [13, 37],
    });

    const bounds = [[userLocation.lat, userLocation.lng]];

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("Você está aqui<br>" + userLocation.label);

    points.forEach((p) => {
      bounds.push([p.lat, p.lng]);
      L.marker([p.lat, p.lng], { icon: revendedoraIcon })
        .addTo(map)
        .bindPopup(
          "<strong>" + p.nome + "</strong><br>" + p.endereco + "<br>" + p.distanciaKm + " km"
        );
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }
  </script>
</body>
</html>`;
}

export function MapView(props: MapViewProps) {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildMapHtml(props) }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(217, 164, 65, 0.4)",
    overflow: "hidden",
    backgroundColor: colors.onyxSoft,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
