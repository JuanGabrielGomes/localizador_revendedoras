import { FlatList, StyleSheet, Text, View } from "react-native";
import type { RevendedoraComDistancia } from "@localizador/shared";
import { colors, radius, spacing } from "@/theme/tokens";
import { ResellerCard } from "./ResellerCard";

interface ResultsListProps {
  resultados: RevendedoraComDistancia[];
}

export function ResultsList({ resultados }: ResultsListProps) {
  if (resultados.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Nenhuma revendedora ativa encontrada perto desse endereço.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={resultados}
      keyExtractor={(item) => String(item.id)}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => (
        <ResellerCard revendedora={item} posicao={index + 1} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(217, 164, 65, 0.3)",
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.foregroundMuted,
    textAlign: "center",
  },
});
