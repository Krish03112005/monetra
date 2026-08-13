import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {

  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter()

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1 justify-center bg-brand-body px-5 pt-4"
      edges={["top"]}
    >
      <TouchableOpacity
        className="w-full bg-white border border-[#E8E6DF] rounded-2xl py-4 items-center"
      >
        <Text className="text-brand-coral font-semibold text-base"
          onPress={handleSignOut}
        >
          Log Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
