import { useEffect } from 'react';

import { getMarkets } from 'redux/ducks/markets';
import { getPortfolio } from 'redux/ducks/portfolio';
import { closeRightSidebar } from 'redux/ducks/ui';

import { useAppDispatch, useAppSelector, useNetwork } from 'hooks';

import PortfolioAnalytics from './PortfolioAnalytics';
import PortfolioChart from './PortfolioChart';
import PortfolioTabs from './PortfolioTabs';

const PortfolioPage = () => {
  const dispatch = useAppDispatch();
  const { network } = useNetwork();

  const rightSidebarIsVisible = useAppSelector(
    state => state.ui.rightSidebar.visible
  );

  const ethAddress = useAppSelector(state => state.polkamarkets.ethAddress);

  useEffect(() => {
    if (rightSidebarIsVisible) {
      dispatch(closeRightSidebar());
    }
    dispatch(getMarkets('open', network.id));
    dispatch(getMarkets('closed', network.id));
    dispatch(getMarkets('resolved', network.id));
  }, [rightSidebarIsVisible, dispatch, network.id]);

  useEffect(() => {
    if (ethAddress) {
      dispatch(getPortfolio(ethAddress, network.id));
    }
  }, [ethAddress, dispatch, network.id]);

  return (
    <div className="portfolio-page">
      <PortfolioAnalytics />
      <PortfolioChart />
      <PortfolioTabs />
    </div>
  );
};

export default PortfolioPage;
