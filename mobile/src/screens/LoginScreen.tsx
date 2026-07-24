import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING } from '../theme/theme';

/**
 * Premium Login/Registration screen.
 * Includes email login, account signup, and local mock demo bypass.
 */
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { signIn, signUp, isLoading } = useAuthStore();

  const handleAuth = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    try {
      if (isRegistering) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Check your inputs.');
    }
  };

  const handleGuestLogin = async () => {
    setErrorMessage('');
    try {
      await signIn('fan@fuubuu.com', 'fanpassword');
    } catch (err: any) {
      setErrorMessage('Demo login failed.');
    }
  };

  return (
    <Container safe={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <AppText size="xxl" weight="bold" color={COLORS.primary} style={styles.brandTitle}>
              Fuubuu
            </AppText>
            <AppText size="sm" color={COLORS.textSecondary}>
              Your Premium Football Gateway
            </AppText>
          </View>

          {/* Form Wrapper Card */}
          <Card style={styles.formCard}>
            <AppText size="lg" weight="bold" color={COLORS.primary} style={styles.formTitle}>
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </AppText>

            {errorMessage ? (
              <AppText size="xs" color="#E63946" style={styles.errorText}>
                {errorMessage}
              </AppText>
            ) : null}

            <AppText size="xs" weight="semibold" color={COLORS.textSecondary} style={styles.label}>
              Email Address
            </AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <AppText size="xs" weight="semibold" color={COLORS.textSecondary} style={styles.label}>
              Password
            </AppText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable onPress={handleAuth} style={styles.mainButton} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText color="#FFFFFF" weight="bold">
                  {isRegistering ? 'Sign Up' : 'Sign In'}
                </AppText>
              )}
            </Pressable>

            {/* Toggle Sign In vs Create Account */}
            <Pressable onPress={() => setIsRegistering(!isRegistering)} style={styles.toggleButton}>
              <AppText size="xs" color={COLORS.primary} weight="semibold">
                {isRegistering
                  ? 'Already have an account? Sign In'
                  : 'New to Fuubuu? Create an account'}
              </AppText>
            </Pressable>
          </Card>

          {/* Demo Bypass Option */}
          <Pressable onPress={handleGuestLogin} style={styles.guestButton} disabled={isLoading}>
            <AppText size="sm" color={COLORS.primary} weight="bold">
              Bypass / Demo Login
            </AppText>
            <AppText size="xs" color={COLORS.textSecondary} align="center" style={styles.guestSubtext}>
              Instantly preview app without database keys
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  brandTitle: {
    fontSize: 42,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  formCard: {
    padding: SPACING.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  formTitle: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    marginBottom: SPACING.md,
    backgroundColor: '#FDF2F2',
    borderColor: '#FDE8E8',
    borderWidth: 1,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  label: {
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  toggleButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  guestButton: {
    marginTop: SPACING.xxl,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSubtext: {
    marginTop: 2,
  },
});
