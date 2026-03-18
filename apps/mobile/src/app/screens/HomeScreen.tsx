import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/Layout';
import { useFacilities } from '../hooks/useFacilities';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: facilities, isLoading, error } = useFacilities();

  const goSearch = () => {
    navigation.getParent()?.navigate('Search' as never);
  };

  const goFacility = (id: string) => {
    navigation.navigate('FacilityDetail', { facilityId: id });
  };

  if (isLoading) return <Loading />;

  const list = facilities ?? [];
  const recommended = list.slice(0, 3);
  const popular = list.slice(0, 5);

  return (
    <Layout scroll padded safe>
      <TouchableOpacity onPress={goSearch} style={styles.searchBar}>
        <Text style={styles.searchPlaceholder}>시설 검색</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>추천 시설</Text>
      {recommended.length === 0 ? (
        <EmptyState message="등록된 시설이 없습니다." />
      ) : (
        recommended.map((f) => (
          <Card key={f.id} onPress={() => goFacility(f.id)}>
            <Text style={styles.facilityName}>{f.name}</Text>
            <Text style={styles.facilityDesc}>{f.description || f.addressRoad || '-'}</Text>
          </Card>
        ))
      )}
      <Text style={styles.sectionTitle}>인기 시설</Text>
      {popular.length === 0 ? null : (
        popular.map((f) => (
          <Card key={f.id} onPress={() => goFacility(f.id)}>
            <Text style={styles.facilityName}>{f.name}</Text>
            <Text style={styles.facilityDesc}>{f.operatorName}</Text>
          </Card>
        ))
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchPlaceholder: { color: '#94a3b8', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  facilityName: { fontSize: 16, fontWeight: '600' },
  facilityDesc: { fontSize: 14, color: '#64748b', marginTop: 4 },
});
