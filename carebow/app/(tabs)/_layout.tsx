import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.purple[600],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          height: 80 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask CareBow',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.askTabIconContainer}>
              <View style={[styles.askTabIcon, focused && styles.askTabIconActive]}>
                <Ionicons
                  name="heart"
                  size={24}
                  color={Colors.white}
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            color: Colors.purple[600],
            marginTop: 4,
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  askTabIconContainer: {
    position: 'relative',
    top: -8,
  },
  askTabIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.purple[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  askTabIconActive: {
    backgroundColor: Colors.purple[700],
    transform: [{ scale: 1.05 }],
  },
});
