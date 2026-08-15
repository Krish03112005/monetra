import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import SignInForm from "@/components/sign-in_form";
import { type SignInFormValues, signInSchema } from "@/lib/schemas/auth";

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const isLoading = fetchStatus === "fetching";
  const { control, handleSubmit, formState: { errors: formErrors } } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema), mode: "onBlur", defaultValues: { email: "", password: "" } });

  const finish = async () => {
    if (signIn.status === "complete") await signIn.finalize({ navigate: ({ session, decorateUrl }) => {
      if (!session?.currentTask) router.replace(decorateUrl("/") as never);
    }});
  };
  const onSubmit = async (values: SignInFormValues) => {
    setPasswordError(false);
    const { error } = await signIn.password({ emailAddress: values.email, password: values.password });
    if (error) return setPasswordError(true);
    if (signIn.status === "complete") await finish();
    else if (signIn.status === "needs_second_factor") await signIn.mfa.sendPhoneCode();
    else if (signIn.status === "needs_client_trust" && signIn.supportedSecondFactors.some((factor) => factor.strategy === "email_code")) await signIn.mfa.sendEmailCode();
  };
  const onGoogleSignIn = async () => {
    try {
      const currentSignIn = signIn as any;
      const method = currentSignIn.sso || currentSignIn.redirectToProvider || currentSignIn.redirectToOAuth || currentSignIn.startOAuth || currentSignIn.openOAuth;
      if (typeof method === "function") await method.call(currentSignIn, { provider: "google" });
    } catch (error) { console.error("Google SSO error:", error); }
  };

  return (
    <LinearGradient colors={["#F1FFEB", "#F1FFEB", "#BDFE9B", "#004A10"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <Image source={require("../../assets/images/Monetra-onboarding-logo.png")} className="w-40 h-40" style={{ alignSelf: "flex-start" }} resizeMode="contain" />
          <SignInForm control={control} formErrors={formErrors} handleSubmit={handleSubmit} isLoading={isLoading} passwordError={passwordError} onSubmit={onSubmit} onGoogleSignIn={onGoogleSignIn} onNavigateToSignUp={() => { setSwitching(true); router.push("/sign-up"); }} />
          {switching && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#FFFFFF" /></View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
