import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/Layout';
import { useMyContracts } from '../hooks/useMyContracts';
import { ContractSummaryCard } from '../components/ContractSummaryCard';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function ContractListScreen() {
  const navigation = useNavigation<Nav>();
  const { data: contracts, isLoading } = useMyContracts();

  if (isLoading) return <Loading />;
  const list = contracts ?? [];

  return (
    <Layout scroll padded safe>
      {list.length === 0 ? (
        <EmptyState message="계약 내역이 없습니다." />
      ) : (
        list.map((c) => (
          <ContractSummaryCard
            key={c.id}
            contract={c}
            onPress={() => {}}
          />
        ))
      )}
    </Layout>
  );
}
