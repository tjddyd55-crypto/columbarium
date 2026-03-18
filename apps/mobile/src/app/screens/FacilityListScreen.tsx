import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/Layout';
import { useFacilities } from '../hooks/useFacilities';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function FacilityListScreen() {
  const navigation = useNavigation<Nav>();
  const { data: facilities, isLoading } = useFacilities();

  if (isLoading) return <Loading />;
  const list = facilities ?? [];

  return (
    <Layout scroll padded safe>
      {list.length === 0 ? (
        <EmptyState message="등록된 시설이 없습니다." />
      ) : (
        list.map((f) => (
          <Card key={f.id} onPress={() => navigation.navigate('FacilityDetail', { facilityId: f.id })}>
            <Text style={styles.name}>{f.name}</Text>
            <Text style={styles.meta}>{f.operatorName}</Text>
            {f.addressRoad ? <Text style={styles.addr}>{f.addressRoad}</Text> : null}
          </Card>
        ))
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: '600' },
  meta: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addr: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
});
