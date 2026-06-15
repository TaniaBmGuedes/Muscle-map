import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Accent colour used when the chip is active. */
  tone?: "type" | "muscle" | "tag";
};

const ACTIVE_TONE: Record<NonNullable<Props["tone"]>, string> = {
  type: "border-[#EA580C] bg-[#FFF7ED]",
  muscle: "border-[#2563EB] bg-[#EFF6FF]",
  tag: "border-[#059669] bg-[#ECFDF5]",
};

/** A rounded, toggleable filter pill used across the filter rows. */
export function FilterChip({ label, active, onPress, tone = "type" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-md border px-3.5 py-[7px] ${
        active ? ACTIVE_TONE[tone] : "border-[#E5E7EB] bg-white"
      }`}
    >
      <Text
        className={`text-[13px] font-semibold ${
          active ? "text-[#111827]" : "text-[#6B7280]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
