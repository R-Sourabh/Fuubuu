/**
 * TypeScript Navigation Parameter Configurations.
 * Defines the parameters that each screen expects to receive.
 */

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CompetitionDetail: { code: string; name: string };
  TeamDetail: { id: number; name: string };
  MatchDetail: { id: number };
};

export type TabParamList = {
  HomeTab: undefined;
  CompetitionsTab: undefined;
  MatchesTab: undefined;
  FavoritesTab: undefined;
};
