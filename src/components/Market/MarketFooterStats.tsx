import { features } from 'config';
import dayjs from 'dayjs';
import { roundNumber } from 'helpers/math';
import isEmpty from 'lodash/isEmpty';
import { Market } from 'models/market';

import Feature from 'components/Feature';
import Icon from 'components/Icon';

import { useFantasyTokenTicker } from 'hooks';

import Text from '../Text';
import Tooltip from '../Tooltip';
import marketClasses from './Market.module.scss';

type MarketFooterStatsProps = {
  market: Market;
};

export default function MarketFooterStats({ market }: MarketFooterStatsProps) {
  const {
    volume,
    volumeEur,
    expiresAt,
    liquidity,
    liquidityEur,
    fee,
    treasuryFee,
    token,
    network
  } = market;

  const fantasyTokenTicker = useFantasyTokenTicker();

  return (
    <div className="pm-c-market-footer__stats">
      <Feature name="regular">
        <>
          {!isEmpty(network.currency) ? (
            <>
              <Tooltip text={network.name}>
                <Icon name={network.currency.iconName} />
              </Tooltip>
              <span className="pm-c-divider--circle" />
            </>
          ) : null}
        </>
      </Feature>
      {!!volume && (
        <>
          <Text
            as="span"
            scale="tiny-uppercase"
            fontWeight="semibold"
            className={marketClasses.footerStatsText}
          >
            <Tooltip
              className={marketClasses.footerStatsTooltip}
              text={`Volume: ${roundNumber(volumeEur, 3)} EUR`}
              disabled={features.fantasy.enabled}
            >
              <Icon
                name="Stats"
                title="Volume"
                className={marketClasses.footerStatsIcon}
              />
              <Text
                as="strong"
                scale="tiny-uppercase"
                fontWeight="semibold"
                className={marketClasses.footerStatsText}
              >
                {`${roundNumber(volume, 3)} `}
              </Text>
              <Text
                as="strong"
                scale="tiny-uppercase"
                fontWeight="semibold"
                className={marketClasses.footerStatsText}
              >{`${fantasyTokenTicker || token.ticker}`}</Text>
            </Tooltip>
          </Text>
          <span className="pm-c-divider--circle" />
        </>
      )}
      <Feature name="regular">
        <>
          {!!liquidity && (
            <>
              <Text
                as="span"
                scale="tiny-uppercase"
                fontWeight="semibold"
                className={marketClasses.footerStatsText}
              >
                <Tooltip
                  className={marketClasses.footerStatsTooltip}
                  text={`Liquidity: ${roundNumber(liquidityEur, 3)} EUR`}
                  disabled={features.fantasy.enabled}
                >
                  <Icon
                    name="Liquidity"
                    title="Liquidity"
                    className={marketClasses.footerStatsIcon}
                  />
                  <Text
                    as="strong"
                    scale="tiny-uppercase"
                    fontWeight="semibold"
                    className={marketClasses.footerStatsText}
                  >
                    {`${roundNumber(liquidity, 3)} `}
                  </Text>
                  <Text
                    as="strong"
                    scale="tiny-uppercase"
                    fontWeight="semibold"
                    className={marketClasses.footerStatsText}
                  >{`${fantasyTokenTicker || token.ticker}`}</Text>
                </Tooltip>
              </Text>
              <span className="pm-c-divider--circle" />
            </>
          )}
        </>
      </Feature>
      <Feature name="regular">
        <>
          <Text
            as="span"
            scale="tiny-uppercase"
            fontWeight="semibold"
            className={marketClasses.footerStatsText}
          >
            <Tooltip
              className={marketClasses.footerStatsTooltip}
              text={`Trading Fee: ${roundNumber(
                (fee + treasuryFee) * 100,
                1
              )}%`}
            >
              <Icon
                name="Fee"
                title="Trading Fee"
                className={marketClasses.footerStatsIcon}
              />
              <Text
                as="strong"
                scale="tiny-uppercase"
                fontWeight="semibold"
                className={marketClasses.footerStatsText}
              >
                {`${roundNumber((fee + treasuryFee) * 100, 1)}%`}
              </Text>
            </Tooltip>
          </Text>
          <span className="pm-c-divider--circle" />
        </>
      </Feature>
      {expiresAt && (
        <Text as="span" scale="tiny-uppercase" fontWeight="semibold">
          <Tooltip
            className={marketClasses.footerStatsTooltip}
            text={`Expires on ${dayjs(expiresAt)
              .utc(true)
              .format('MMM D, YYYY h:mm A')}`}
          >
            <Icon
              name="Calendar"
              title="Expires at"
              className={marketClasses.footerStatsIcon}
            />
            <Text
              as="strong"
              scale="tiny-uppercase"
              fontWeight="semibold"
              className={marketClasses.footerStatsText}
            >
              {dayjs(expiresAt).utc(true).format('MMM D, YYYY h:mm A')}
            </Text>
          </Tooltip>
        </Text>
      )}
    </div>
  );
}
