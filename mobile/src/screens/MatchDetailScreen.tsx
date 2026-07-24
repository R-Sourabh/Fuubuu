import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { useMatchDetail } from '../hooks/useMatchDetail';
import { useMatchTimeline } from '../hooks/useMatchTimeline';
import { useMatchLineups } from '../hooks/useMatchLineups';
import { useMatchH2H } from '../hooks/useMatchH2H';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchDetail'>;
type MatchTabType = 'timeline' | 'lineups' | 'h2h' | 'info';
type LineupTeamSelect = 'home' | 'away';

export function MatchDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const [activeTab, setActiveTab] = useState<MatchTabType>('timeline');
  const [lineupTeam, setLineupTeam] = useState<LineupTeamSelect>('home');

  // Load queries
  const { data: match, isLoading: matchLoading, error: matchError } = useMatchDetail(id);
  const { data: timeline, isLoading: timelineLoading } = useMatchTimeline(id);
  const { data: lineups, isLoading: lineupsLoading } = useMatchLineups(id);
  
  // Head to Head query
  const { data: h2hMatches, isLoading: h2hLoading } = useMatchH2H(
    id,
    match?.homeTeam?.id,
    match?.awayTeam?.id
  );

  const isNotStarted = match
    ? match.status === 'TIMED' || match.status === 'POSTPONED'
    : false;

  const currentHomeScore = match?.score?.fullTime?.home !== null && match?.score?.fullTime?.home !== undefined
    ? match.score.fullTime.home
    : 0;

  const currentAwayScore = match?.score?.fullTime?.away !== null && match?.score?.fullTime?.away !== undefined
    ? match.score.fullTime.away
    : 0;

  const isLoading = matchLoading;

  if (isLoading && !match) {
    return (
      <Container>
        <Loader message="Loading match details..." />
      </Container>
    );
  }

  // Get active lineup data
  const homeLineup = lineups?.[0];
  const awayLineup = lineups?.[1];
  const selectedLineup = lineupTeam === 'home' ? homeLineup : awayLineup;

  return (
    <Container>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>
        <AppText size="md" weight="bold" color={COLORS.primary} numberOfLines={1} style={styles.barTitle}>
          {match?.competition?.name || 'Match Details'}
        </AppText>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {matchError ? (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={32} color={COLORS.live} />
            <AppText color={COLORS.live} weight="bold" style={{ marginTop: SPACING.sm }}>
              Failed to load match details
            </AppText>
            <AppText size="xs" color={COLORS.textSecondary} align="center">
              Check your internet connection or backend gateway.
            </AppText>
          </Card>
        ) : match ? (
          <>
            {/* Real-time Match Banner Card */}
            <Card style={styles.scoreBoardCard}>
              {/* Competition Header */}
              <AppText size="xs" color={COLORS.textSecondary} align="center" style={styles.compLabel}>
                {match.competition?.name} {match.stage ? `• ${match.stage}` : ''}
              </AppText>

              <View style={styles.scoreBoardRow}>
                {/* Home Team */}
                <Pressable 
                  onPress={() => navigation.navigate('TeamDetail', { id: match.homeTeam.id, name: match.homeTeam.name })}
                  style={styles.clubColumn}
                >
                  {match.homeTeam?.crest ? (
                    <Image source={{ uri: match.homeTeam.crest }} style={styles.teamCrest} />
                  ) : (
                    <View style={styles.crestPlaceholder}>
                      <Ionicons name="shield-outline" size={28} color={COLORS.primary} />
                    </View>
                  )}
                  <AppText size="sm" weight="bold" align="center" style={styles.clubName} numberOfLines={2}>
                    {match.homeTeam?.shortName || match.homeTeam?.name}
                  </AppText>
                </Pressable>

                {/* Score Column */}
                <View style={styles.scoreColumn}>
                  <AppText size="title" weight="bold" color={COLORS.primary}>
                    {!isNotStarted
                      ? `${currentHomeScore} - ${currentAwayScore}`
                      : 'vs'}
                  </AppText>
                  
                  <View style={{ marginTop: SPACING.xs }}>
                    <Badge 
                      label={match.status} 
                      type={
                        match.status === 'LIVE'
                          ? 'live'
                          : match.status === 'FINISHED'
                          ? 'finished'
                          : 'upcoming'
                      } 
                    />
                  </View>

                  {match.elapsed && (
                    <AppText size="xs" weight="bold" color={COLORS.live} style={{ marginTop: 4 }}>
                      {match.elapsed}'
                    </AppText>
                  )}
                </View>

                {/* Away Team */}
                <Pressable
                  onPress={() => navigation.navigate('TeamDetail', { id: match.awayTeam.id, name: match.awayTeam.name })}
                  style={styles.clubColumn}
                >
                  {match.awayTeam?.crest ? (
                    <Image source={{ uri: match.awayTeam.crest }} style={styles.teamCrest} />
                  ) : (
                    <View style={styles.crestPlaceholder}>
                      <Ionicons name="shield-outline" size={28} color={COLORS.primary} />
                    </View>
                  )}
                  <AppText size="sm" weight="bold" align="center" style={styles.clubName} numberOfLines={2}>
                    {match.awayTeam?.shortName || match.awayTeam?.name}
                  </AppText>
                </Pressable>
              </View>
            </Card>

            {/* Main Tabs Navigation */}
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => setActiveTab('timeline')}
                style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
              >
                <AppText size="xs" weight="bold" color={activeTab === 'timeline' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                  Timeline
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('lineups')}
                style={[styles.tab, activeTab === 'lineups' && styles.activeTab]}
              >
                <AppText size="xs" weight="bold" color={activeTab === 'lineups' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                  Lineups
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('h2h')}
                style={[styles.tab, activeTab === 'h2h' && styles.activeTab]}
              >
                <AppText size="xs" weight="bold" color={activeTab === 'h2h' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                  H2H
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('info')}
                style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              >
                <AppText size="xs" weight="bold" color={activeTab === 'info' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                  Info
                </AppText>
              </Pressable>
            </View>

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <View>
                {timelineLoading ? (
                  <Loader message="Loading match events..." />
                ) : timeline && timeline.length > 0 ? (
                  <Card style={styles.timelineCard}>
                    {timeline.map((event, idx) => {
                      const isHome = event.team.id === match.homeTeam.id;
                      
                      // Identify event icon/element
                      let eventIcon = <Ionicons name="football-outline" size={16} color={COLORS.textPrimary} />;
                      let eventTypeLabel = '';

                      if (event.type === 'Goal') {
                        eventIcon = <Ionicons name="football" size={18} color="#10B981" />;
                        eventTypeLabel = event.detail || 'Goal';
                      } else if (event.type === 'Card') {
                        const isRed = event.detail.toLowerCase().includes('red');
                        eventIcon = (
                          <View style={[
                            styles.cardEventIcon, 
                            { backgroundColor: isRed ? '#EF4444' : '#F59E0B' }
                          ]} />
                        );
                        eventTypeLabel = event.detail;
                      } else if (event.type === 'subst') {
                        eventIcon = <Ionicons name="swap-horizontal" size={16} color="#3B82F6" />;
                        eventTypeLabel = 'Substitution';
                      } else if (event.type === 'Var') {
                        eventIcon = <Ionicons name="tv-outline" size={16} color="#8B5CF6" />;
                        eventTypeLabel = 'VAR Review';
                      }

                      return (
                        <View key={`${event.time.elapsed}-${idx}`} style={styles.timelineItem}>
                          {/* Left (Home Events) */}
                          <View style={styles.timelineSide}>
                            {isHome && (
                              <View style={styles.eventBubble}>
                                <AppText weight="bold" size="sm">
                                  {event.player.name}
                                </AppText>
                                <AppText size="xs" color={COLORS.textSecondary}>
                                  {eventTypeLabel}
                                  {event.assist.name ? ` (Assist: ${event.assist.name})` : ''}
                                </AppText>
                              </View>
                            )}
                          </View>

                          {/* Center (Elapsed Time) */}
                          <View style={styles.timelineCenter}>
                            <View style={styles.timelineTimeCircle}>
                              <AppText size="xs" weight="bold" color={COLORS.textOnPrimary}>
                                {event.time.elapsed}'
                              </AppText>
                            </View>
                            {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
                          </View>

                          {/* Right (Away Events) */}
                          <View style={[styles.timelineSide, { alignItems: 'flex-start' }]}>
                            {!isHome && (
                              <View style={[styles.eventBubble, { alignItems: 'flex-start' }]}>
                                <AppText weight="bold" size="sm">
                                  {event.player.name}
                                </AppText>
                                <AppText size="xs" color={COLORS.textSecondary}>
                                  {eventTypeLabel}
                                  {event.assist.name ? ` (Assist: ${event.assist.name})` : ''}
                                </AppText>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </Card>
                ) : isNotStarted ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="time-outline" size={40} color={COLORS.textLight} />
                    <AppText align="center" color={COLORS.textSecondary} style={{ marginTop: SPACING.sm }}>
                      Match is not started yet. Timeline will be available during kick-off.
                    </AppText>
                  </Card>
                ) : (
                  <Card style={styles.emptyCard}>
                    <AppText align="center" color={COLORS.textSecondary}>
                      No match events recorded.
                    </AppText>
                  </Card>
                )}
              </View>
            )}

            {/* Lineups Tab */}
            {activeTab === 'lineups' && (
              <View>
                {lineupsLoading ? (
                  <Loader message="Loading squad lineups..." />
                ) : lineups && lineups.length > 0 ? (
                  <View>
                    {/* Lineup Team Segmented Switch */}
                    <View style={styles.lineupSegment}>
                      <Pressable 
                        onPress={() => setLineupTeam('home')}
                        style={[
                          styles.lineupSegmentTab, 
                          lineupTeam === 'home' && styles.activeLineupSegmentTab
                        ]}
                      >
                        <AppText size="xs" weight="bold" color={lineupTeam === 'home' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                          {match.homeTeam.name}
                        </AppText>
                      </Pressable>
                      
                      <Pressable 
                        onPress={() => setLineupTeam('away')}
                        style={[
                          styles.lineupSegmentTab, 
                          lineupTeam === 'away' && styles.activeLineupSegmentTab
                        ]}
                      >
                        <AppText size="xs" weight="bold" color={lineupTeam === 'away' ? COLORS.textOnPrimary : COLORS.textSecondary}>
                          {match.awayTeam.name}
                        </AppText>
                      </Pressable>
                    </View>

                    {selectedLineup ? (
                      <View>
                        {/* Formation & Coach Card */}
                        <Card style={styles.lineupDetailCard}>
                          <View style={styles.lineupOverviewRow}>
                            <View style={styles.formationInfo}>
                              <AppText size="xs" color={COLORS.textLight}>FORMATION</AppText>
                              <AppText size="xl" weight="bold" color={COLORS.primary}>{selectedLineup.formation}</AppText>
                            </View>
                            
                            {selectedLineup.coach && (
                              <View style={styles.coachLineupDetails}>
                                <AppText size="xs" color={COLORS.textLight} align="right">MANAGER</AppText>
                                <AppText size="sm" weight="semibold" align="right">{selectedLineup.coach.name}</AppText>
                              </View>
                            )}
                          </View>
                        </Card>

                        {/* Starting XI */}
                        <AppText size="sm" weight="bold" color={COLORS.textSecondary} style={styles.subSectionTitle}>
                          STARTING XI
                        </AppText>
                        <Card style={styles.playersListCard}>
                          {selectedLineup.startXI.map((item, idx) => (
                            <View 
                              key={`${item.player.id}-${idx}`} 
                              style={[
                                styles.playerLineupRow,
                                idx === selectedLineup.startXI.length - 1 && { borderBottomWidth: 0 }
                              ]}
                            >
                              <View style={styles.jerseyBadge}>
                                <AppText size="xs" weight="bold" color={COLORS.primary}>{item.player.number}</AppText>
                              </View>
                              <AppText size="sm" weight="semibold" style={styles.lineupPlayerName}>
                                {item.player.name}
                              </AppText>
                              <Badge label={item.player.pos} type="neutral" />
                            </View>
                          ))}
                        </Card>

                        {/* Substitutes */}
                        {selectedLineup.substitutes && selectedLineup.substitutes.length > 0 && (
                          <>
                            <AppText size="sm" weight="bold" color={COLORS.textSecondary} style={styles.subSectionTitle}>
                              BENCH / SUBSTITUTES
                            </AppText>
                            <Card style={styles.playersListCard}>
                              {selectedLineup.substitutes.map((item, idx) => (
                                <View 
                                  key={`${item.player.id}-${idx}`} 
                                  style={[
                                    styles.playerLineupRow,
                                    idx === selectedLineup.substitutes.length - 1 && { borderBottomWidth: 0 }
                                  ]}
                                >
                                  <View style={styles.jerseyBadge}>
                                    <AppText size="xs" weight="bold" color={COLORS.primary}>{item.player.number}</AppText>
                                  </View>
                                  <AppText size="sm" weight="semibold" style={styles.lineupPlayerName}>
                                    {item.player.name}
                                  </AppText>
                                  <Badge label={item.player.pos} type="neutral" />
                                </View>
                              ))}
                            </Card>
                          </>
                        )}
                      </View>
                    ) : (
                      <Card style={styles.emptyCard}>
                        <AppText align="center" color={COLORS.textSecondary}>Lineup detail is not registered.</AppText>
                      </Card>
                    )}
                  </View>
                ) : (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="shirt-outline" size={40} color={COLORS.textLight} />
                    <AppText align="center" color={COLORS.textSecondary} style={{ marginTop: SPACING.sm }}>
                      Lineup starting XI is not available yet.
                    </AppText>
                  </Card>
                )}
              </View>
            )}

            {/* Head to Head Tab */}
            {activeTab === 'h2h' && (
              <View>
                {h2hLoading ? (
                  <Loader message="Loading head-to-head records..." />
                ) : h2hMatches && h2hMatches.length > 0 ? (
                  <View>
                    <AppText size="sm" weight="bold" color={COLORS.textSecondary} style={styles.subSectionTitle}>
                      PREVIOUS MEETINGS ({h2hMatches.length})
                    </AppText>
                    {h2hMatches.slice(0, 10).map((h2hMatch) => {
                      const h2hNotStarted = h2hMatch.status === 'TIMED';
                      return (
                        <Card key={h2hMatch.id} style={styles.h2hMatchCard}>
                          <View style={styles.h2hHeader}>
                            <AppText size="xs" color={COLORS.textLight}>
                              {h2hMatch.utcDate.split('T')[0]} • {h2hMatch.stage}
                            </AppText>
                          </View>
                          
                          <View style={styles.h2hRow}>
                            <View style={styles.h2hTeamCol}>
                              <AppText size="sm" weight="semibold" align="center" numberOfLines={1}>
                                {h2hMatch.homeTeam.name}
                              </AppText>
                            </View>

                            <View style={styles.h2hScoreCol}>
                              <AppText size="md" weight="bold" color={COLORS.primary}>
                                {!h2hNotStarted && h2hMatch.score?.fullTime?.home !== null
                                  ? `${h2hMatch.score.fullTime.home} - ${h2hMatch.score.fullTime.away}`
                                  : 'vs'}
                              </AppText>
                            </View>

                            <View style={styles.h2hTeamCol}>
                              <AppText size="sm" weight="semibold" align="center" numberOfLines={1}>
                                {h2hMatch.awayTeam.name}
                              </AppText>
                            </View>
                          </View>
                        </Card>
                      );
                    })}
                  </View>
                ) : (
                  <Card style={styles.emptyCard}>
                    <AppText align="center" color={COLORS.textSecondary}>No Head-to-Head matches recorded.</AppText>
                  </Card>
                )}
              </View>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <View>
                <AppText size="sm" weight="bold" color={COLORS.textSecondary} style={styles.subSectionTitle}>
                  MATCH AND VENUE
                </AppText>
                <Card>
                  {match.referee && (
                    <View style={styles.detailRow}>
                      <AppText size="sm" weight="semibold" color={COLORS.textSecondary}>Referee</AppText>
                      <AppText size="sm">{match.referee}</AppText>
                    </View>
                  )}
                  {match.venueName && (
                    <View style={styles.detailRow}>
                      <AppText size="sm" weight="semibold" color={COLORS.textSecondary}>Venue</AppText>
                      <AppText size="sm">{match.venueName}</AppText>
                    </View>
                  )}
                  {match.venueCity && (
                    <View style={styles.detailRow}>
                      <AppText size="sm" weight="semibold" color={COLORS.textSecondary}>City</AppText>
                      <AppText size="sm">{match.venueCity}</AppText>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <AppText size="sm" weight="semibold" color={COLORS.textSecondary}>Matchday</AppText>
                    <AppText size="sm">Matchday {match.matchday}</AppText>
                  </View>
                  {match.score?.winner && (
                    <View style={styles.detailRow}>
                      <AppText size="sm" weight="semibold" color={COLORS.textSecondary}>Winner</AppText>
                      <AppText size="sm" weight="bold" color={COLORS.primary}>
                        {match.score.winner === 'HOME_TEAM' 
                          ? (match.homeTeam?.shortName || match.homeTeam?.name) 
                          : (match.awayTeam?.shortName || match.awayTeam?.name)}
                      </AppText>
                    </View>
                  )}
                </Card>
              </View>
            )}
          </>
        ) : null}
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
  placeholderButton: {
    width: 32,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  errorCard: {
    borderColor: '#FDE8E8',
    backgroundColor: '#FDF2F2',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  scoreBoardCard: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
    ...SHADOW,
  },
  compLabel: {
    marginBottom: SPACING.sm,
  },
  scoreBoardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubColumn: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamCrest: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: SPACING.sm,
  },
  crestPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clubName: {
    color: COLORS.textPrimary,
  },
  scoreColumn: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md - 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    ...SHADOW,
  },
  subSectionTitle: {
    marginVertical: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    ...SHADOW,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  /* Timeline styling */
  timelineCard: {
    paddingVertical: SPACING.lg,
    ...SHADOW,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineSide: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.sm,
  },
  timelineCenter: {
    flex: 0.6,
    alignItems: 'center',
  },
  timelineTimeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  eventBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'flex-end',
  },
  cardEventIcon: {
    width: 10,
    height: 14,
    borderRadius: 1,
    marginRight: 4,
  },
  /* Lineup Styling */
  lineupSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
    marginBottom: SPACING.sm,
  },
  lineupSegmentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md - 2,
  },
  activeLineupSegmentTab: {
    backgroundColor: COLORS.primary,
    ...SHADOW,
  },
  lineupDetailCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  lineupOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formationInfo: {
    flex: 1,
  },
  coachLineupDetails: {
    flex: 1.5,
  },
  playersListCard: {
    paddingVertical: 0,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  playerLineupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  jerseyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  lineupPlayerName: {
    flex: 1,
    color: COLORS.textPrimary,
  },
  /* H2H Styling */
  h2hMatchCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  h2hHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
    marginBottom: SPACING.sm,
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h2hTeamCol: {
    flex: 1.2,
  },
  h2hScoreCol: {
    flex: 0.8,
    alignItems: 'center',
  },
});
