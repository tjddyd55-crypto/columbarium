import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Layout } from '../components/Layout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/auth.api';
import type { AuthStackParamList } from '../navigation/AuthStack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Toast.show({ type: 'error', text1: '아이디와 비밀번호를 입력하세요.' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ username: username.trim(), password });
      setAuth(res.accessToken, res.user);
      Toast.show({ type: 'success', text1: '로그인되었습니다.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.message ?? '로그인에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout scroll padded safe>
      <Text style={styles.title}>납골당</Text>
      <Text style={styles.subtitle}>분양/예약 플랫폼</Text>
      <Input label="아이디" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="아이디" />
      <Input label="비밀번호" value={password} onChangeText={setPassword} secureTextEntry placeholder="비밀번호" />
      <Button title="로그인" onPress={handleLogin} loading={loading} style={styles.btn} />
      <Button title="회원가입" variant="outline" onPress={() => navigation.navigate('Signup')} style={styles.btn} />
      <View style={styles.placeholders}>
        <Button title="카카오 로그인 (준비중)" variant="ghost" onPress={() => {}} />
        <Button title="네이버 로그인 (준비중)" variant="ghost" onPress={() => {}} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  btn: { marginTop: 12 },
  placeholders: { marginTop: 24, gap: 8 },
});
