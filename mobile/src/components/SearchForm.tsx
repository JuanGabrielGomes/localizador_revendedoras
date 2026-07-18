import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import type { SearchInput } from "@localizador/shared";
import { colors, radius, spacing } from "@/theme/tokens";

const NOMINATIM_USER_AGENT =
  "localizador-revendedoras-mobile/1.0 (teste tecnico)";

/**
 * Geocodificação reversa (lat/lng -> bairro/cidade) feita direto pelo app,
 * sem passar pela nossa API — o back-end web não precisa saber que essa
 * funcionalidade existe, e continua exatamente como estava.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ bairro?: string; cidade?: string }> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": NOMINATIM_USER_AGENT, Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Falha na geocodificação reversa");

  const data = await response.json();
  const address = data.address ?? {};
  return {
    bairro: address.suburb || address.neighbourhood || address.city_district,
    cidade: address.city || address.town || address.municipality,
  };
}

interface SearchFormProps {
  onSubmit: (input: SearchInput) => void;
}

const exemplos: { label: string; input: SearchInput }[] = [
  { label: "CEP 80730-000 (Bigorrilho, Curitiba)", input: { cep: "80730-000" } },
  { label: "Centro, Curitiba", input: { bairro: "Centro", cidade: "Curitiba" } },
  { label: "Zona 01, Maringá", input: { bairro: "Zona 01", cidade: "Maringá" } },
];

export function SearchForm({ onSubmit }: SearchFormProps) {
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function handleSubmit() {
    const trimmedCep = cep.trim();
    const trimmedRua = rua.trim();
    const trimmedBairro = bairro.trim();

    if (!trimmedCep && !trimmedRua && !trimmedBairro) {
      setValidationError("Informe ao menos um CEP, rua ou bairro.");
      return;
    }
    setValidationError(null);

    onSubmit({
      cep: trimmedCep || undefined,
      rua: trimmedRua || undefined,
      numero: numero.trim() || undefined,
      bairro: trimmedBairro || undefined,
    });
  }

  function handleExemploPress(input: SearchInput) {
    setCep(input.cep ?? "");
    setRua(input.rua ?? "");
    setNumero(input.numero ?? "");
    setBairro(input.bairro ?? "");
    setValidationError(null);
    onSubmit(input);
  }

  async function handleUseCurrentLocation() {
    setValidationError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setValidationError(
          "Permissão de localização negada. Habilite nas configurações do app para usar esse recurso.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { bairro: bairroDetectado, cidade: cidadeDetectada } =
        await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude,
        );

      if (!bairroDetectado && !cidadeDetectada) {
        setValidationError(
          "Não foi possível identificar seu endereço automaticamente. Tente buscar manualmente.",
        );
        return;
      }

      setCep("");
      setRua("");
      setNumero("");
      setBairro(bairroDetectado ?? "");
      onSubmit({ bairro: bairroDetectado, cidade: cidadeDetectada });
    } catch {
      setValidationError("Não foi possível obter sua localização atual.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <View style={[styles.field, styles.fieldNarrow]}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={cep}
            onChangeText={setCep}
            placeholder="00000-000"
            placeholderTextColor={colors.foregroundFaint}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
        <View style={[styles.field, styles.fieldWide]}>
          <Text style={styles.label}>Rua ou avenida</Text>
          <TextInput
            value={rua}
            onChangeText={setRua}
            placeholder="Ex: Rua Padre Anchieta"
            placeholderTextColor={colors.foregroundFaint}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.fieldNarrow]}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            value={numero}
            onChangeText={setNumero}
            placeholder="Ex: 123"
            placeholderTextColor={colors.foregroundFaint}
            style={styles.input}
          />
        </View>
        <View style={[styles.field, styles.fieldWide]}>
          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={bairro}
            onChangeText={setBairro}
            placeholder="Ex: Bigorrilho"
            placeholderTextColor={colors.foregroundFaint}
            style={styles.input}
          />
        </View>
      </View>

      <Pressable
        onPress={handleUseCurrentLocation}
        disabled={locating}
        style={({ pressed }) => [
          styles.locationButton,
          pressed && styles.locationButtonPressed,
        ]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.goldLight} />
        ) : (
          <Text style={styles.locationButtonText}>
            Usar minha localização atual
          </Text>
        )}
      </Pressable>

      {validationError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {validationError}
        </Text>
      )}

      <Text style={styles.hint}>
        Preencha o CEP, ou rua e/ou bairro (quanto mais campos, mais precisa a
        busca).
      </Text>

      <View style={styles.chipsRow}>
        {exemplos.map((exemplo) => (
          <Pressable
            key={exemplo.label}
            onPress={() => handleExemploPress(exemplo.input)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <Text style={styles.chipText}>{exemplo.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
        ]}
      >
        <Text style={styles.submitLabel}>Buscar revendedoras</Text>
        <Text style={styles.submitArrow}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: colors.onyxSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.onyxLine,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldNarrow: {
    width: 110,
  },
  fieldWide: {
    flex: 1,
  },
  label: {
    color: colors.foreground,
    opacity: 0.8,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.onyxLine,
    backgroundColor: colors.onyx,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.foreground,
    fontSize: 14,
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "rgba(217, 164, 65, 0.4)",
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonPressed: {
    borderColor: colors.gold,
    backgroundColor: "rgba(217, 164, 65, 0.08)",
  },
  locationButtonText: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  hint: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.onyxLine,
    backgroundColor: colors.onyx,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipPressed: {
    borderColor: colors.gold,
  },
  chipText: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  submitButtonPressed: {
    backgroundColor: colors.goldLight,
  },
  submitLabel: {
    color: colors.onyx,
    fontWeight: "700",
    fontSize: 15,
  },
  submitArrow: {
    color: colors.onyx,
    fontWeight: "700",
    fontSize: 15,
  },
});
