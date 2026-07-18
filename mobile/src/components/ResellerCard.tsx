import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { RevendedoraComDistancia } from "@localizador/shared";
import { colors, radius, spacing } from "@/theme/tokens";

function buildRouteUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

interface ResellerCardProps {
  revendedora: RevendedoraComDistancia;
  posicao: number;
}

export function ResellerCard({ revendedora, posicao }: ResellerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{posicao}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{revendedora.nome}</Text>
          <Text style={styles.endereco}>
            {revendedora.rua}, {revendedora.numero} - {revendedora.bairro},{" "}
            {revendedora.cidade}/{revendedora.estado}
          </Text>
          <Text style={styles.cep}>CEP {revendedora.cep}</Text>
        </View>
      </View>

      <View style={styles.aside}>
        <Text style={styles.distancia}>
          {revendedora.distanciaKm.toFixed(1)} km
        </Text>
        <Pressable
          onPress={() =>
            Linking.openURL(buildRouteUrl(revendedora.lat, revendedora.lng))
          }
          accessibilityRole="link"
          accessibilityLabel={`Ver rota até ${revendedora.nome} no Google Maps`}
          style={({ pressed }) => [
            styles.routeButton,
            pressed && styles.routeButtonPressed,
          ]}
        >
          <Text style={styles.routeButtonText}>Ver rota</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.onyxSoft,
    borderWidth: 1,
    borderColor: colors.onyxLine,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  main: {
    flexDirection: "row",
    gap: spacing.md,
    flex: 1,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.onyx,
    fontWeight: "700",
    fontSize: 13,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nome: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15,
  },
  endereco: {
    color: colors.foregroundMuted,
    fontSize: 13,
  },
  cep: {
    color: colors.foregroundMuted,
    fontSize: 13,
  },
  aside: {
    alignItems: "flex-end",
    gap: spacing.sm,
    justifyContent: "center",
  },
  distancia: {
    color: colors.goldLight,
    fontWeight: "700",
    fontSize: 13,
  },
  routeButton: {
    borderWidth: 1,
    borderColor: "rgba(217, 164, 65, 0.5)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  routeButtonPressed: {
    borderColor: colors.gold,
    backgroundColor: "rgba(217, 164, 65, 0.1)",
  },
  routeButtonText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: "600",
  },
});
