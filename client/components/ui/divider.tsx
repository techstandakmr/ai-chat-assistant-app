import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

type DividerProps = {
  height?: number;
  opacity?: number;
  marginVertical?: number;
};

export default function Divider({
  height = 1,
  opacity = 0.6,
  marginVertical = 0,
}: DividerProps) {
  return (
    <ThemedView
      style={{
        height,
        backgroundColor: Colors.dark.border,
        opacity,
        marginVertical,
        width: "100%",
      }}
    />
  );
}
