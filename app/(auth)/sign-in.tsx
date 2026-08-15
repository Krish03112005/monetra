import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { codeSchema, SignInFormValues, signInSchema } from "@/lib/schemas/auth";
import { FontAwesome6 } from "@expo/vector-icons";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const [switching, setSwitching] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState(false);

  

  // Sign-in form
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // OTP form
  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });

  // -----------------------------
  // FINALIZE SIGN IN
  // -----------------------------
  const finalizeSignIn = async () => {
    if (signIn.status !== "complete") {
      console.error("Sign-in is not complete:", signIn.status);
      return;
    }

    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log("Current session task:", session.currentTask);
          return;
        }

        const url = decorateUrl("/");

        console.log("Navigating to:", url);

        router.replace(url as any);
      },
    });
  };

  // -----------------------------
  // SIGN IN
  // -----------------------------
  const onSignInPress = async (values: SignInFormValues) => {
  setPasswordError(false);

  const { error } = await signIn.password({
    emailAddress: values.email,
    password: values.password,
  });

  if (error) {
    setPasswordError(true);
    return;
  }

  console.log("Sign-in status:", signIn.status);

  if (signIn.status === "complete") {
    await finalizeSignIn();
    return;
  }

  if (signIn.status === "needs_second_factor") {
    await signIn.mfa.sendPhoneCode();
    return;
  }

  if (signIn.status === "needs_client_trust") {
    const emailCodeFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "email_code"
    );

    if (emailCodeFactor) {
      await signIn.mfa.sendEmailCode();
      return;
    }

    console.error("No email verification factor available.");
  }
};

  // -----------------------------
  // VERIFY OTP
  // -----------------------------
  const onVerifyPress = async ({ code }: { code: string }) => {
    console.log("OTP entered:", code);

    const { error } = await signIn.mfa.verifyEmailCode({
      code,
    });

    if (error) {
      console.error("OTP VERIFICATION ERROR:", JSON.stringify(error, null, 2));
      return;
    }

    console.log("OTP verified");
    console.log("Sign-in status:", signIn.status);

    if (signIn.status === "complete") {
      await finalizeSignIn();
    } else {
      console.error("Sign-in attempt not complete:", signIn.status);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      const anySignIn = signIn as any;

      const ssoMethod =
        anySignIn.sso ||
        anySignIn.redirectToProvider ||
        anySignIn.redirectToOAuth ||
        anySignIn.startOAuth ||
        anySignIn.openOAuth;

      if (typeof ssoMethod === "function") {
        await ssoMethod.call(anySignIn, { provider: "google" });
        return;
      }

      console.warn(
        "No Clerk SSO method available on signIn object. Check Clerk SDK docs.",
        signIn,
      );
    } catch (err) {
      console.error("Google SSO error:", err);
    }
  };

  // -----------------------------
  // OTP SCREEN
  // -----------------------------
  if (
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor"
  ) {
    return (
      <LinearGradient
        colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#004A10"]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingVertical: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require("../../assets/images/Monetra-onboarding-logo.png")}
              className="w-40 h-40 self-center"
              resizeMode="contain"
            />

            <View
              className="rounded-3xl bg-white p-6"
              style={{
                boxShadow: "0 10px 30px rgba(0,74,16,0.3)",
              }}
            >
              <Text className="text-3xl font-bold text-center text-[#1A1D26] mb-2">
                Verify your account
              </Text>

              <Text className="text-brand-text-muted text-center text-base mb-8">
                Enter the verification code sent to you.
              </Text>

              <Text className="font-bold text-base mb-2 text-[#1A1D26]">
                Verification Code
              </Text>

              <Controller
                control={codeControl}
                name="code"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={(text) => {
                      setPasswordError(false);
                      onChange(text);
                    }}
                    placeholder="Enter verification code"
                    placeholderTextColor="#8A8D96"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="bg-[#F1F1F1] rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                  />
                )}
              />

              {codeErrors.code && (
                <Text className="text-brand-coral mb-3 text-sm">
                  {codeErrors.code.message}
                </Text>
              )}

              {errors.fields.code && (
                <Text className="text-brand-coral mb-3 text-sm">
                  {errors.fields.code.message}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleCodeSubmit(onVerifyPress)}
                disabled={isLoading}
                className="w-full bg-[#B1FF90] py-4 rounded-full items-center mt-4 mb-4"
              >
                {isLoading ? (
                  <ActivityIndicator color="#004A10" />
                ) : (
                  <Text className="text-[#004A10] font-bold text-xl">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => signIn.mfa.sendEmailCode()}
                className="py-2"
              >
                <Text className="text-center text-brand-blue text-sm font-medium">
                  I need a new code
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  // -----------------------------
  // SIGN IN SCREEN
  // -----------------------------
  return (
    <LinearGradient
      colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#004A10"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/images/Monetra-onboarding-logo.png")}
            className="w-40 h-40"
            style={{ alignSelf: "flex-start" }}
            resizeMode="contain"
          />

          <View
            className="rounded-3xl bg-white p-6"
            style={{
              boxShadow: "0 10px 30px rgba(0,74,16,0.3)",
            }}
          >
            <Text className="text-3xl font-bold text-center text-[#1A1D26] mb-8">
              Welcome to Monetra{"\n"}
              Login now!
            </Text>

            {/* <Text className="text-brand-text-muted text-center text-base mb-8">
              Welcome back — sign in to continue.
            </Text> */}

            {/* Email */}
            <Text className="font-bold text-base mb-2 text-[#1A1D26]">
              Email
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#8A8D96"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="bg-[#F1F1F1] rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                />
              )}
            />

            {formErrors.email && (
              <Text className="text-brand-coral mb-3 text-sm">
                {formErrors.email.message}
              </Text>
            )}

            {/* Password */}
            <Text className="font-bold text-base mb-2 mt-2 text-[#1A1D26]">
              Password
            </Text>
            <View className="relative justify-center mb-2">
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    className="bg-[#F1F1F1] rounded-xl px-4 py-3 pr-12 text-[#1A1D26]"
                    placeholder="••••••••••••"
                    placeholderTextColor="#8A8D96"
                    value={value}
                    onChangeText={(text) => {
                      setPasswordError(false);
                      onChange(text);
                    }}
                    secureTextEntry={!showPassword}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                className="absolute right-4"
                hitSlop={10}
              >
                <FontAwesome6 
                  name={showPassword ? "eye" : "eye-slash"}
                  size={18}
                  color="#1A1D26"
                />
              </TouchableOpacity>
            </View>
            {formErrors.password && (
              <Text className="text-brand-coral mb-3 text-sm">
                {formErrors.password.message}
              </Text>
            )}

            {passwordError && !formErrors.password && (
              <Text className="text-brand-coral mb-3 text-sm">
                Incorrect email or password. Please try again.
              </Text>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSignInPress)}
              disabled={isLoading}
              className="w-full bg-[#B1FF90] py-4 rounded-full items-center mt-4 mb-6"
              style={{
                boxShadow: "0 3px 16px rgba(0,74,16,0.2)",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#004A10" />
              ) : (
                <Text className="text-[#004A10] font-bold text-xl">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[#1F2326] py-4 rounded-full items-center mt-2 mb-4 flex-row justify-center"
              style={{
                boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              }}
            >
              <Image
                source={require("../../assets/images/google-icon.png")}
                className="w-6 h-6"
                resizeMode="contain"
              />

              <Text className="ml-4 text-white font-semibold text-base">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign Up */}
            <View className="flex-row justify-center mt-2 mb-4">
              <Text className="text-brand-text-muted">
                Don't have an account?{" "}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSwitching(true);
                  router.push("/sign-up");
                }}
              >
                <Text className="text-brand-blue font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Clerk CAPTCHA */}
            <View nativeID="clerk-captcha" />
            {switching && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
