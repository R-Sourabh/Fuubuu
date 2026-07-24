import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, TextInput, Image, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Container } from '../components/common/Container';
import { AppText } from '../components/common/AppText';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { useCompetitions } from '../hooks/useCompetitions';
import { useCountries } from '../hooks/useMeta';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export function CompetitionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: competitions, isLoading: leaguesLoading, error: leaguesError } = useCompetitions();
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Filter leagues based on search query and country selection
  const filteredCompetitions = useMemo(() => {
    if (!competitions) return [];
    return competitions.filter((comp) => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comp.area?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = !selectedCountry || comp.area?.name === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [competitions, searchQuery, selectedCountry]);

  // Extract popular countries from the list that actually have competitions in our list
  const activeCountries = useMemo(() => {
    if (!competitions || !countries) return [];
    const compCountries = new Set(competitions.map(c => c.area?.name).filter(Boolean));
    return countries.filter(c => compCountries.has(c.name));
  }, [competitions, countries]);

  const isLoading = leaguesLoading || countriesLoading;

  if (isLoading && !competitions) {
    return (
      <Container>
        <Loader message="Loading leagues & countries..." />
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.header}>
        <AppText size="xl" weight="bold" color={COLORS.primary}>
          Football Leagues
        </AppText>
        <AppText size="sm" color={COLORS.textSecondary}>
          Browse standings and top scorers worldwide
        </AppText>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          placeholder="Search leagues or countries..."
          placeholderTextColor={COLORS.textLight}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </Pressable>
        )}
      </View>

      {/* Country Filters Horizontal Scroll */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            onPress={() => setSelectedCountry(null)}
            style={[
              styles.filterChip,
              !selectedCountry && styles.activeFilterChip
            ]}
          >
            <AppText
              size="xs"
              weight="semibold"
              color={!selectedCountry ? COLORS.textOnPrimary : COLORS.textSecondary}
            >
              All Countries
            </AppText>
          </Pressable>

          {activeCountries.map((country) => (
            <Pressable
              key={country.name}
              onPress={() => setSelectedCountry(country.name)}
              style={[
                styles.filterChip,
                selectedCountry === country.name && styles.activeFilterChip
              ]}
            >
              {country.flag && (
                <Image source={{ uri: country.flag }} style={styles.chipFlag} />
              )}
              <AppText
                size="xs"
                weight="semibold"
                color={selectedCountry === country.name ? COLORS.textOnPrimary : COLORS.textSecondary}
              >
                {country.name}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Leagues Listing */}
      <FlatList
        data={filteredCompetitions}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          leaguesError ? (
            <Card style={styles.errorCard}>
              <AppText color={COLORS.live} weight="bold">Failed to load leagues</AppText>
              <AppText size="xs" color={COLORS.textSecondary}>Please ensure your API-Football credentials are set.</AppText>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="information-circle-outline" size={40} color={COLORS.textLight} />
              <AppText align="center" color={COLORS.textSecondary} style={{ marginTop: SPACING.sm }}>
                No leagues match your criteria.
              </AppText>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('CompetitionDetail', { code: item.code, name: item.name })
            }
            style={styles.leagueCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.logoContainer}>
                {item.logo ? (
                  <Image source={{ uri: item.logo }} style={styles.leagueLogo} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="trophy-outline" size={24} color={COLORS.primary} />
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <AppText weight="bold" size="md" color={COLORS.textPrimary}>
                  {item.name}
                </AppText>
                
                <View style={styles.countryRow}>
                  {item.countryFlag && (
                    <Image source={{ uri: item.countryFlag }} style={styles.countryFlag} />
                  )}
                  <AppText size="xs" color={COLORS.textSecondary}>
                    {item.area?.name || 'International'}
                  </AppText>
                </View>
              </View>
              
              <Badge label={item.type || 'LEAGUE'} type="neutral" />
            </View>
          </Card>
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipFlag: {
    width: 16,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
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
  leagueCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    ...SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leagueLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  countryFlag: {
    width: 14,
    height: 10,
    borderRadius: 1,
    marginRight: 6,
  },
});
