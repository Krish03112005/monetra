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
import type { SignUpFormValues } from "@/lib/schemas/auth";

type SignUpFormProps = {
  control: Control<SignUpFormValues>;
  formErrors: FieldErrors<SignUpFormValues>;
  handleSubmit: UseFormHandleSubmit<SignUpFormValues>;
  isLoading: boolean;
  emailError?: string;
  passwordError?: string;
  onSubmit: SubmitHandler<SignUpFormValues>;
  onGoogleSignUp: () => void;
  onNavigateToSignIn: () => void;
};

export default function SignUpForm({
  control,
  formErrors,
  handleSubmit,
  isLoading,
  emailError,
  passwordError,
  onSubmit,
  onGoogleSignUp,
  onNavigateToSignIn,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
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

      <Text className="font-bold text-base mb-2 text-[#1A1D26]">Name</Text>
      <View className="flex-row gap-3 mb-2">
        <Controller control={control} name="firstName" render={({ field: { value, onChange } }) => (
          <TextInput className="flex-1 bg-[#F1F1F1] rounded-xl px-4 py-3 text-[#1A1D26]" placeholder="First name" placeholderTextColor="#8A8D96" value={value} onChangeText={onChange} autoCapitalize="words" />
        )} />
        <Controller control={control} name="lastName" render={({ field: { value, onChange } }) => (
          <TextInput className="flex-1 bg-[#F1F1F1] rounded-xl px-4 py-3 text-[#1A1D26]" placeholder="Last name" placeholderTextColor="#8A8D96" value={value} onChangeText={onChange} autoCapitalize="words" />
        )} />
      </View>
      {(formErrors.firstName || formErrors.lastName) && <Text className="text-brand-coral mb-3 text-sm">{formErrors.firstName?.message || formErrors.lastName?.message}</Text>}

      <Text className="font-bold text-base mb-2 mt-2 text-[#1A1D26]">Email</Text>
      <Controller control={control} name="email" render={({ field: { value, onChange } }) => (
        <TextInput className="bg-[#F1F1F1] rounded-xl px-4 py-3 mb-2 text-[#1A1D26]" placeholder="example@gmail.com" placeholderTextColor="#8A8D96" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" />
      )} />
      {formErrors.email && <Text className="text-brand-coral mb-3 text-sm">{formErrors.email.message}</Text>}
      {emailError && <Text className="text-brand-coral mb-3 text-sm">{emailError}</Text>}

      <Text className="font-bold text-base mb-2 mt-2 text-[#1A1D26]">Password</Text>
      <View className="relative justify-center mb-2">
        <Controller control={control} name="password" render={({ field: { value, onChange } }) => (
          <TextInput className="bg-[#F1F1F1] rounded-xl px-4 py-3 pr-12 text-[#1A1D26]" placeholder="••••••••••••" placeholderTextColor="#8A8D96" value={value} onChangeText={onChange} secureTextEntry={!showPassword} />
        )} />
        <TouchableOpacity onPress={() => setShowPassword((current) => !current)} className="absolute right-4" hitSlop={10}>
          <FontAwesome6 name={showPassword ? "eye" : "eye-slash"} size={18} color="#1A1D26" />
        </TouchableOpacity>
      </View>
      {formErrors.password && <Text className="text-brand-coral mb-3 text-sm">{formErrors.password.message}</Text>}
      {passwordError && <Text className="text-brand-coral mb-3 text-sm">{passwordError}</Text>}

      <CustomButton onPress={handleSubmit(onSubmit)} isLoading={isLoading} title="Sign Up" className="w-full bg-[#B1FF90] py-4 rounded-full items-center justify-center mt-4 mb-4" style={{ boxShadow: "0 3px 16px rgba(0, 74, 16, 0.2)" }} />
      <View className="flex-row justify-center mb-6">
        <Text className="text-brand-text-muted">Already have an account? </Text>
        <TouchableOpacity onPress={onNavigateToSignIn}><Text className="text-brand-blue font-semibold">Sign In</Text></TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-3 mb-2"><View className="flex-1 h-[1px] bg-[#DADADA]" /><Text className="text-[#9A9A9A] text-sm">Or Sign up with</Text><View className="flex-1 h-[1px] bg-[#DADADA]" /></View>
      <CustomButton onPress={onGoogleSignUp} isLoading={isLoading} title="Continue with Google" className="w-full bg-[#1F2326] py-4 rounded-full items-center justify-center mt-2 flex-row" textClassName="ml-4 text-white font-semibold text-base" loadingColor="#FFFFFF" icon={<Image source={require("../assets/images/google-icon.png")} className="w-6 h-6" resizeMode="contain" />} style={{ boxShadow: "0 3px 8px rgba(0,0,0,0.15)" }} />
      <View nativeID="clerk-captcha" />
    </View>
  );
}
