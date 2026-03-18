import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useFacilityDetail } from '../hooks/useFacilityDetail';
import { Loading } from '../components/Loading';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'FacilityDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'FacilityDetail'>;

export default function FacilityDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { data: facility, isLoading } = useFacilityDetail(params.facilityId);

  if (isLoading || !facility) return <Loading />;

  return (
    <Layout scroll padded safe>
      <Text style={styles.name}>{facility.name}</Text>
      {facility.description ? <Text style={styles.desc}>{facility.description}</Text> : null}
      {facility.phone ? <Text style={styles.meta}>연락처: {facility.phone}</Text> : null}
      {facility.addressRoad ? <Text style={styles.meta}>주소: {facility.addressRoad} {facility.addressDetail ?? ''}</Text> : null}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>지도 (네이버 지도 연동 예정)</Text>
      </View>
      <Button
        title="좌석 선택"
        onPress={() => navigation.navigate('UnitSelection', { facilityId: params.facilityId })}
        style={styles.btn}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  desc: { fontSize: 15, color: '#475569', marginBottom: 12 },
  meta: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  mapText: { color: '#64748b' },
  btn: { marginTop: 16 },
});
