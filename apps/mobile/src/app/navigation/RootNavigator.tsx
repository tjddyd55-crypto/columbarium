import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import UnitSelectionScreen from '../screens/UnitSelectionScreen';
import QueueDetailScreen from '../screens/QueueDetailScreen';
import ContractScreen from '../screens/ContractScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FacilityDetail: { facilityId: string };
  UnitSelection: { facilityId: string };
  QueueDetail: { queueEntryId: string };
  Contract: { unitId: string; queueEntryId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, hydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  if (!hydrated) return null;

  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: '뒤로' }}>
      {!token ? (
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} options={{ title: '시설 상세' }} />
          <Stack.Screen name="UnitSelection" component={UnitSelectionScreen} options={{ title: '좌석 선택' }} />
          <Stack.Screen name="QueueDetail" component={QueueDetailScreen} options={{ title: '대기열 상세' }} />
          <Stack.Screen name="Contract" component={ContractScreen} options={{ title: '계약하기' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
