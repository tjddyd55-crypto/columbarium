import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Layout } from '../components/Layout';
import { UnitGrid } from '../components/UnitGrid';
import { Button } from '../components/Button';
import { useUnits } from '../hooks/useUnits';
import { useJoinQueue } from '../hooks/useJoinQueue';
import { Loading } from '../components/Loading';
import type { Unit } from '../types/api';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'UnitSelection'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'UnitSelection'>;

export default function UnitSelectionScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { data: units, isLoading } = useUnits(params.facilityId);
  const joinQueue = useJoinQueue();
  const [selected, setSelected] = useState<Unit | null>(null);

  const handleSelectUnit = (unit: Unit) => {
    setSelected(unit);
  };

  const handleJoinQueue = async () => {
    if (!selected) return;
    if (selected.status === 'CONTRACTED' || selected.status === 'BLOCKED') {
      Toast.show({ type: 'error', text1: '해당 칸은 대기열 참여가 불가합니다.' });
      return;
    }
    joinQueue.mutate(selected.id, {
      onSuccess: (data) => {
        Toast.show({ type: 'success', text1: '대기열에 참여했습니다.' });
        setSelected(null);
        navigation.navigate('QueueDetail', { queueEntryId: data.id });
      },
      onError: (e: any) => {
        Toast.show({ type: 'error', text1: e?.message ?? '대기열 참여에 실패했습니다.' });
      },
    });
  };

  if (isLoading) return <Loading />;
  const list = units ?? [];

  return (
    <Layout scroll padded safe>
      <UnitGrid units={list} onSelectUnit={handleSelectUnit} />
      {selected ? (
        <View style={styles.selected}>
          <Text style={styles.selectedTitle}>선택 칸: {selected.unitCode}</Text>
          <Text style={styles.selectedPrice}>분양가 {selected.basePrice?.toLocaleString?.() ?? selected.basePrice}원</Text>
          <Button
            title="대기열 참여"
            onPress={handleJoinQueue}
            loading={joinQueue.isPending}
            disabled={selected.status === 'CONTRACTED' || selected.status === 'BLOCKED'}
          />
        </View>
      ) : (
        <Text style={styles.hint}>칸을 탭하면 대기열 참여가 가능합니다.</Text>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  selected: { marginTop: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 10 },
  selectedTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  selectedPrice: { fontSize: 16, marginBottom: 16 },
  hint: { marginTop: 16, fontSize: 14, color: '#64748b', textAlign: 'center' },
});
