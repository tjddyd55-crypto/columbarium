import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/Layout';
import { useMyQueue } from '../hooks/useMyQueue';
import { QueueInfoCard } from '../components/QueueInfoCard';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function QueueScreen() {
  const navigation = useNavigation<Nav>();
  const { data: entries, isLoading } = useMyQueue();

  if (isLoading) return <Loading />;
  const list = entries ?? [];

  return (
    <Layout scroll padded safe>
      {list.length === 0 ? (
        <EmptyState message="참여 중인 대기열이 없습니다." />
      ) : (
        list.map((e) => (
          <QueueInfoCard
            key={e.id}
            entry={e}
            onPress={() => navigation.navigate('QueueDetail', { queueEntryId: e.id })}
          />
        ))
      )}
    </Layout>
  );
}
