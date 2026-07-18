import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import type { SearchInput, SearchResponse } from "@localizador/shared";
import { BrandHeader } from "@/components/BrandHeader";
import { ResultsList } from "@/components/ResultsList";
import { MapView } from "@/components/MapView";
import { searchRevendedoras, SearchError } from "@/lib/api";
import { colors, spacing } from "@/theme/tokens";

function paramToString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function ResultadosScreen() {
  const params = useLocalSearchParams<{
    cep?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
  }>();

  const input: SearchInput = {
    cep: paramToString(params.cep),
    rua: paramToString(params.rua),
    numero: paramToString(params.numero),
    bairro: paramToString(params.bairro),
    cidade: paramToString(params.cidade),
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchRevendedoras(input);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof SearchError
              ? err.message
              : "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.cep, params.rua, params.numero, params.bairro, params.cidade]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader backHref="/" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Resultados da busca</Text>

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>
              Buscando revendedoras mais próximas...
            </Text>
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading && result && (
          <>
            <Text style={styles.addressLabel}>
              Endereço encontrado:{" "}
              <Text style={styles.addressValue}>
                {result.enderecoResolvido.label}
              </Text>
            </Text>

            <MapView
              userLocation={result.enderecoResolvido}
              revendedoras={result.resultados}
            />

            <ResultsList resultados={result.resultados} />
          </>
        )}
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
    gap: spacing.lg,
  },
  heading: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 22,
    color: colors.foreground,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.foregroundMuted,
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "rgba(127, 29, 29, 0.5)",
    backgroundColor: "rgba(127, 29, 29, 0.2)",
    borderRadius: 8,
    padding: spacing.lg,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
  },
  addressLabel: {
    color: colors.foregroundMuted,
    fontSize: 13,
  },
  addressValue: {
    color: colors.goldLight,
    fontWeight: "600",
  },
});
