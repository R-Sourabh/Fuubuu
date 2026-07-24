import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { useMatches, Match } from '../hooks/useMatches';
import { COLORS, SPACING } from '../theme/theme';

/**
 * Helper to display correct scores or timing string
 */
function getScoreDisplay(item: Match) {
  if (item.status === 'TIMED' || item.status === 'SCHEDULED') {
    try {
      const date = new Date(item.utcDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return 'vs';
    }
  }
  
  const homeScore = item.score?.fullTime?.home;
  const awayScore = item.score?.fullTime?.away;
  if (homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
    return `${homeScore} - ${awayScore}`;
  }
  return 'vs';
}

/**
 * Helper to map status to badge layout type
 */
function getBadgeType(status: string) {
  if (status === 'LIVE' || status === 'IN_PLAY') return 'live' as const;
  if (status === 'FINISHED' || status === 'FT') return 'finished' as const;
  return 'upcoming' as const;
}

/**
 * Helper to output clean visual date
 */
function getMatchTimeDisplay(item: Match) {
  try {
    const date = new Date(item.utcDate);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return 'Today';
  }
}

/**
 * Matches screen listing dynamic matches.
 */
export function MatchesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: matches, isLoading, error } = useMatches();

  if (isLoading) {
    return (
      <Container>
        <Loader message="Loading matches..." />
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={matches || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText size="xl" weight="bold" color={COLORS.primary}>
              Fixtures & Results
            </AppText>
            <AppText size="sm" color={COLORS.textSecondary}>
              Stay updated with football events worldwide
            </AppText>
          </View>
        }
        ListEmptyComponent={
          error ? (
            <Card style={styles.errorCard}>
              <AppText color={COLORS.live} weight="bold">Failed to load matches</AppText>
              <AppText size="xs" color={COLORS.textSecondary}>Please ensure your backend gateway is running.</AppText>
            </Card>
          ) : (
            <Card>
              <AppText align="center" color={COLORS.textSecondary}>No matches scheduled.</AppText>
            </Card>
          )
        }
        renderItem={({ item }) => {
          const badgeType = getBadgeType(item.status);
          return (
            <Card
              onPress={() => navigation.navigate('MatchDetail', { id: item.id })}
              style={styles.matchCard}
            >
              <View style={styles.cardHeader}>
                <AppText size="xs" weight="semibold" color={COLORS.textSecondary}>
                  {item.competition?.name}
                </AppText>
                <Badge label={item.status} type={badgeType} />
              </View>

              <View style={styles.teamsContainer}>
                <View style={styles.teamRow}>
                  <AppText weight="semibold" style={styles.teamName}>
                    {item.homeTeam?.shortName || item.homeTeam?.name}
                  </AppText>
                </View>
                <View style={styles.scoreContainer}>
                  <AppText size="lg" weight="bold" color={badgeType === 'live' ? COLORS.live : COLORS.textPrimary}>
                    {getScoreDisplay(item)}
                  </AppText>
                </View>
                <View style={styles.teamRow}>
                  <AppText weight="semibold" style={styles.teamName} align="right">
                    {item.awayTeam?.shortName || item.awayTeam?.name}
                  </AppText>
                </View>
              </View>

              <AppText size="xs" color={COLORS.textLight} align="center">
                {getMatchTimeDisplay(item)}
              </AppText>
            </Card>
          );
        }}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  errorCard: {
    borderColor: '#FDE8E8',
    backgroundColor: '#FDF2F2',
  },
  matchCard: {
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  teamRow: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
  },
  scoreContainer: {
    paddingHorizontal: SPACING.md,
    minWidth: 60,
    alignItems: 'center',
  },
});
