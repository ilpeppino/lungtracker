import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { supabase } from "../../services/supabase";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert("Signup failed", error.message);

    Alert.alert(
      "Account created",
      "If email confirmation is enabled in Supabase, confirm your email before logging in."
    );
    navigation.navigate("Login");
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Sign up</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <Button title="Create account" onPress={onSignup} />

      <Text onPress={() => navigation.navigate("Login")}>Already have an account? Login</Text>
    </View>
  );
}