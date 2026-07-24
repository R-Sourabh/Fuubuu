import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { useTeamDetail } from '../hooks/useTeamDetail';
import { useTeamPlayers } from '../hooks/useTeamPlayers';
import { useTeamCoaches } from '../hooks/useTeamCoaches';
import { useTeamTransfers } from '../hooks/useTeamTransfers';
import { useFavoritesStore } from '../store/favoritesStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDetail'>;
type TeamTabType = 'squad' | 'transfers' | 'stadium';

export function TeamDetailScreen({ route, navigation }: Props) {
  const { id, name } = route.params;
  const [activeTab, setActiveTab] = useState<TeamTabType>('squad');

  const { data: team, isLoading: teamLoading, error: teamError } = useTeamDetail(id);
  const { data: players, isLoading: playersLoading } = useTeamPlayers(id, 2023);
  const { data: coaches, isLoading: coachesLoading } = useTeamCoaches(id);
  const { data: transfers, isLoading: transfersLoading } = useTeamTransfers(id);

  const { favoriteTeamIds, toggleFavoriteTeam } = useFavoritesStore();
  const isFav = favoriteTeamIds.includes(id);

  const activeCoach = coaches?.[0];

  // Group players by position
  const groupedPlayers = React.useMemo(() => {
    if (!players) return { Goalkeepers: [], Defenders: [], Midfielders: [], Attackers: [], Others: [] };
    
    return {
      Goalkeepers: players.filter((p) => p.position === 'Goalkeeper'),
      Defenders: players.filter((p) => p.position === 'Defender'),
      Midfielders: players.filter((p) => p.position === 'Midfielder'),
      Attackers: players.filter((p) => p.position === 'Attacker'),
      Others: players.filter((p) => !['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].includes(p.position)),
    };
  }, [players]);

  const isLoading = teamLoading;

  if (isLoading && !team) {
    return (
      <Container>
        <Loader message="Loading club profile..." />
      </Container>
    );
  }

  return (
    <Container>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>
        <AppText size="lg" weight="bold" color={COLORS.primary} numberOfLines={1} style={styles.barTitle}>
          {team?.name || name}
        </AppText>
        <Pressable onPress={() => toggleFavoriteTeam(id)} style={styles.starButton}>
          <Ionicons 
            name={isFav ? "star" : "star-outline"} 
            size={24} 
            color={isFav ? COLORS.accent : COLORS.primary} 
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner with Logo and Crest */}
        <Card style={styles.clubBannerCard}>
          <View style={styles.bannerRow}>
            {team?.crest ? (
              <Image source={{ uri: team.crest }} style={styles.clubCrest} />
            ) : (
              <View style={styles.crestPlaceholder}>
                <Ionicons name="shield-outline" size={48} color={COLORS.primary} />
              </View>
            )}

            <View style={styles.bannerInfo}>
              <AppText size="xl" weight="bold" color={COLORS.textPrimary}>
                {team?.name || name}
              </AppText>
              <AppText size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {team?.country || 'International'} • Founded {team?.founded || 'N/A'}
              </AppText>
              {team?.tla && (
                <Badge label={team.tla} type="neutral" style={styles.tlaBadge} />
              )}
            </View>
          </View>
        </Card>

        {/* Coach Details Section */}
        {activeCoach && (
          <View style={styles.section}>
            <AppText size="sm" weight="semibold" color={COLORS.textSecondary} style={styles.sectionTitle}>
              TEAM MANAGER
            </AppText>
            <Card style={styles.coachCard}>
              <View style={styles.coachContent}>
                {activeCoach.photo ? (
                  <Image source={{ uri: activeCoach.photo }} style={styles.coachPhoto} />
                ) : (
                  <View style={styles.coachPhotoPlaceholder}>
                    <Ionicons name="person" size={24} color={COLORS.textLight} />
                  </View>
                )}
                
                <View style={styles.coachDetails}>
                  <AppText weight="bold" size="md" color={COLORS.textPrimary}>
                    {activeCoach.name}
                  </AppText>
                  <AppText size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                    Age: {activeCoach.age} • {activeCoach.nationality}
                  </AppText>
                  <Badge label="Head Coach" type="neutral" style={{ marginTop: SPACING.xs, alignSelf: 'flex-start' }} />
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Tab Selection Row */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActiveTab('squad')}
            style={[styles.tab, activeTab === 'squad' && styles.activeTab]}
          >
            <AppText
              weight="bold"
              size="sm"
              color={activeTab === 'squad' ? COLORS.textPrimary : COLORS.textSecondary}
            >
              Squad Roster
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('transfers')}
            style={[styles.tab, activeTab === 'transfers' && styles.activeTab]}
          >
            <AppText
              weight="bold"
              size="sm"
              color={activeTab === 'transfers' ? COLORS.textPrimary : COLORS.textSecondary}
            >
              Transfers
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('stadium')}
            style={[styles.tab, activeTab === 'stadium' && styles.activeTab]}
          >
            <AppText
              weight="bold"
              size="sm"
              color={activeTab === 'stadium' ? COLORS.textPrimary : COLORS.textSecondary}
            >
              Stadium
            </AppText>
          </Pressable>
        </View>

        {/* Tab Contents */}
        {activeTab === 'squad' && (
          <View>
            {playersLoading ? (
              <Loader message="Loading players squad..." />
            ) : players && players.length > 0 ? (
              Object.entries(groupedPlayers).map(([positionGroup, playerList]) => {
                if (playerList.length === 0) return null;
                return (
                  <View key={positionGroup} style={styles.positionSection}>
                    <AppText size="sm" weight="bold" color={COLORS.primary} style={styles.positionTitle}>
                      {positionGroup}
                    </AppText>
                    
                    <Card style={styles.squadCard}>
                      {playerList.map((player, idx) => (
                        <View 
                          key={player.id} 
                          style={[
                            styles.playerRow,
                            idx === playerList.length - 1 && { borderBottomWidth: 0 }
                          ]}
                        >
                          <Image source={{ uri: player.photo }} style={styles.playerPhoto} />
                          <View style={styles.playerInfo}>
                            <AppText size="sm" weight="semibold">
                              {player.name}
                            </AppText>
                            <AppText size="xs" color={COLORS.textLight}>
                              {player.nationality} • Age {player.age}
                            </AppText>
                          </View>
                          <Badge label={player.position} type="neutral" />
                        </View>
                      ))}
                    </Card>
                  </View>
                );
              })
            ) : (
              <Card style={styles.emptyCard}>
                <AppText align="center" color={COLORS.textSecondary}>No players squad available.</AppText>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'transfers' && (
          <View>
            {transfersLoading ? (
              <Loader message="Loading transfer records..." />
            ) : transfers && transfers.length > 0 ? (
              <View>
                {transfers.map((item, idx) => {
                  const latest = item.transfers?.[0];
                  if (!latest) return null;
                  const isIncoming = latest.teams.in.id === id;
                  
                  return (
                    <Card key={`${item.player.id}-${idx}`} style={styles.transferCard}>
                      <View style={styles.transferHeader}>
                        <View style={styles.playerLabel}>
                          <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} style={{ marginRight: 6 }} />
                          <AppText weight="bold" size="md">
                            {item.player.name}
                          </AppText>
                        </View>
                        <Badge 
                          label={isIncoming ? 'IN' : 'OUT'} 
                          type={isIncoming ? 'live' : 'neutral'} 
                        />
                      </View>

                      <View style={styles.transferPath}>
                        <View style={styles.transferTeam}>
                          {latest.teams.out.logo && (
                            <Image source={{ uri: latest.teams.out.logo }} style={styles.transferLogo} />
                          )}
                          <AppText size="xs" color={COLORS.textSecondary} numberOfLines={1} align="center">
                            {latest.teams.out.name}
                          </AppText>
                        </View>

                        <Ionicons name="arrow-forward-sharp" size={20} color={COLORS.textLight} style={{ marginHorizontal: SPACING.md }} />

                        <View style={styles.transferTeam}>
                          {latest.teams.in.logo && (
                            <Image source={{ uri: latest.teams.in.logo }} style={styles.transferLogo} />
                          )}
                          <AppText size="xs" color={COLORS.textSecondary} numberOfLines={1} align="center">
                            {latest.teams.in.name}
                          </AppText>
                        </View>
                      </View>

                      <View style={styles.transferFooter}>
                        <AppText size="xs" color={COLORS.textLight}>
                          Type: {latest.type}
                        </AppText>
                        <AppText size="xs" color={COLORS.textLight}>
                          Date: {latest.date}
                        </AppText>
                      </View>
                    </Card>
                  );
                })}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <AppText align="center" color={COLORS.textSecondary}>No transfers recorded recently.</AppText>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'stadium' && (
          <View>
            {team?.venue ? (
              <Card style={styles.stadiumCard}>
                {team.venueImage && (
                  <Image source={{ uri: team.venueImage }} style={styles.stadiumImage} />
                )}
                
                <View style={styles.stadiumDetails}>
                  <AppText weight="bold" size="lg" color={COLORS.textPrimary}>
                    {team.venue}
                  </AppText>
                  
                  {team.address && (
                    <View style={styles.stadiumRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                      <AppText size="sm" color={COLORS.textSecondary}>
                        {team.address}
                      </AppText>
                    </View>
                  )}

                  {team.venueCapacity && (
                    <View style={styles.stadiumRow}>
                      <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                      <AppText size="sm" color={COLORS.textSecondary}>
                        Capacity: {team.venueCapacity.toLocaleString()} seats
                      </AppText>
                    </View>
                  )}
                </View>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <AppText align="center" color={COLORS.textSecondary}>No venue information available.</AppText>
              </Card>
            )}
          </View>
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
  clubBannerCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubCrest: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginRight: SPACING.lg,
  },
  crestPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  bannerInfo: {
    flex: 1,
  },
  tlaBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  coachCard: {
    padding: SPACING.md,
    ...SHADOW,
  },
  coachContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.md,
  },
  coachPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  coachDetails: {
    flex: 1,
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
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  positionSection: {
    marginBottom: SPACING.md,
  },
  positionTitle: {
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  squadCard: {
    paddingVertical: 0,
    ...SHADOW,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.sm,
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transferCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  playerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transferPath: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  transferTeam: {
    flex: 1,
    alignItems: 'center',
  },
  transferLogo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  transferFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },
  stadiumCard: {
    padding: 0,
    overflow: 'hidden',
    ...SHADOW,
  },
  stadiumImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  stadiumDetails: {
    padding: SPACING.md,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorCard: {
    borderColor: '#FDE8E8',
    backgroundColor: '#FDF2F2',
  },
});
