import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { SearchInput } from "@localizador/shared";
import { BrandHeader } from "@/components/BrandHeader";
import { SearchForm } from "@/components/SearchForm";
import { colors, spacing } from "@/theme/tokens";

export default function BuscaScreen() {
  function handleSubmit(input: SearchInput) {
    router.push({
      pathname: "/resultados",
      params: {
        ...(input.cep ? { cep: input.cep } : {}),
        ...(input.rua ? { rua: input.rua } : {}),
        ...(input.numero ? { numero: input.numero } : {}),
        ...(input.bairro ? { bairro: input.bairro } : {}),
        ...(input.cidade ? { cidade: input.cidade } : {}),
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Rede de Revendedoras</Text>
          <Text style={styles.title}>
            Encontre a revendedora{" "}
            <Text style={styles.titleAccent}>mais próxima de você</Text>
          </Text>
          <Text style={styles.subtitle}>
            Informe seu CEP, ou rua e bairro, e veja as revendedoras
            disponíveis na sua região, ordenadas por distância, com mapa e
            rota até cada uma delas.
          </Text>
        </View>

        <SearchForm onSubmit={handleSubmit} />

        <Text style={styles.footer}>
          Localizador de Revendedoras — identidade visual inspirada na
          Sorelly Joias.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.onyx,
  },
  scroll: {
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  hero: {
    gap: spacing.md,
    alignItems: "center",
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  title: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 28,
    lineHeight: 34,
    color: colors.foreground,
    textAlign: "center",
  },
  titleAccent: {
    color: colors.gold,
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    color: colors.foregroundFaint,
    fontSize: 11,
    textAlign: "center",
  },
});
