import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useQueueDetail } from '../hooks/useQueueDetail';
import { useCancelQueue } from '../hooks/useCancelQueue';
import { useCreateContract } from '../hooks/useCreateContract';
import { Loading } from '../components/Loading';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'QueueDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'QueueDetail'>;

function useCountdown(expiresAt: string | null) {
  const [left, setLeft] = useState<string>('');
  useEffect(() => {
    if (!expiresAt) {
      setLeft('');
      return;
    }
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const now = Date.now();
      if (now >= end) {
        setLeft('만료됨');
        return;
      }
      const s = Math.floor((end - now) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setLeft(`${h}시간 ${m}분 ${sec}초`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return left;
}

export default function QueueDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { data: entry, isLoading } = useQueueDetail(params.queueEntryId);
  const cancelQueue = useCancelQueue();
  const createContract = useCreateContract();
  const countdown = useCountdown(entry?.expiresAt ?? null);

  const handleContract = () => {
    if (!entry || entry.status !== 'ACTIVE') return;
    createContract.mutate(
      { unitId: entry.unitId, queueEntryId: entry.id },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: '계약이 완료되었습니다.' });
          navigation.navigate('Main', { screen: 'Contract' } as any);
        },
        onError: (e: any) => Toast.show({ type: 'error', text1: e?.message ?? '계약에 실패했습니다.' }),
      }
    );
  };

  const handleCancel = () => {
    if (!entry || entry.status !== 'WAITING') return;
    cancelQueue.mutate(entry.id, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: '대기열을 취소했습니다.' });
        navigation.goBack();
      },
      onError: (e: any) => Toast.show({ type: 'error', text1: e?.message ?? '취소에 실패했습니다.' }),
    });
  };

  if (isLoading || !entry) return <Loading />;

  const isActive = entry.status === 'ACTIVE';

  return (
    <Layout scroll padded safe>
      <Text style={styles.facility}>{entry.facilityName}</Text>
      <Text style={styles.unit}>칸 {entry.unitCode}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>내 순번</Text>
        <Text style={styles.value}>{entry.queuePosition}번</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>앞 대기</Text>
        <Text style={styles.value}>{entry.aheadCount}명</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>상태</Text>
        <Text style={styles.value}>{entry.status}</Text>
      </View>
      {isActive && (
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>구매 가능 시간</Text>
          <Text style={styles.timerValue}>{countdown}</Text>
          <Button title="계약하기" onPress={handleContract} loading={createContract.isPending} style={styles.btn} />
        </View>
      )}
      {entry.status === 'WAITING' && (
        <Button title="대기 취소" variant="outline" onPress={handleCancel} loading={cancelQueue.isPending} style={styles.btn} />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  facility: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  unit: { fontSize: 16, color: '#64748b', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { color: '#64748b' },
  value: { fontWeight: '600' },
  timerBox: { marginTop: 24, padding: 20, backgroundColor: '#f0fdf4', borderRadius: 10 },
  timerLabel: { fontSize: 14, color: '#166534' },
  timerValue: { fontSize: 24, fontWeight: '700', color: '#166534', marginVertical: 8 },
  btn: { marginTop: 16 },
});
