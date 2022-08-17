import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import dayjs from 'dayjs';
import isNull from 'lodash/isNull';
import { getMarket, setChartViewType } from 'redux/ducks/market';
import { reset } from 'redux/ducks/trade';
import { openTradeForm } from 'redux/ducks/ui';

import { ArrowLeftIcon } from 'assets/icons';

import { Tabs, Table, Text, Button, SEO } from 'components';

import { useAppDispatch, useAppSelector, useNetwork } from 'hooks';
import NETWORKS from 'hooks/useNetwork/networks';

import MarketAnalytics from './MarketAnalytics';
import MarketChart from './MarketChart';
import MarketChartViewSelector from './MarketChartViewSelector';
import MarketHead from './MarketHead';
import MarketNews from './MarketNews';
import MarketStats from './MarketStats';
import { formatMarketPositions, formatSEODescription } from './utils';

type Params = {
  marketId: string;
};

const Market = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const currency = useAppSelector(state => state.market.market.currency);
  const { symbol, ticker } = currency;
  const { network } = useNetwork();
  const { marketId } = useParams<Params>();
  const { market, isLoading, error } = useAppSelector(state => state.market);
  const { actions, bondActions, networkId } = useAppSelector(
    state => state.bepro
  );
  const [activeTab, setActiveTab] = useState('positions');
  const [retries, setRetries] = useState(0);
  const resolveMarketNetwork = Object.values(NETWORKS).filter(
    ({ id }) => id === market.networkId.toString()
  )[0];
  const resolvedEmptyDataDescription =
    network.id === market.networkId.toString()
      ? 'You have no positions.'
      : `Switch network to ${resolveMarketNetwork?.name} to see your market positions.`;

  useEffect(() => {
    async function fetchMarket() {
      dispatch(reset());
      await dispatch(getMarket(marketId));
      dispatch(setChartViewType('marketOverview'));
      dispatch(openTradeForm());
    }

    fetchMarket();
  }, [dispatch, marketId, retries]);

  useEffect(() => {
    function goToHomePage() {
      history.push('/?m=f');
      window.location.reload();
    }

    if (!isLoading && !isNull(error) && error.response.status === 404) {
      // Market not found
      goToHomePage();
    } else if (!isLoading && !isNull(error)) {
      // 500 error, retrying 3 times
      if (retries < 3) {
        setRetries(retries + 1);
      } else {
        goToHomePage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    error,
    history,
    isLoading,
    market.id,
    market.networkId,
    network.id,
    networkId
  ]);

  if (!market || market.id === '' || isLoading)
    return (
      <div className="pm-market__loading">
        <span className="spinner--primary" />
      </div>
    );

  const tableItems = formatMarketPositions(
    (actions as any).filter(action => action.marketId === market?.id),
    (bondActions as any).filter(
      action => action.questionId === market?.questionId
    ),
    market,
    symbol || ticker,
    network
  );

  return (
    <div className="pm-p-market">
      <SEO
        title={market.title}
        description={formatSEODescription(
          market.category,
          market.subcategory,
          market.expiresAt
        )}
        imageUrl={market.bannerUrl}
      />
      <div className="pm-p-market__analytics">
        <MarketAnalytics
          liquidity={market.liquidity}
          volume={market.volume}
          expiration={dayjs(market.expiresAt)
            .utc()
            .format('YYYY-MM-DD HH:mm UTC')}
        />
      </div>
      <div className="pm-p-market__market">
        <MarketHead
          isVerified={market.verified}
          section={market.category}
          subsection={market.subcategory}
          imageUrl={market.imageUrl}
          description={market.title}
        />
      </div>
      <div className="pm-p-market__actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => history.push('/')}
          aria-label="Back to Markets"
        >
          <ArrowLeftIcon />
          Back to Markets
        </Button>
      </div>
      <div className="pm-p-market__view">
        {market.tradingViewSymbol ? <MarketChartViewSelector /> : null}
      </div>
      <div className="pm-p-market__charts">
        <MarketChart />
      </div>
      <div className="pm-p-market__stats">
        <MarketStats market={market} />
      </div>
      {market.resolutionSource ? (
        <div className="pm-p-market__source">
          <Text
            as="p"
            scale="tiny"
            fontWeight="semibold"
            style={{ margin: '0.8rem 0rem' }}
            color="lighter-gray"
          >
            {`Resolution source: `}
            <a
              href={market.resolutionSource}
              target="_blank"
              className="tiny semibold text-primary"
              rel="noreferrer"
            >
              {market.resolutionSource}
            </a>
          </Text>
        </div>
      ) : null}
      <div className="pm-p-market__tabs">
        <Tabs value={activeTab} onChange={tab => setActiveTab(tab)}>
          <Tabs.TabPane tab="Positions" id="positions">
            <Table
              columns={tableItems.columns}
              rows={tableItems.rows}
              isLoadingData={isLoading}
              emptyDataDescription={resolvedEmptyDataDescription}
            />
          </Tabs.TabPane>
          {market.news && market.news.length > 0 ? (
            <Tabs.TabPane tab="News (Beta)" id="news">
              <MarketNews news={market.news} />
            </Tabs.TabPane>
          ) : null}
        </Tabs>
      </div>
    </div>
  );
};

Market.displayName = 'Market';

export default Market;
