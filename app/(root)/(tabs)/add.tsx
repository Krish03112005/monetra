import { View, Text, StyleSheet } from 'react-native';

export default function AddTransaction() {
  return (
    <View style={styles.container}>
      <Text>Add</Text>
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
