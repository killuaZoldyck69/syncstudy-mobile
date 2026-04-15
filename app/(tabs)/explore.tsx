import { theme } from "@/constants/theme";
import { Text, View } from "react-native";
export default function ExploreScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white" }}>Explore</Text>
    </View>
  );
}
