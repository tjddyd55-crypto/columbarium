import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import FacilityListScreen from '../screens/FacilityListScreen';
import QueueScreen from '../screens/QueueScreen';
import ContractListScreen from '../screens/ContractListScreen';
import MyPageScreen from '../screens/MyPageScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Queue: undefined;
  Contract: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabLabel: Record<keyof MainTabParamList, string> = {
  Home: '홈',
  Search: '시설',
  Queue: '대기열',
  Contract: '내 계약',
  MyPage: '마이',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: tabLabel[route.name],
        headerTitle: tabLabel[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={FacilityListScreen} />
      <Tab.Screen name="Queue" component={QueueScreen} />
      <Tab.Screen name="Contract" component={ContractListScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
