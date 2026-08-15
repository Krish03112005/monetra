import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import SignUpForm from "@/components/sign-up_form";
import { type SignUpFormValues, signUpSchema } from "@/lib/schemas/auth";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const isLoading = fetchStatus === "fetching";
  const { control, handleSubmit, formState: { errors: formErrors } } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema), mode: "onBlur", defaultValues: { firstName: "", lastName: "", email: "", password: "" } });
  const onSubmit = async (values: SignUpFormValues) => {
    const { error } = await signUp.password({ emailAddress: values.email, password: values.password, firstName: values.firstName, lastName: values.lastName });
    if (!error) await signUp.verifications.sendEmailCode();
  };
  const onGoogleSignUp = async () => {
    const currentSignUp = signUp as any;
    const method = currentSignUp.sso || currentSignUp.redirectToProvider || currentSignUp.redirectToOAuth || currentSignUp.startOAuth || currentSignUp.openOAuth;
    if (typeof method === "function") await method.call(currentSignUp, { provider: "google" });
  };
  if (isSignedIn || signUp.status === "complete") return null;
  return <LinearGradient colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#BDFE9B", "#004A10"]} locations={[0, .25, .5, .75, 1]} style={{ flex: 1 }}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}><ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 }} keyboardShouldPersistTaps="handled"><Image source={require("../../assets/images/Monetra-onboarding-logo.png")} className="w-40 h-40" resizeMode="contain" /><SignUpForm control={control} formErrors={formErrors} handleSubmit={handleSubmit} isLoading={isLoading} emailError={errors.fields.emailAddress?.message} passwordError={errors.fields.password?.message} onSubmit={onSubmit} onGoogleSignUp={onGoogleSignUp} onNavigateToSignIn={() => { setSwitching(true); router.push("/sign-in"); }} />{switching && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#FFFFFF" /></View>}</ScrollView></KeyboardAvoidingView></LinearGradient>;
}
