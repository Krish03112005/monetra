import { FontAwesome6 } from "@expo/vector-icons";
import type {
  Control,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";

import CustomButton from "@/components/custom_button";
import type { SignInFormValues } from "@/lib/schemas/auth";

type SignInFormProps = {
  control: Control<SignInFormValues>;
  formErrors: FieldErrors<SignInFormValues>;
  handleSubmit: UseFormHandleSubmit<SignInFormValues>;
  isLoading: boolean;
  passwordError: boolean;
  onSubmit: SubmitHandler<SignInFormValues>;
  onGoogleSignIn: () => void;
  onNavigateToSignUp: () => void;
};

export default function SignInForm({
  control,
  formErrors,
  handleSubmit,
  isLoading,
  passwordError,
  onSubmit,
  onGoogleSignIn,
  onNavigateToSignUp,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      className="rounded-3xl bg-white p-6"
      style={{ boxShadow: "0 10px 30px rgba(0,74,16,0.3)" }}
    >
      <Text className="text-3xl font-bold text-center text-[#1A1D26] mb-8">
        Welcome to Monetra{"\n"}Login now!
      </Text>

      <Text className="font-bold text-base mb-2 text-[#1A1D26]">Email</Text>
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
          onPress={() => setShowPassword((current) => !current)}
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

      <CustomButton
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        title="Sign In"
        className="w-full bg-[#B1FF90] py-4 rounded-full items-center justify-center mt-4 mb-6"
        style={{ boxShadow: "0 3px 16px rgba(0,74,16,0.2)" }}
      />
      <CustomButton
        onPress={onGoogleSignIn}
        isLoading={isLoading}
        title="Continue with Google"
        className="w-full bg-[#1F2326] py-4 rounded-full items-center justify-center mt-2 mb-4 flex-row"
        textClassName="ml-4 text-white font-semibold text-base"
        loadingColor="#FFFFFF"
        icon={
          <Image
            source={require("../assets/images/google-icon.png")}
            className="w-6 h-6"
            resizeMode="contain"
          />
        }
        style={{ boxShadow: "0 3px 8px rgba(0,0,0,0.15)" }}
      />
      <View className="flex-row justify-center mt-2 mb-4">
        <Text className="text-brand-text-muted">Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={onNavigateToSignUp}>
          <Text className="text-brand-blue font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View nativeID="clerk-captcha" />
    </View>
  );
}
