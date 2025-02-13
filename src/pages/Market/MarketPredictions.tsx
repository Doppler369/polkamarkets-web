import { useCallback, useEffect, useState } from 'react';

import { reset, selectOutcome } from 'redux/ducks/trade';
import { useTheme } from 'ui';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalHeaderHide,
  ModalHeaderTitle,
  Trade
} from 'components';
import { TradePredictions } from 'components/Trade';

import { useAppDispatch, useAppSelector, useTrade } from 'hooks';

import styles from './Market.module.scss';
import MarketShares from './MarketShares';

function MarketPredictions() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { trade, status } = useTrade();

  const marketId = useAppSelector(state => state.market.market.id);
  const marketNetworkId = useAppSelector(
    state => state.market.market.networkId
  );

  const [tradeVisible, setTradeVisible] = useState(false);

  useEffect(() => {
    if (
      status === 'error' &&
      trade.market === marketId &&
      trade.network === marketNetworkId
    ) {
      dispatch(selectOutcome(trade.market, trade.network, trade.outcome));
      setTradeVisible(true);
    }
  }, [
    dispatch,
    marketId,
    marketNetworkId,
    status,
    trade.market,
    trade.network,
    trade.outcome
  ]);

  const handleCloseTrade = useCallback(() => {
    dispatch(reset());
    setTradeVisible(false);
  }, [dispatch]);

  const handlePredictionSelected = useCallback(() => {
    if (tradeVisible) return;
    setTradeVisible(true);
  }, [tradeVisible]);

  return (
    <>
      <MarketShares onSellSelected={handlePredictionSelected} />
      <div className={styles.predictions}>
        <p className={styles.predictionsTitle}>Select your prediction</p>
        <TradePredictions
          view="default"
          size="lg"
          onPredictionSelected={handlePredictionSelected}
        />
        <Modal
          show={tradeVisible}
          onHide={handleCloseTrade}
          {...(theme.device.isDesktop
            ? { centered: true }
            : {
                fullWidth: true,
                initial: { bottom: '-100%' },
                animate: { left: 0, bottom: 0 },
                exit: { bottom: '-100%' },
                className: {
                  dialog: styles.sidebarDialog
                }
              })}
        >
          <ModalContent className={styles.tradeModalContent}>
            <ModalHeader className={styles.tradeModalHeader}>
              <ModalHeaderHide onClick={handleCloseTrade} />
              <ModalHeaderTitle className={styles.tradeModalHeaderTitle}>
                Make your prediction
              </ModalHeaderTitle>
            </ModalHeader>
            <Trade view="modal" onTradeFinished={handleCloseTrade} />
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}

export default MarketPredictions;
