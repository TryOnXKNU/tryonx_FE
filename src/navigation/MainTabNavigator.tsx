import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

type TabItem = {
  name: string;
  component: React.ComponentType<any>;
  label: string;
  icon: string;
};

type MainTabNavigatorProps = {
  tabs: TabItem[];
  theme?: {
    activeColor?: string;
    inactiveColor?: string;
    backgroundColor?: string;
  };
};

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({
  tabs,
  theme = {
    activeColor: '#000',
    inactiveColor: '#aaa',
    backgroundColor: '#fff',
  },
}: MainTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<Record<string, object | undefined>, string>;
      }): BottomTabNavigationOptions => {
        const tab = tabs.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: theme.activeColor,
          tabBarInactiveTintColor: theme.inactiveColor,
          tabBarStyle: [
            styles.tabBar,
            { backgroundColor: theme.backgroundColor },
          ],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Icon
                name={tab?.icon || 'ellipse-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        };
      }}
    >
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ tabBarLabel: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 86,
    paddingBottom: 10,
    paddingTop: 5,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
  },
});
