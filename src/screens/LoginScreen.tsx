import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const APP_LOGO = require("../../assets/logo.png");
import { FadeIn } from "../components/FadeIn";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { colors } from "../theme";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRef = useRef<TextInput>(null);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.sendOtp(email.toLowerCase().trim());
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch {
      setError("Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api.verifyOtp(email.toLowerCase().trim(), otp);
      login(result.user);
    } catch {
      setError("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Logo */}
        <FadeIn direction="down" duration={600} style={styles.logoContainer}>
          <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.appName}>Drink Now</Text>
          <Text style={styles.tagline}>
            {step === "email"
              ? "Sign in to save your favorites and preferences"
              : `We sent a code to ${email}`}
          </Text>
        </FadeIn>

        {/* Email step */}
        {step === "email" && (
          <FadeIn direction="up" duration={500} delay={200} style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.primaryLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={handleSendOtp}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Continue</Text>
              )}
            </TouchableOpacity>
          </FadeIn>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <FadeIn direction="up" duration={500} style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color={colors.primaryLight} />
              <TextInput
                ref={otpRef}
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                value={otp}
                onChangeText={(t) => { setOtp(t.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOtp}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => { setStep("email"); setOtp(""); setError(""); }}
            >
              <Text style={styles.backText}>Use a different email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
          </FadeIn>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 22,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    lineHeight: 34,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 10,
    textAlign: "center",
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  error: {
    color: colors.accent,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
