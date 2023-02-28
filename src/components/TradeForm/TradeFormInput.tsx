import React, { useEffect, useState, useCallback } from 'react';

import {
  setTradeAmount,
  setMaxAmount,
  setTradeDetails
} from 'redux/ducks/trade';

import { WalletIcon } from 'assets/icons';

import {
  useAppSelector,
  useAppDispatch,
  useNetwork,
  useERC20Balance,
  usePolkamarketsService
} from 'hooks';

import { Button } from '../Button';
import StepSlider from '../StepSlider';
import Text from '../Text';
import { calculateTradeDetails } from './utils';

function TradeFormInput() {
  const dispatch = useAppDispatch();
  const { network } = useNetwork();
  const polkamarketsService = usePolkamarketsService();

  const token = useAppSelector(state => state.market.market.token);
  const { name, ticker, icon, address } = token;

  const marketNetworkId = useAppSelector(
    state => state.market.market.networkId
  );

  const type = useAppSelector(state => state.trade.type);
  const label = `${type} shares`;

  const selectedMarketId = useAppSelector(
    state => state.trade.selectedMarketId
  );

  const selectedOutcomeId = useAppSelector(
    state => state.trade.selectedOutcomeId
  );

  const isWrongNetwork = network.id !== `${marketNetworkId}`;

  // buy and sell have different maxes

  const [amount, setAmount] = useState<number | undefined>(0);
  const [stepAmount, setStepAmount] = useState<number>(0);
  const [isERC20TokenWrapped, setIsERC20TokenWrapped] =
    useState<boolean>(false);

  const portfolio = useAppSelector(state => state.polkamarkets.portfolio);
  const market = useAppSelector(state => state.market.market);
  const outcome = market.outcomes[selectedOutcomeId];

  const { balance: erc20Balance, isLoadingBalance } = useERC20Balance(address);
  const ethBalance = useAppSelector(state => state.polkamarkets.ethBalance);

  const balance = isERC20TokenWrapped ? ethBalance : erc20Balance;

  const roundDown = (value: number) => Math.floor(value * 1e5) / 1e5;

  // TODO: improve this
  const max = useCallback(() => {
    let maxAmount = 0;

    // max for buy actions - eth balance
    if (type === 'buy') {
      maxAmount = balance;
    }
    // max for sell actions - number of outcome shares
    else if (type === 'sell') {
      maxAmount =
        portfolio[selectedMarketId]?.outcomes[selectedOutcomeId]?.shares || 0;
    }

    // rounding (down) to 5 decimals
    return roundDown(maxAmount);
  }, [type, balance, portfolio, selectedMarketId, selectedOutcomeId]);

  useEffect(() => {
    dispatch(setMaxAmount(max()));
  }, [dispatch, max, type]);

  useEffect(() => {
    dispatch(setTradeAmount(0));
    setAmount(0);
    setStepAmount(0);
  }, [dispatch, type]);

  useEffect(() => {
    if (![type, market, outcome, amount].includes(undefined)) {
      const tradeDetails = calculateTradeDetails(type, market, outcome, amount);

      dispatch(setTradeDetails(tradeDetails));
    }
  }, [dispatch, type, market, outcome, amount]);

  useEffect(() => {
    async function checkIfERC20TokenWrapped() {
      try {
        const isMarketERC20TokenWrapped =
          await polkamarketsService.isMarketERC20TokenWrapped(market.id);

        setIsERC20TokenWrapped(isMarketERC20TokenWrapped);
      } catch (error) {
        setIsERC20TokenWrapped(false);
      }
    }

    checkIfERC20TokenWrapped();
  }, [market.id, polkamarketsService]);

  function handleChangeAmount(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    const newAmount = value ? parseFloat(value) : undefined;

    setAmount(newAmount);
    dispatch(setTradeAmount(newAmount || 0));
    setStepAmount(100 * ((newAmount || 0) / max()));
  }

  function handleSetMaxAmount() {
    const newMax = max();

    setAmount(newMax);
    dispatch(setTradeAmount(newMax));
    setStepAmount(100);
  }

  function handleChangeSlider(value: number) {
    const percentage = value / 100;

    const newAmount = roundDown(max() * percentage);

    setAmount(newAmount);
    dispatch(setTradeAmount(newAmount));
    setStepAmount(value);
  }

  return (
    <form className="pm-c-amount-input">
      <div className="pm-c-amount-input__header">
        <label className="pm-c-amount-input__header-title" htmlFor={label}>
          {label}
        </label>
        {!isWrongNetwork ? (
          <div className="pm-c-amount-input__header-wallet">
            <figure aria-label="Wallet icon">
              <WalletIcon />
            </figure>
            <Button
              color="noborder"
              style={{ gap: '0.2rem' }}
              onClick={handleSetMaxAmount}
              disabled={isWrongNetwork || isLoadingBalance}
            >
              <Text as="strong" scale="tiny" fontWeight="semibold">
                {max()}
              </Text>
              <Text as="span" scale="tiny" fontWeight="semibold">
                {type === 'buy' ? ticker : ' Shares'}
              </Text>
            </Button>
          </div>
        ) : null}
      </div>
      <div className="pm-c-amount-input__group">
        <input
          className="pm-c-amount-input__input"
          type="number"
          id={label}
          value={amount}
          lang="en"
          step=".0001"
          min={0}
          max={max()}
          onChange={event => handleChangeAmount(event)}
          onWheel={event => event.currentTarget.blur()}
          disabled={isWrongNetwork || isLoadingBalance}
        />
        <div className="pm-c-amount-input__actions">
          <button
            type="button"
            onClick={handleSetMaxAmount}
            disabled={isWrongNetwork || isLoadingBalance}
          >
            <Text as="span" scale="tiny-uppercase" fontWeight="semibold">
              Max
            </Text>
          </button>
          {type === 'buy' ? (
            <div className="pm-c-amount-input__logo">
              <figure aria-label={name}>{icon}</figure>
              <Text as="span" scale="caption" fontWeight="bold">
                {ticker}
              </Text>
            </div>
          ) : null}
          {type === 'sell' ? (
            <div className="pm-c-amount-input__logo">
              <Text as="span" scale="caption" fontWeight="bold">
                Shares
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <StepSlider
        currentValue={stepAmount}
        onChange={value => handleChangeSlider(value)}
        disabled={isWrongNetwork || isLoadingBalance}
      />
    </form>
  );
}

TradeFormInput.displayName = 'TradeFormInput';

export default TradeFormInput;
