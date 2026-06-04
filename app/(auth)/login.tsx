import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // 웹: 페이지 직접 리다이렉트
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
      } else {
        // 네이티브: in-app 브라우저
        const redirectTo = makeRedirectUri({ scheme: 'yoriwaegil', path: 'auth/callback' });
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) throw error;
        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) {
            const url = new URL(result.url);
            const code = url.searchParams.get('code');
            if (code) await supabase.auth.exchangeCodeForSession(code);
          }
        }
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.logo}>
        <Ionicons name="restaurant" size={40} color="#fff" />
      </View>
      <Text style={s.title}>요리외길 채유나</Text>
      <Text style={s.subtitle}>나만의 요리 아카이브</Text>

      <TouchableOpacity style={s.btn} onPress={signInWithGoogle} disabled={loading}>
        {loading
          ? <ActivityIndicator color={Colors.ink} />
          : <>
              <Ionicons name="logo-google" size={20} color={Colors.ink} />
              <Text style={s.btnText}>Google로 시작하기</Text>
            </>
        }
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.soft,
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
  },
});
