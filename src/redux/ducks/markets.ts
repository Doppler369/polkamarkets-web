import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { environment } from 'config';
import dayjs from 'dayjs';
import inRange from 'lodash/inRange';
import isEmpty from 'lodash/isEmpty';
import omitBy from 'lodash/omitBy';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import { Market } from 'models/market';
import * as marketService from 'services/Polkamarkets/market';
import { MarketState } from 'types/market';

import { FavoriteMarketsByNetwork } from 'contexts/favoriteMarkets';

import { IFL } from 'hooks/useNetwork/currencies';
import networks from 'hooks/useNetwork/networks';

const AVAILABLE_NETWORKS_IDS = Object.keys(environment.NETWORKS);

const AVAILABLE_NETWORKS = Object.values(networks).filter(network =>
  AVAILABLE_NETWORKS_IDS.includes(network.id)
);

const isMarketFromAvailableNetwork = (market: Market) =>
  AVAILABLE_NETWORKS_IDS.includes(`${market.networkId}`);

export interface MarketsIntialState {
  markets: Market[];
  isLoading: {
    open: boolean;
    closed: boolean;
    resolved: boolean;
    favorites: boolean;
  };
  error: {
    open: any;
    closed: any;
    resolved: any;
    favorites: any;
  };
  searchQuery: string;
  filterByVerified: boolean;
  sorterByEndingSoon: boolean;
  sorter: {
    value: string;
    sortBy: any | undefined;
  };
}

const initialState: MarketsIntialState = {
  markets: [],
  isLoading: {
    open: false,
    closed: false,
    resolved: false,
    favorites: false
  },
  error: {
    open: null,
    closed: null,
    resolved: null,
    favorites: null
  },
  searchQuery: '',
  filterByVerified: true,
  sorterByEndingSoon: true,
  sorter: {
    value: 'featured',
    sortBy: undefined
  }
};

const marketsSlice = createSlice({
  name: 'markets',
  initialState,
  reducers: {
    request: (state, action) => ({
      ...state,
      isLoading: {
        ...state.isLoading,
        [action.payload]: true
      }
    }),
    success: {
      reducer: (
        state,
        action: PayloadAction<{
          type: MarketState | string;
          data: Market[];
        }>
      ) => ({
        ...state,
        markets: uniqBy(
          [...state.markets, ...action.payload.data],
          (market: Market) => `${market.networkId}${market.id}`
        ).filter(isMarketFromAvailableNetwork),
        isLoading: {
          ...state.isLoading,
          [action.payload.type]: false
        },
        error: {
          ...state.error,
          [action.payload.type]: null
        }
      }),
      prepare(type: MarketState | string, data: Market[]) {
        return {
          payload: {
            type,
            data: data.map(market => {
              const network = AVAILABLE_NETWORKS.find(
                ({ id }) => id === `${market.networkId}`
              );

              return {
                ...market,
                network: {
                  ...network,
                  currency: IFL
                }
              } as Market;
            })
          },
          type
        };
      }
    },
    error: (state, action) => ({
      ...state,
      markets: [],
      isLoading: {
        open: false,
        closed: false,
        resolved: false,
        favorites: false
      },
      error: {
        ...state.error,
        [action.payload.type]: action.payload.error
      }
    }),
    setSearchQuery: (state, action: PayloadAction<string>) => ({
      ...state,
      searchQuery: action.payload
    }),
    setFilterByVerified: (state, action: PayloadAction<boolean>) => ({
      ...state,
      filterByVerified: action.payload
    }),
    setSorterByEndingSoon: (state, action: PayloadAction<boolean>) => ({
      ...state,
      sorterByEndingSoon: action.payload
    }),
    setSorter: (state, action) => ({
      ...state,
      sorter: {
        value: action.payload.value,
        sortBy: action.payload.sortBy
      }
    }),
    changeMarketOutcomeData: (state, action) => ({
      ...state,
      markets: state.markets.map(market =>
        market.id === action.payload.marketId
          ? {
              ...market,
              outcomes: market.outcomes.map((outcome, outcomeIndex) =>
                outcomeIndex === action.payload.outcomeId
                  ? { ...outcome, ...action.payload.data }
                  : outcome
              )
            }
          : market
      )
    }),
    changeMarketQuestion: (state, action) => ({
      ...state,
      markets: state.markets.map(market =>
        market.id === action.payload.marketId
          ? {
              ...market,
              question: action.payload.question
            }
          : market
      )
    }),
    changeMarketVotesById: (state, action) => ({
      ...state,
      markets: state.markets.map(market =>
        market.id === action.payload.marketId
          ? {
              ...market,
              votes: action.payload.votes
            }
          : market
      )
    }),
    changeMarketData: (state, action) => ({
      ...state,
      markets: state.markets.map(market =>
        market.id === action.payload.marketId
          ? {
              ...market,
              ...action.payload.data
            }
          : market
      )
    })
  }
});

export default marketsSlice.reducer;

const {
  request,
  success,
  error,
  setFilterByVerified,
  setSorterByEndingSoon,
  setSearchQuery,
  setSorter,
  changeMarketOutcomeData,
  changeMarketQuestion,
  changeMarketVotesById,
  changeMarketData
} = marketsSlice.actions;

export {
  setFilterByVerified,
  setSorterByEndingSoon,
  setSearchQuery,
  setSorter,
  changeMarketOutcomeData,
  changeMarketQuestion,
  changeMarketVotesById,
  changeMarketData
};

type MarketsSelectorArgs = {
  state: MarketsIntialState;
  filters: {
    favorites: {
      checked: boolean;
      marketsByNetwork: FavoriteMarketsByNetwork;
    };
    networks: string[];
    countries: string[];
    stages: string[];
    states: string[];
  };
};

export const marketsSelector = ({ state, filters }: MarketsSelectorArgs) => {
  const regExpFromSearchQuery = new RegExp(state.searchQuery, 'i');

  const filterByFavorite = (id, networkId) =>
    filters.favorites.checked
      ? filters.favorites.marketsByNetwork[`${networkId}`] &&
        filters.favorites.marketsByNetwork[`${networkId}`].includes(id)
      : true;

  const filterByNetworkId = networkId =>
    !isEmpty(filters.networks)
      ? filters.networks.includes(`${networkId}`)
      : true;

  const filterByState = marketState =>
    !isEmpty(filters.states) ? filters.states.includes(marketState) : true;

  const filterByCountryInTitle = title =>
    !isEmpty(filters.countries)
      ? filters.countries.some(country =>
          title.toLowerCase().includes(country.toLowerCase())
        )
      : true;

  const filterMarketsByStageInTitle = title =>
    !isEmpty(filters.stages)
      ? filters.stages.some(stage =>
          title.toLowerCase().includes(stage.toLowerCase())
        )
      : true;

  const filterByisEndingSoon = expiresAt =>
    inRange(dayjs().diff(dayjs(expiresAt), 'hours'), -24, 1);

  function sorted(markets: Market[]) {
    if (state.sorter.sortBy) {
      if (state.sorterByEndingSoon) {
        return [
          ...markets.filter(market => filterByisEndingSoon(market.expiresAt)),
          ...orderBy(
            markets.filter(market => !filterByisEndingSoon(market.expiresAt)),
            [state.sorter.value],
            [state.sorter.sortBy]
          )
        ];
      }
      return orderBy(markets, [state.sorter.value], [state.sorter.sortBy]);
    }

    return markets;
  }

  return sorted(
    state.markets.filter(
      market =>
        (market.category.match(regExpFromSearchQuery) ||
          market.subcategory.match(regExpFromSearchQuery) ||
          market.title.match(regExpFromSearchQuery)) &&
        filterByFavorite(market.id, market.networkId) &&
        filterByNetworkId(market.networkId) &&
        filterByState(market.state) &&
        filterByCountryInTitle(market.title) &&
        filterMarketsByStageInTitle(market.title)
    )
  );
};

export function getMarkets(marketState: MarketState, networkId?: string) {
  return async dispatch => {
    dispatch(request(marketState));
    try {
      const response = await marketService.getMarkets({
        state: marketState,
        networkId
      });
      const { data } = response;
      dispatch(success(marketState, data));
    } catch (err) {
      dispatch(error({ type: marketState, error: err }));
    }
  };
}

export function getFavoriteMarketsByNetwork(ids: string[], networkId) {
  return async dispatch => {
    dispatch(request('favorites'));
    try {
      const response = await marketService.getMarketsByIds({ ids, networkId });
      const { data } = response;
      dispatch(success('favorites', data));
    } catch (err) {
      dispatch(error({ type: 'favorites', error: err }));
    }
  };
}

export function getFavoriteMarkets(favoriteMarkets: FavoriteMarketsByNetwork) {
  return async dispatch => {
    return Promise.all(
      Object.keys(omitBy(favoriteMarkets, isEmpty)).map(networkId =>
        dispatch(
          getFavoriteMarketsByNetwork(favoriteMarkets[networkId], networkId)
        )
      )
    );
  };
}
