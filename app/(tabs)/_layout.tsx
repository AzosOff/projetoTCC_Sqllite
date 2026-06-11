import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6c3ce0',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#1a1a2e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pacientes',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color }]}>🩺</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="agendamentos" 
        options={{
          title: 'Agendamentos',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color }]}>📅</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
});