import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Link } from "expo-router";
import { colors, spacing } from "@/theme/tokens";

interface BrandHeaderProps {
  backHref?: "/";
  backLabel?: string;
}

function CrownMark() {
  return (
    <Svg width={18} height={15} viewBox="0 0 24 20" fill={colors.gold}>
      <Path d="M2 7 6 10 12 3 18 10 22 7 20 17H4L2 7Z" />
      <Circle cx={2} cy={6} r={1.6} />
      <Circle cx={12} cy={2} r={1.6} />
      <Circle cx={22} cy={6} r={1.6} />
    </Svg>
  );
}

export function BrandHeader({ backHref, backLabel }: BrandHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.wordmarkRow}>
          <CrownMark />
          <Text style={styles.wordmark}>SORELLY</Text>
        </View>
        <Text style={styles.subtitle}>Localizador de Revendedoras</Text>
      </View>

      {backHref && (
        <Link href={backHref} style={styles.backLink}>
          {backLabel ?? "← Nova busca"}
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.onyxLine,
  },
  brand: {
    gap: 4,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  wordmark: {
    color: colors.gold,
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 18,
    letterSpacing: 3,
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  backLink: {
    color: colors.goldLight,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
