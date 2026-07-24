import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useCompetitions } from '../hooks/useCompetitions';
import { useMatches } from '../hooks/useMatches';
import { scheduleLocalNotification } from '../services/notificationService';
import { COLORS, SPACING } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * Favorites dashboard screen.
 * Lists starred leagues and teams, enables Logging Out,
 * and hosts a simulation button to fire push notifications locally.
 * Includes a settings modal to configure live notification preferences.
 */
export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Custom states & stores
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const { favoriteTeamIds, favoriteCompetitionCodes } = useFavoritesStore();
  const { user, signOut } = useAuthStore();
  
  const {
    notificationsEnabled,
    goalAlertsEnabled,
    kickoffAlertsEnabled,
    favoriteTeamsOnlyEnabled,
    setNotificationsEnabled,
    setGoalAlertsEnabled,
    setKickoffAlertsEnabled,
    setFavoriteTeamsOnlyEnabled,
  } = useSettingsStore();

  const { data: competitions } = useCompetitions();
  const { data: matches } = useMatches();

  const favoriteLeagues = competitions?.filter((c) => favoriteCompetitionCodes.includes(c.code)) || [];
  
  const favoriteMatches = matches?.filter(
    (m) => favoriteTeamIds.includes(m.homeTeam?.id) || favoriteTeamIds.includes(m.awayTeam?.id)
  ) || [];

  const starredTeams = React.useMemo(() => {
    const list: { id: number; name: string }[] = [];
    if (!matches) {
      favoriteTeamIds.forEach(id => {
        list.push({ id, name: id === 65 ? 'Manchester City FC' : id === 57 ? 'Arsenal FC' : `Club #${id}` });
      });
      return list;
    }
    
    matches.forEach(m => {
      if (m.homeTeam && favoriteTeamIds.includes(m.homeTeam.id)) {
        if (!list.some(t => t.id === m.homeTeam.id)) {
          list.push({ id: m.homeTeam.id, name: m.homeTeam.shortName || m.homeTeam.name });
        }
      }
      if (m.awayTeam && favoriteTeamIds.includes(m.awayTeam.id)) {
        if (!list.some(t => t.id === m.awayTeam.id)) {
          list.push({ id: m.awayTeam.id, name: m.awayTeam.shortName || m.awayTeam.name });
        }
      }
    });

    favoriteTeamIds.forEach(id => {
      if (!list.some(t => t.id === id)) {
        list.push({ id, name: id === 65 ? 'Manchester City FC' : id === 57 ? 'Arsenal FC' : `Club #${id}` });
      }
    });
    return list;
  }, [matches, favoriteTeamIds]);

  const hasFavorites = favoriteLeagues.length > 0 || starredTeams.length > 0 || favoriteMatches.length > 0;

  // Custom mock trigger respecting settings preference rules
  const triggerMockAlert = async () => {
    if (!notificationsEnabled) {
      Alert.alert(
        'Alert Blocked',
        'Global push notifications are currently disabled in your app settings. Enable them to test notifications.'
      );
      return;
    }

    if (!goalAlertsEnabled) {
      Alert.alert(
        'Alert Blocked',
        'Goal Alerts are currently turned off in your app settings.'
      );
      return;
    }

    // Verify Starred Team alert filter logic:
    // The test notification fires an Arsenal FC goal alert (ID: 57).
    if (favoriteTeamsOnlyEnabled && !favoriteTeamIds.includes(57)) {
      Alert.alert(
        'Alert Filtered',
        'This goal alert involves Arsenal FC, which is not in your favorite teams list. Star Arsenal FC to test this filter!'
      );
      return;
    }

    await scheduleLocalNotification(
      '⚽ GOAL! Match Update',
      'Arsenal FC [1] - 0 Chelsea FC (Saka 23\')',
      { matchId: 1234 }
    );
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Row with Settings & Logout actions */}
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <AppText size="xl" weight="bold" color={COLORS.primary}>
              My Favorites
            </AppText>
            <AppText size="sm" color={COLORS.textSecondary}>
              Keep track of teams and leagues you care about
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setIsSettingsVisible(true)} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
            </Pressable>
            <Pressable onPress={signOut} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color="#E63946" />
            </Pressable>
          </View>
        </View>

        {/* Mock Push Notification Panel */}
        <Card style={styles.notificationCard} onPress={triggerMockAlert}>
          <View style={styles.notificationCardRow}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} style={styles.notificationIcon} />
            <View style={styles.notificationTexts}>
              <AppText weight="bold" size="sm" color={COLORS.primary}>
                Trigger Mock Goal Notification
              </AppText>
              <AppText size="xs" color={COLORS.textSecondary}>
                Tap to simulate a live match alert popup instantly
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </View>
        </Card>

        {!hasFavorites ? (
          <View style={styles.emptyState}>
            <Card style={styles.infoCard}>
              <Ionicons name="star-outline" size={48} color={COLORS.primary} style={styles.infoIcon} />
              <AppText weight="bold" size="lg" align="center" style={styles.infoTitle}>
                No favorites added yet
              </AppText>
              <AppText size="sm" color={COLORS.textSecondary} align="center">
                Tap the star icon on team or competition screens to highlight them here for quick access.
              </AppText>
            </Card>
          </View>
        ) : (
          <View>
            {/* Starred Leagues Section */}
            {favoriteLeagues.length > 0 ? (
              <View style={styles.section}>
                <AppText size="lg" weight="bold" style={styles.sectionTitle}>
                  Favorite Leagues
                </AppText>
                {favoriteLeagues.map((item) => (
                  <Card
                    key={item.code}
                    onPress={() => navigation.navigate('CompetitionDetail', { code: item.code, name: item.name })}
                    style={styles.favCard}
                  >
                    <View style={styles.row}>
                      <AppText weight="semibold">{item.name}</AppText>
                      <Ionicons name="star" size={20} color={COLORS.accent} />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}

            {/* Starred Clubs Section */}
            {starredTeams.length > 0 ? (
              <View style={styles.section}>
                <AppText size="lg" weight="bold" style={styles.sectionTitle}>
                  Favorite Teams
                </AppText>
                {starredTeams.map((item) => (
                  <Card
                    key={item.id}
                    onPress={() => navigation.navigate('TeamDetail', { id: item.id, name: item.name })}
                    style={styles.favCard}
                  >
                    <View style={styles.row}>
                      <AppText weight="semibold">{item.name}</AppText>
                      <Ionicons name="star" size={20} color={COLORS.accent} />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}

            {/* Starred Club Match Fixtures */}
            {favoriteMatches.length > 0 ? (
              <View style={styles.section}>
                <AppText size="lg" weight="bold" style={styles.sectionTitle}>
                  Starred Team Fixtures
                </AppText>
                {favoriteMatches.map((item) => (
                  <Card
                    key={item.id}
                    onPress={() => navigation.navigate('MatchDetail', { id: item.id })}
                    style={styles.favCard}
                  >
                    <View style={styles.row}>
                      <View style={styles.teamsCol}>
                        <AppText size="sm" weight="semibold">
                          {item.homeTeam?.shortName || item.homeTeam?.name} vs {item.awayTeam?.shortName || item.awayTeam?.name}
                        </AppText>
                        <AppText size="xs" color={COLORS.textLight}>
                          {item.competition?.name} | {item.status}
                        </AppText>
                      </View>
                      <Ionicons name="football" size={18} color={COLORS.primary} />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Settings overlay modal */}
      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <AppText size="lg" weight="bold" color={COLORS.primary}>
                Notification Settings
              </AppText>
              <Pressable onPress={() => setIsSettingsVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {/* Profile Card */}
              <View style={styles.profileCard}>
                <Ionicons name="person-circle" size={44} color={COLORS.primary} />
                <View style={styles.profileTexts}>
                  <AppText weight="bold" size="sm" color={COLORS.textPrimary}>
                    Logged In As
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary}>
                    {user?.email || 'Guest User'}
                  </AppText>
                </View>
              </View>

              {/* Preferences Header */}
              <AppText size="xs" weight="bold" color={COLORS.textSecondary} style={styles.preferencesHeader}>
                PREFERENCES
              </AppText>

              {/* Preference Row 1: Global notifications */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTexts}>
                  <AppText weight="semibold" size="sm" color={COLORS.textPrimary}>
                    Global Notifications
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary}>
                    Enable or disable all notifications globally
                  </AppText>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#A9DFBF' }}
                  thumbColor={notificationsEnabled ? COLORS.primary : '#9CA3AF'}
                />
              </View>

              {/* Preference Row 2: Goal Alerts */}
              <View style={[styles.preferenceRow, !notificationsEnabled && styles.disabledRow]}>
                <View style={styles.preferenceTexts}>
                  <AppText weight="semibold" size="sm" color={COLORS.textPrimary}>
                    Live Goal Alerts
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary}>
                    Receive alerts when goals are scored
                  </AppText>
                </View>
                <Switch
                  value={goalAlertsEnabled}
                  onValueChange={setGoalAlertsEnabled}
                  disabled={!notificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#A9DFBF' }}
                  thumbColor={notificationsEnabled && goalAlertsEnabled ? COLORS.primary : '#9CA3AF'}
                />
              </View>

              {/* Preference Row 3: Match Kickoff Alerts */}
              <View style={[styles.preferenceRow, !notificationsEnabled && styles.disabledRow]}>
                <View style={styles.preferenceTexts}>
                  <AppText weight="semibold" size="sm" color={COLORS.textPrimary}>
                    Match Kickoff Alerts
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary}>
                    Get notified when matches kick off
                  </AppText>
                </View>
                <Switch
                  value={kickoffAlertsEnabled}
                  onValueChange={setKickoffAlertsEnabled}
                  disabled={!notificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#A9DFBF' }}
                  thumbColor={notificationsEnabled && kickoffAlertsEnabled ? COLORS.primary : '#9CA3AF'}
                />
              </View>

              {/* Preference Row 4: Favorite Teams Only */}
              <View style={[styles.preferenceRow, !notificationsEnabled && styles.disabledRow]}>
                <View style={styles.preferenceTexts}>
                  <AppText weight="semibold" size="sm" color={COLORS.textPrimary}>
                    Starred Teams Only
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary}>
                    Only show alerts for teams in your favorites list
                  </AppText>
                </View>
                <Switch
                  value={favoriteTeamsOnlyEnabled}
                  onValueChange={setFavoriteTeamsOnlyEnabled}
                  disabled={!notificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#A9DFBF' }}
                  thumbColor={notificationsEnabled && favoriteTeamsOnlyEnabled ? COLORS.primary : '#9CA3AF'}
                />
              </View>
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.modalFooter}>
              <Pressable onPress={() => setIsSettingsVisible(false)} style={styles.saveButton}>
                <AppText color="#FFFFFF" weight="bold" align="center">
                  Save & Close
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTexts: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingsButton: {
    padding: SPACING.sm,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  logoutButton: {
    padding: SPACING.sm,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
  },
  notificationCard: {
    marginBottom: SPACING.xl,
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1.5,
  },
  notificationCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: SPACING.md,
  },
  notificationTexts: {
    flex: 1,
  },
  emptyState: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    width: '100%',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  infoIcon: {
    marginBottom: SPACING.md,
  },
  infoTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  favCard: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamsCol: {
    flex: 1,
  },
  
  // Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    paddingBottom: SPACING.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  profileTexts: {
    marginLeft: SPACING.md,
  },
  preferencesHeader: {
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  disabledRow: {
    opacity: 0.5,
  },
  preferenceTexts: {
    flex: 1,
    marginRight: SPACING.md,
  },
  modalFooter: {
    marginTop: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
});
