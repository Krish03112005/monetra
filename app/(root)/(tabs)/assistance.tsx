import { View, Text, StyleSheet } from 'react-native';

export default function Assistance() {
  return (
    <View style={styles.container}>
      <Text>Assistance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
