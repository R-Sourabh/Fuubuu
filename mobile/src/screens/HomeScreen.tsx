import React from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { useMatches } from '../hooks/useMatches';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: matches, isLoading, error } = useMatches();

  if (isLoading) {
    return (
      <Container>
        <Loader message="Loading matchday updates..." />
      </Container>
    );
  }

  const featuredMatch = matches?.[0];

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <AppText size="title" weight="bold" color={COLORS.primary}>
            Fuubuu
          </AppText>
          <AppText size="sm" color={COLORS.textSecondary}>
            Your Premium Football Gateway
          </AppText>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.live} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <AppText color={COLORS.live} weight="bold">Failed to load live matches</AppText>
              <AppText size="xs" color={COLORS.textSecondary}>Please ensure your backend gateway is running.</AppText>
            </View>
          </Card>
        ) : null}

        {/* Featured Live/Upcoming Match */}
        {featuredMatch ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText size="lg" weight="bold" color={COLORS.textPrimary}>
                Featured Match
              </AppText>
              <Badge 
                label={featuredMatch.status} 
                type={
                  featuredMatch.status === 'LIVE'
                    ? 'live'
                    : featuredMatch.status === 'FINISHED'
                    ? 'finished'
                    : 'upcoming'
                } 
              />
            </View>

            <Card
              onPress={() => navigation.navigate('MatchDetail', { id: featuredMatch.id })}
              style={styles.matchCard}
            >
              <AppText size="xs" color={COLORS.textSecondary} align="center" style={styles.leagueName}>
                {featuredMatch.competition?.name}
              </AppText>
              
              <View style={styles.teamsRow}>
                {/* Home */}
                <View style={styles.teamSideHome}>
                  <AppText weight="bold" align="right" numberOfLines={1} style={styles.teamNameText}>
                    {featuredMatch.homeTeam?.shortName || featuredMatch.homeTeam?.name}
                  </AppText>
                  {featuredMatch.homeTeam?.crest && (
                    <Image source={{ uri: featuredMatch.homeTeam.crest }} style={styles.homeCrest} />
                  )}
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                  <AppText size="xl" weight="bold" color={COLORS.primary}>
                    {featuredMatch.score?.fullTime?.home !== null && featuredMatch.score?.fullTime?.home !== undefined
                      ? `${featuredMatch.score.fullTime.home} - ${featuredMatch.score.fullTime.away}`
                      : 'vs'}
                  </AppText>
                  {featuredMatch.elapsed && (
                    <AppText size="xs" weight="bold" color={COLORS.live}>
                      {featuredMatch.elapsed}'
                    </AppText>
                  )}
                </View>

                {/* Away */}
                <View style={styles.teamSideAway}>
                  {featuredMatch.awayTeam?.crest && (
                    <Image source={{ uri: featuredMatch.awayTeam.crest }} style={styles.awayCrest} />
                  )}
                  <AppText weight="bold" align="left" numberOfLines={1} style={styles.teamNameText}>
                    {featuredMatch.awayTeam?.shortName || featuredMatch.awayTeam?.name}
                  </AppText>
                </View>
              </View>

              <AppText size="xs" color={COLORS.textLight} align="center" style={styles.matchTime}>
                Tap for timeline, lineups & head-to-head
              </AppText>
            </Card>
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="football-outline" size={40} color={COLORS.textLight} />
            <AppText align="center" color={COLORS.textSecondary} style={{ marginTop: SPACING.sm }}>
              No matches scheduled or active currently.
            </AppText>
          </Card>
        )}

        {/* Shortcuts / Quick Navigation */}
        <View style={styles.section}>
          <AppText size="lg" weight="bold" style={styles.sectionTitle}>
            Quick Roster Views
          </AppText>
          
          <Card
            onPress={() => navigation.navigate('TeamDetail', { id: 33, name: 'Manchester City' })}
            style={styles.teamLinkCard}
          >
            <View style={styles.linkLeft}>
              <Image source={{ uri: 'https://media.api-sports.io/football/teams/33.png' }} style={styles.linkLogo} />
              <View>
                <AppText weight="semibold">Manchester City FC</AppText>
                <AppText size="xs" color={COLORS.textSecondary}>Etihad Stadium • Premier League</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </Card>

          <Card
            onPress={() => navigation.navigate('TeamDetail', { id: 42, name: 'Arsenal' })}
            style={styles.teamLinkCard}
          >
            <View style={styles.linkLeft}>
              <Image source={{ uri: 'https://media.api-sports.io/football/teams/42.png' }} style={styles.linkLogo} />
              <View>
                <AppText weight="semibold">Arsenal FC</AppText>
                <AppText size="xs" color={COLORS.textSecondary}>Emirates Stadium • Premier League</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </Card>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FDE8E8',
    backgroundColor: '#FDF2F2',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  matchCard: {
    paddingVertical: SPACING.lg,
    ...SHADOW,
  },
  leagueName: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  teamSideHome: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  teamSideAway: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamNameText: {
    flex: 1,
  },
  homeCrest: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginLeft: SPACING.sm,
  },
  awayCrest: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: SPACING.sm,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  matchTime: {
    marginTop: SPACING.sm,
  },
  teamLinkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkLogo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: SPACING.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOW,
  },
});
