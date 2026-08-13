import { codeSchema, SignUpFormValues, signUpSchema } from "@/lib/schemas/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [switching, setSwitching] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: { code: "" },
  });

  const onSignUpPress = async (values: SignUpFormValues) => {
    console.log("Password length:", values.password.length);

    setEmail(values.email);

    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error("CLERK ERROR:", JSON.stringify(error, null, 2));
      return;
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const onGoogleSignUp = async () => {
    try {
      const anySignUp = signUp as any;

      // Try common SSO/OAuth method names that Clerk SDKs might expose in Expo
      const ssoMethod =
        anySignUp.sso ||
        anySignUp.redirectToProvider ||
        anySignUp.redirectToOAuth ||
        anySignUp.startOAuth ||
        anySignUp.openOAuth;

      if (typeof ssoMethod === "function") {
        await ssoMethod.call(anySignUp, { provider: "google" });
        return;
      }

      console.warn("No Clerk SSO method available on signUp object. Check Clerk SDK docs.", signUp);
    } catch (err) {
      console.error("Google SSO error:", err);
    }
  };

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [otpError, setOtpError] = useState(false);

  {
    /* This is for OTP */
  }
  const onVerifyPress = async ({ code }: { code: string }) => {
    console.log("OTP entered:", code);

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (verifyError) {
      console.error("Email verification failed:", verifyError);
      setOtpError(true);
      return;
    }

    const { error: finalizeError } = await signUp.finalize();

    if (finalizeError) {
      console.error("Sign-up finalize failed:", finalizeError);
      return;
    }

    router.replace("/");
  };

  /// check for signup
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <LinearGradient
        colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#BDFE9B", "#004A10"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
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
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require("../../assets/images/Monetra-onboarding-logo.png")}
              className="w-40 h-40"
              resizeMode="contain"
            />

            <View
              className="rounded-3xl bg-white p-6"
              style={{ boxShadow: "0 8px 24px rgba(0,74,16,0.25)" }}
            >
              <Text className="text-2xl font-bold text-center text-[#1A1D26] mb-2">
                Verify your Account
              </Text>
              <Text className="text-sm text-center text-[#6B6B6B] mb-6">
                We sent a code to {email}
              </Text>

              <Text className="font-bold text-base mb-2 text-[#1A1D26]">
                Code
              </Text>
              <Controller
                control={codeControl}
                name="code"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row justify-between mb-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const isFocused = focusedIndex === index;

                      return (
                        <TextInput
                          key={index}
                          ref={(ref) => {
                            inputRefs.current[index] = ref;
                          }}
                          value={value[index] || ""}
                          onFocus={() => setFocusedIndex(index)}
                          onChangeText={(text) => {
                            const digit = text.replace(/[^0-9]/g, "").slice(-1);

                            const newCode = value.split("");

                            if (digit) {
                              newCode[index] = digit;
                            } else {
                              newCode[index] = "";
                            }

                            onChange(newCode.join(""));
                            setOtpError(false);

                            // Automatically move to next box
                            if (digit && index < 5) {
                              inputRefs.current[index + 1]?.focus();
                            }
                          }}
                          onKeyPress={({ nativeEvent }) => {
                            // Move back when pressing backspace on an empty box
                            if (
                              nativeEvent.key === "Backspace" &&
                              !value[index] &&
                              index > 0
                            ) {
                              inputRefs.current[index - 1]?.focus();
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={1}
                          className={`w-12 h-14 bg-[#F1F1F1] rounded-xl text-center text-xl font-bold ${
                            otpError
                              ? "border-2 border-red-500"
                              : isFocused
                                ? "border-2 border-[#004A10]"
                                : "border border-[#D1D1D1]"
                          }`}
                        />
                      );
                    })}
                  </View>
                )}
              />
              {codeErrors.code && (
                <Text className="text-brand-coral mb-2 text-sm">
                  {codeErrors.code.message}
                </Text>
              )}
              {errors.fields.code && (
                <Text className="text-brand-coral mb-2 text-sm">
                  {errors.fields.code.message}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleCodeSubmit(onVerifyPress)}
                disabled={isLoading}
                className="w-full bg-[#BDFE9B] py-4 rounded-full items-center mt-4 mb-3"
                style={{ boxShadow: "0 4px 10px rgba(0,74,16,0.25)" }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#004A10" />
                ) : (
                  <Text className="text-[#004A10] font-semibold text-lg">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => signUp.verifications.sendEmailCode()}
                className="py-2"
              >
                <Text className="text-center text-[#004A10] text-sm font-medium">
                  I need a new code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => signUp.reset()} className="py-2">
                <Text className="text-center text-[#6B6B6B] text-sm">
                  Start over
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
  return (
    <LinearGradient
      colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#BDFE9B", "#004A10"]}
      locations={[0, 0.25, 0.5, 0.75, 1]}
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
            resizeMode="contain"
          />

          <View
            className="rounded-3xl bg-white p-6"
            style={{ boxShadow: "0 10px 30px rgba(0,74,16,0.3)" }}
          >
            <Text className="text-3xl font-bold text-center text-[#1A1D26] mb-2">
              Create an Account?
            </Text>
            <Text className="text-brand-text-muted text-center text-base mb-8">
              Start you AI Finance journey with smart features.
            </Text>

            {/* First / Last name */}
            <Text className="font-bold text-base mb-2 text-[#1A1D26]">
              Name
            </Text>
            <View className="flex-row gap-3 mb-2">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    className="flex-1 bg-[#F1F1F1] rounded-xl px-4 py-3 text-[#1A1D26]"
                    placeholder="First name"
                    placeholderTextColor="#8A8D96"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    className="flex-1 bg-[#F1F1F1] rounded-xl px-4 py-3 text-[#1A1D26]"
                    placeholder="Last name"
                    placeholderTextColor="#8A8D96"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            {(formErrors.firstName || formErrors.lastName) && (
              <Text className="text-brand-coral mb-3 text-sm">
                {formErrors.firstName?.message || formErrors.lastName?.message}
              </Text>
            )}

            {/* Email */}
            <Text className="font-bold text-base mb-2 mt-2 text-[#1A1D26]">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  className="bg-[#F1F1F1] rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                  placeholder="example@gmail.com"
                  placeholderTextColor="#8A8D96"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {formErrors.email && (
              <Text className="text-brand-coral mb-3 text-sm">
                {formErrors.email.message}
              </Text>
            )}
            {errors.fields.emailAddress && (
              <Text className="text-brand-coral mb-3 text-sm">
                {errors.fields.emailAddress.message}
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
                    onChangeText={onChange}
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
            {errors.fields.password && (
              <Text className="text-brand-coral mb-3 text-sm">
                {errors.fields.password.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSignUpPress)}
              disabled={isLoading}
              className="w-full bg-[#B1FF90] py-4 rounded-full items-center mt-4 mb-6"
              style={{ boxShadow: "0 3px 16px rgba(0, 74, 16, 0.2)" }}
            >
              {isLoading ? (
                <ActivityIndicator color="#004A10" />
              ) : (
                <Text className="text-[#] font-bold text-xl">Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoogleSignUp}
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

            {/* <View className="flex-row items-center gap-3 mb-2">
              <View className="flex-1 h-[1px] bg-[#DADADA]" />
              <Text className="text-[#9A9A9A] text-sm">Or Sign-Up with</Text>
              <View className="flex-1 h-[1px] bg-[#DADADA]" />
            </View> */}

            <View className="flex-row justify-center mt-2 mb-4">
              <Text className="text-brand-text-muted">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSwitching(true);
                  router.push("/sign-in");
                }}
              >
                <Text className="text-brand-blue font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>

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
