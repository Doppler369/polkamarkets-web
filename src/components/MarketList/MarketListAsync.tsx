import { useEffect, useCallback } from 'react';

import {
  getFavoriteMarkets,
  getMarkets,
  marketsSelector
} from 'redux/ducks/markets';
import { useAppDispatch } from 'redux/store';
import { useRect } from 'ui';

import { InfoIcon } from 'assets/icons';

import Footer from 'components/Footer';

import { useAppSelector, useFavoriteMarkets, useFilters } from 'hooks';

import { Button } from '../Button';
import Text from '../Text';
import MarketList from './MarketList';

export default function MarketListAsync() {
  const [ref, rect] = useRect();
  const dispatch = useAppDispatch();
  const filters = useFilters();
  const favoriteMarkets = useFavoriteMarkets();
  const markets = useAppSelector(state =>
    marketsSelector({
      state: state.markets,
      filters: {
        ...filters.selected.dropdowns,
        favorites: {
          checked: filters.state.favorites.checked,
          marketsByNetwork: favoriteMarkets.favoriteMarkets
        }
      }
    })
  );
  const isLoading = useAppSelector(state =>
    Object.values(state.markets.isLoading).some(Boolean)
  );
  const error = useAppSelector(state =>
    Object.values(state.markets.error).some(
      value => value !== null && value.message !== 'canceled'
    )
  );
  const handleMarkets = useCallback(async () => {
    dispatch(getMarkets('open'));
    dispatch(getMarkets('closed'));
    dispatch(getMarkets('resolved'));
    dispatch(getFavoriteMarkets(favoriteMarkets.favoriteMarkets));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  // prettier-ignore
  // eslint-disable-next-line no-nested-ternary
  const state = isLoading ? 'loading' : error ? 'error' : !markets.length ? 'warning' : 'success'

  useEffect(() => {
    handleMarkets();
  }, [handleMarkets]);

  return (
    <div
      ref={ref}
      className="pm-c-market-list"
      {...(state !== 'success' && {
        style: { display: 'flex', flexFlow: 'column nowrap' }
      })}
    >
      {
        {
          loading: (
            <div className="pm-c-market-list__empty-state">
              <div className="pm-c-market-list__empty-state__body">
                <span className="spinner--primary" />
              </div>
            </div>
          ),
          error: (
            <div className="pm-c-market-list__error">
              <div className="pm-c-market-list__error__body">
                <InfoIcon />
                <Text
                  as="p"
                  scale="tiny"
                  fontWeight="semibold"
                  className="pm-c-market-list__empty-state__body-description"
                >
                  Error fetching markets
                </Text>
              </div>
              <div className="pm-c-market-list__error__actions">
                <Button color="primary" size="sm" onClick={handleMarkets}>
                  Try again
                </Button>
              </div>
            </div>
          ),
          warning: (
            <div className="pm-c-market-list__empty-state">
              <div className="pm-c-market-list__empty-state__body">
                <InfoIcon />
                <Text
                  as="p"
                  scale="tiny"
                  fontWeight="semibold"
                  className="pm-c-market-list__empty-state__body-description"
                >
                  There are no available markets for this category.
                </Text>
              </div>
            </div>
          ),
          success: <MarketList markets={markets} rect={rect} />
        }[state]
      }
      {state !== 'success' && <Footer style={{ marginTop: 'auto' }} />}
    </div>
  );
}
