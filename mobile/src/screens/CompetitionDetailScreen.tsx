import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';
import { useStandings } from '../hooks/useStandings';
import { useTopScorers } from '../hooks/useTopScorers';
import { useFavoritesStore } from '../store/favoritesStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetail'>;
type TabType = 'standings' | 'topscorers';

const SEASONS_LIST = [2024, 2023, 2022, 2021, 2020];

export function CompetitionDetailScreen({ route, navigation }: Props) {
  const { code: leagueId, name } = route.params;
  const [selectedSeason, setSelectedSeason] = useState<number>(2023); // Default to 2023 for compatibility/testing
  const [activeTab, setActiveTab] = useState<TabType>('standings');

  const { data: standings, isLoading: standingsLoading, error: standingsError } = useStandings(leagueId, selectedSeason);
  const { data: topScorers, isLoading: scorersLoading, error: scorersError } = useTopScorers(leagueId, selectedSeason);

  const { favoriteCompetitionCodes, toggleFavoriteCompetition } = useFavoritesStore();
  const isFav = favoriteCompetitionCodes.includes(leagueId);

  const leagueTable = standings?.[0]?.table;
  const groupName = standings?.[0]?.group;

  const isLoading = activeTab === 'standings' ? standingsLoading : scorersLoading;
  const error = activeTab === 'standings' ? standingsError : scorersError;

  return (
    <Container>
      {/* Top sticky header bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>
        <AppText size="lg" weight="bold" color={COLORS.primary} numberOfLines={1} style={styles.barTitle}>
          {name}
        </AppText>
        <Pressable onPress={() => toggleFavoriteCompetition(leagueId)} style={styles.starButton}>
          <Ionicons 
            name={isFav ? "star" : "star-outline"} 
            size={24} 
            color={isFav ? COLORS.accent : COLORS.primary} 
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Season Selector Card */}
        <View style={styles.seasonContainer}>
          <AppText size="xs" weight="bold" color={COLORS.textSecondary} style={styles.selectorLabel}>
            SELECT SEASON
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonScroll}>
            {SEASONS_LIST.map((year) => (
              <Pressable
                key={year}
                onPress={() => setSelectedSeason(year)}
                style={[
                  styles.seasonChip,
                  selectedSeason === year && styles.activeSeasonChip
                ]}
              >
                <AppText
                  size="xs"
                  weight="semibold"
                  color={selectedSeason === year ? COLORS.textOnPrimary : COLORS.textSecondary}
                >
                  {year}/{String(year + 1).substring(2)}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActiveTab('standings')}
            style={[styles.tab, activeTab === 'standings' && styles.activeTab]}
          >
            <Ionicons
              name="list"
              size={18}
              color={activeTab === 'standings' ? COLORS.primary : COLORS.textLight}
              style={{ marginRight: 6 }}
            />
            <AppText
              weight="bold"
              size="sm"
              color={activeTab === 'standings' ? COLORS.textPrimary : COLORS.textSecondary}
            >
              Standings
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('topscorers')}
            style={[styles.tab, activeTab === 'topscorers' && styles.activeTab]}
          >
            <Ionicons
              name="football"
              size={18}
              color={activeTab === 'topscorers' ? COLORS.primary : COLORS.textLight}
              style={{ marginRight: 6 }}
            />
            <AppText
              weight="bold"
              size="sm"
              color={activeTab === 'topscorers' ? COLORS.textPrimary : COLORS.textSecondary}
            >
              Top Scorers
            </AppText>
          </Pressable>
        </View>

        {/* Loader State */}
        {isLoading ? (
          <Loader message={activeTab === 'standings' ? 'Fetching table standings...' : 'Fetching top scorers...'} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={32} color={COLORS.live} />
            <AppText color={COLORS.live} weight="bold" style={{ marginTop: SPACING.sm }}>
              Failed to load details
            </AppText>
            <AppText size="xs" color={COLORS.textSecondary} align="center" style={{ marginTop: 2 }}>
              Check API limit quotas or server connection.
            </AppText>
          </Card>
        ) : activeTab === 'standings' ? (
          /* Standings View */
          leagueTable && leagueTable.length > 0 ? (
            <View style={styles.section}>
              <AppText size="sm" weight="semibold" color={COLORS.textSecondary} style={styles.sectionTitle}>
                {groupName || 'League Table'} Standings
              </AppText>
              
              <Card style={styles.tableCard}>
                {/* Header row */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <AppText size="xs" weight="bold" style={styles.colPos} color={COLORS.textSecondary}>#</AppText>
                  <AppText size="xs" weight="bold" style={styles.colTeam} color={COLORS.textSecondary}>Team</AppText>
                  <AppText size="xs" weight="bold" style={styles.colStat} color={COLORS.textSecondary}>P</AppText>
                  <AppText size="xs" weight="bold" style={styles.colStat} color={COLORS.textSecondary}>GD</AppText>
                  <AppText size="xs" weight="bold" style={styles.colStat} color={COLORS.textSecondary}>PTS</AppText>
                </View>

                {/* Dynamic rows */}
                {leagueTable.map((item) => (
                  <Pressable
                    key={item.team.id}
                    onPress={() => navigation.navigate('TeamDetail', { id: item.team.id, name: item.team.name })}
                    style={({ pressed }) => [
                      styles.tableRow,
                      { backgroundColor: pressed ? '#F8FAFC' : COLORS.surface }
                    ]}
                  >
                    <View style={styles.posContainer}>
                      <AppText size="sm" weight="bold" style={styles.colPos}>{item.position}</AppText>
                    </View>
                    
                    <View style={styles.colTeamContainer}>
                      {item.team.crest && (
                        <Image source={{ uri: item.team.crest }} style={styles.teamLogo} />
                      )}
                      <AppText size="sm" weight="semibold" style={styles.colTeamText} numberOfLines={1}>
                        {item.team.shortName || item.team.name}
                      </AppText>
                    </View>
                    
                    <AppText size="sm" style={styles.colStat}>{item.playedGames}</AppText>
                    <AppText
                      size="sm"
                      style={[
                        styles.colStat,
                        item.goalDifference > 0 ? styles.positiveGd : item.goalDifference < 0 ? styles.negativeGd : null
                      ]}
                    >
                      {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                    </AppText>
                    <AppText size="sm" weight="bold" style={styles.colStat} color={COLORS.primary}>{item.points}</AppText>
                  </Pressable>
                ))}
              </Card>
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText align="center" color={COLORS.textSecondary}>No standings available for this season.</AppText>
            </Card>
          )
        ) : (
          /* Top Scorers View */
          topScorers && topScorers.length > 0 ? (
            <View style={styles.section}>
              <AppText size="sm" weight="semibold" color={COLORS.textSecondary} style={styles.sectionTitle}>
                Goalscoring Leaders
              </AppText>
              
              {topScorers.map((scorer, index) => {
                const stats = scorer.statistics?.[0];
                return (
                  <Card key={`${scorer.player.id}-${index}`} style={styles.scorerCard}>
                    <View style={styles.scorerContent}>
                      {/* Rank / Number */}
                      <View style={styles.rankContainer}>
                        <AppText size="md" weight="bold" color={COLORS.primary}>
                          #{index + 1}
                        </AppText>
                      </View>

                      {/* Player Avatar */}
                      <Image source={{ uri: scorer.player.photo }} style={styles.playerAvatar} />

                      {/* Name / Team details */}
                      <View style={styles.scorerDetails}>
                        <AppText weight="bold" size="md" color={COLORS.textPrimary}>
                          {scorer.player.name}
                        </AppText>
                        
                        <View style={styles.scorerTeamRow}>
                          {stats?.team?.logo && (
                            <Image source={{ uri: stats.team.logo }} style={styles.scorerTeamLogo} />
                          )}
                          <AppText size="xs" color={COLORS.textSecondary}>
                            {stats?.team?.name} • {stats?.games?.position || 'Player'}
                          </AppText>
                        </View>
                        
                        {stats?.games?.rating && (
                          <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color={COLORS.accent} style={{ marginRight: 3 }} />
                            <AppText size="xs" weight="bold" color={COLORS.primary}>
                              {parseFloat(stats.games.rating).toFixed(2)}
                            </AppText>
                          </View>
                        )}
                      </View>

                      {/* Goals / Assists stats */}
                      <View style={styles.scorerStats}>
                        <AppText size="lg" weight="bold" color={COLORS.live}>
                          {stats?.goals?.total || 0}
                        </AppText>
                        <AppText size="xs" color={COLORS.textSecondary} weight="medium">
                          Goals
                        </AppText>
                        {stats?.goals?.assists ? (
                          <AppText size="xs" color={COLORS.textLight} style={{ marginTop: 2 }}>
                            {stats.goals.assists} assists
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText align="center" color={COLORS.textSecondary}>No top scorers stats available for this season.</AppText>
            </Card>
          )
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.xs,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  seasonContainer: {
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  seasonScroll: {
    paddingVertical: SPACING.xs,
  },
  seasonChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeSeasonChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md - 2,
  },
  activeTab: {
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  errorCard: {
    borderColor: '#FDE8E8',
    backgroundColor: '#FDF2F2',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
    ...SHADOW,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderRow: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  posContainer: {
    width: 26,
    alignItems: 'center',
  },
  colPos: {
    textAlign: 'center',
  },
  colTeamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.xs,
  },
  colTeam: {
    flex: 1,
    paddingLeft: SPACING.xs,
  },
  teamLogo: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: SPACING.sm,
  },
  colTeamText: {
    color: COLORS.textPrimary,
  },
  colStat: {
    width: 36,
    textAlign: 'center',
  },
  positiveGd: {
    color: '#059669',
    fontWeight: '500',
  },
  negativeGd: {
    color: '#DC2626',
    fontWeight: '500',
  },
  scorerCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  scorerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    marginHorizontal: SPACING.sm,
  },
  scorerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  scorerTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scorerTeamLogo: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  scorerStats: {
    alignItems: 'center',
    paddingLeft: SPACING.sm,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    minWidth: 60,
  },
});
