import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import cn from 'classnames';
import { ui, features } from 'config';
import type { Market as MarketInterface } from 'models/market';
import type { Action } from 'redux/ducks/polkamarkets';
import { Adornment, Container, useTheme } from 'ui';
import Spinner from 'ui/Spinner';

import {
  Tabs,
  Table,
  Text,
  SEO,
  AlertMini,
  ButtonGroup,
  RightSidebar,
  Modal,
  Button,
  VoteArrows,
  Icon,
  Feature
} from 'components';

import {
  useAppDispatch,
  useAppSelector,
  useMarketForms,
  useNetwork
} from 'hooks';

import marketClasses from './Market.module.scss';
import MarketAbout from './MarketAbout';
import MarketActivity from './MarketActivity';
import MarketAnalytics from './MarketAnalytics';
import MarketChart from './MarketChart';
import MarketComments from './MarketComments';
import MarketHead from './MarketHead';
import MarketNews from './MarketNews';
import MarketPredictions from './MarketPredictions';
import MarketRelatedQuestions from './MarketRelatedQuestions';
import MarketTitle from './MarketTitle';
import { Column, formatMarketPositions, formatSEODescription } from './utils';

const forms = {
  liquidityForm: 'Liquidity',
  reportForm: 'Report',
  tradeForm: 'Trade'
};

function SidebarWrapper({
  children
}: React.PropsWithChildren<Record<string, unknown>>) {
  const [show, setShow] = useState(false);
  const handleHide = useCallback(() => setShow(false), []);
  const form = useMarketForms();

  return (
    <Container $enableGutters className={marketClasses.sectionTrade}>
      <Button color="primary" size="sm" fullwidth onClick={() => setShow(true)}>
        {forms[form]}
      </Button>
      <Modal
        disableGutters
        show={show}
        onHide={handleHide}
        fullWidth
        initial={{ bottom: '-100%' }}
        animate={{ bottom: 0 }}
        exit={{ bottom: '-100%' }}
        className={{
          dialog: marketClasses.sidebarDialog
        }}
      >
        <Container $as="header" className={marketClasses.sidebarDialogHeader}>
          <Text
            scale="heading"
            fontWeight="bold"
            className={marketClasses.sidebarDialogHeaderTitle}
          >
            Select Outcome
          </Text>
          <Adornment $edge="end">
            <Button
              size="xs"
              variant="ghost"
              color="default"
              aria-label="Settings"
              onClick={handleHide}
            >
              <Icon name="Cross" size="lg" />
            </Button>
          </Adornment>
        </Container>
        {children}
      </Modal>
    </Container>
  );
}
function MarketUI() {
  const network = useNetwork();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const hasSidebar = useAppSelector(state => state.ui.rightSidebar.visible);
  const actions = useAppSelector(state => state.polkamarkets.actions);
  const bondActions = useAppSelector(state => state.polkamarkets.bondActions);
  const market = useAppSelector(state => state.market.market);
  const chartViews = useAppSelector(state => state.market.chartViews);
  const [tab, setTab] = useState(
    features.fantasy.enabled ? 'relatedQuestions' : 'positions'
  );

  const handleChartChange = useCallback(
    async (type: string) => {
      const { setChartViewType } = await import('redux/ducks/market');

      dispatch(setChartViewType(type));
    },
    [dispatch]
  );

  const columns = useMemo(
    () =>
      [
        { title: 'Outcome', key: 'outcome', align: 'left' },
        { title: 'Date', key: 'date', align: 'right' },
        { title: 'Price', key: 'price', align: 'right' },
        { title: 'Shares', key: 'shares', align: 'right' },
        { title: 'Total Value', key: 'value', align: 'right' },
        { title: 'Trade Type', key: 'tradeType', align: 'center' },
        { title: 'TX', key: 'transactionHash', align: 'right' }
      ].filter(column => {
        if (!theme.device.isDesktop) {
          return ['outcome', 'shares', 'tradeType'].includes(column.key);
        }

        if (features.fantasy.enabled) {
          return !['shares', 'transactionHash'].includes(column.key);
        }

        return true;
      }) as Column[],
    [theme.device.isDesktop]
  );

  const rowsToOmit = useMemo(() => {
    if (!theme.device.isDesktop) {
      return ['date', 'price', 'value', 'transactionHash'];
    }

    if (features.fantasy.enabled) {
      return ['transactionHash', 'shares'];
    }

    return [];
  }, [theme.device.isDesktop]);

  const tableItems = formatMarketPositions<Action, MarketInterface['outcomes']>(
    columns,
    actions.filter(action => action.marketId === +market.id),
    bondActions.filter(action => action.questionId === market.questionId),
    market.outcomes,
    market.token.ticker,
    network.network,
    rowsToOmit
  );

  const SidebarWrapperComponent = theme.device.isDesktop
    ? Fragment
    : SidebarWrapper;
  const tabPositions = useMemo(
    () =>
      network.network.id.toString() !== market.networkId.toString() ? (
        <AlertMini
          styles="outline"
          variant="information"
          description={`Switch network to ${market.network.name} and see your market positions.`}
        />
      ) : (
        <Table
          columns={tableItems.columns}
          rows={tableItems.rows}
          emptyDataDescription="No positions."
        />
      ),
    [
      market.network.name,
      market.networkId,
      network.network.id,
      tableItems.columns,
      tableItems.rows
    ]
  );

  return (
    <div className={cn(marketClasses.root, 'max-width-screen-xl')}>
      <div className={marketClasses.body}>
        <SEO
          title={market.title}
          description={formatSEODescription(
            market.category,
            market.subcategory,
            market.expiresAt
          )}
          image={market.bannerUrl}
        />
        <MarketHead />
        <Container $enableGutters>
          <Feature name="fantasy">
            {market.state === 'open' ? <MarketPredictions /> : null}
          </Feature>
          {market.tradingViewSymbol && (
            <div className="pm-p-market__view">
              <div className="market-chart__view-selector">
                <ButtonGroup
                  buttons={chartViews}
                  defaultActiveId="marketOverview"
                  onChange={handleChartChange}
                />
              </div>
            </div>
          )}
          <MarketChart />
          <Feature name="regular">
            {market.resolutionSource && (
              <div className="pm-p-market__source">
                <Text
                  as="p"
                  scale="tiny"
                  fontWeight="semibold"
                  style={{ margin: '0.8rem 0rem' }}
                  color="lighter-gray"
                >
                  Resolution source:{' '}
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
            )}
          </Feature>
          {!theme.device.isDesktop && <MarketAnalytics />}
          {market.description && (
            <MarketAbout>{market.description}</MarketAbout>
          )}
          {ui.market.voting.enabled && !theme.device.isDesktop && (
            <section className={marketClasses.section}>
              <MarketTitle>Vote to verify</MarketTitle>
              <VoteArrows
                size="md"
                marketId={market.id}
                marketSlug={market.slug}
                marketNetworkId={market.network.id}
                votes={market.votes}
              />
            </section>
          )}
          <section className={`pm-p-market__tabs ${marketClasses.section}`}>
            <Tabs
              value={tab}
              onChange={setTab}
              className={{
                header: marketClasses.tabsHeader
              }}
            >
              <Tabs.TabPane tab="Related questions" id="relatedQuestions">
                <MarketRelatedQuestions markets={market.relatedMarkets} />
              </Tabs.TabPane>
              {features.fantasy.enabled && ui.socialLogin.enabled ? (
                <Tabs.TabPane tab="Activity" id="activity">
                  <MarketActivity />
                </Tabs.TabPane>
              ) : null}
              {features.fantasy.enabled &&
              ui.socialLogin.enabled &&
              ui.comments.enabled ? (
                <Tabs.TabPane tab="Comments" id="comments">
                  <MarketComments />
                </Tabs.TabPane>
              ) : null}
              <Tabs.TabPane tab="Positions" id="positions">
                {tabPositions}
              </Tabs.TabPane>
              {theme.device.isDesktop && ui.market.news.enabled ? (
                <Tabs.TabPane tab="News" id="news">
                  {market.news?.length ? (
                    <MarketNews news={market.news} />
                  ) : (
                    <AlertMini
                      styles="outline"
                      variant="information"
                      description="There's no news to be shown."
                    />
                  )}
                </Tabs.TabPane>
              ) : null}
            </Tabs>
          </section>
        </Container>
      </div>
      {hasSidebar && (
        <SidebarWrapperComponent>
          <RightSidebar />
        </SidebarWrapperComponent>
      )}
    </div>
  );
}
export default function Market() {
  const network = useNetwork();
  const history = useHistory();
  const params = useParams<Record<'marketId', string>>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.market.isLoading);
  const error = useAppSelector(state => state.market.error);
  const market = useAppSelector(state => state.market.market);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    (async function handleMarket() {
      const { openTradeForm } = await import('redux/ducks/ui');
      const { getMarket, setChartViewType } = await import(
        'redux/ducks/market'
      );

      if (features.regular.enabled) {
        dispatch(openTradeForm());
      }

      dispatch(getMarket(params.marketId));
      dispatch(setChartViewType('marketOverview'));
    })();

    return () => {
      (async function handleResetMarket() {
        const { reset } = await import('redux/ducks/trade');

        dispatch(reset());
      })();
    };
  }, [dispatch, params.marketId, retries]);
  useEffect(() => {
    async function handleHome() {
      const { pages } = await import('config');

      history.push(
        `${pages.home.pathname}${ui.layout.disclaimer.enabled ? '?m=f' : ''}`
      );
      window.location.reload();
    }

    if (!isLoading && error) {
      if (error.response?.status === 404) handleHome();
      else if (retries < 3) setRetries(prevRetries => prevRetries + 1);
      else handleHome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    error,
    history,
    isLoading,
    market.id,
    market.networkId,
    network.network.id
  ]);

  if (isLoading) return <Spinner />;
  return <MarketUI />;
}
