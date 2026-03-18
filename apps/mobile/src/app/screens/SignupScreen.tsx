import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Layout } from '../components/Layout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/auth.api';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressRoad, setAddressRoad] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !password || !name.trim() || !birthDate || !phone.trim()) {
      Toast.show({ type: 'error', text1: '필수 항목을 입력하세요. (아이디, 비밀번호, 이름, 생년월일, 연락처)' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.signup({
        username: username.trim(),
        password,
        name: name.trim(),
        birthDate,
        phone: phone.trim(),
        email: email.trim() || undefined,
        addressRoad: addressRoad.trim() || undefined,
        addressDetail: addressDetail.trim() || undefined,
      });
      setAuth(res.accessToken, res.user);
      Toast.show({ type: 'success', text1: '회원가입이 완료되었습니다.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.message ?? '회원가입에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout scroll padded safe>
      <Input label="아이디" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="아이디" />
      <Input label="비밀번호" value={password} onChangeText={setPassword} secureTextEntry placeholder="비밀번호" />
      <Input label="이름" value={name} onChangeText={setName} placeholder="이름" />
      <Input label="생년월일" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
      <Input label="연락처" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="010-0000-0000" />
      <Input label="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="선택" />
      <Input label="주소" value={addressRoad} onChangeText={setAddressRoad} placeholder="도로명 주소" />
      <Input label="상세주소" value={addressDetail} onChangeText={setAddressDetail} placeholder="상세주소" />
      <Button title="가입하기" onPress={handleSignup} loading={loading} style={styles.btn} />
      <Button title="로그인으로" variant="outline" onPress={() => navigation.goBack()} style={styles.btn} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  btn: { marginTop: 12 },
});
