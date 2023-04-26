import { useMemo } from 'react';

import { fromPriceChartToLineChartSeries } from 'helpers/chart';
import { roundNumber } from 'helpers/math';
import { Skeleton } from 'ui';

import { CaretDownIcon, CaretUpIcon } from 'assets/icons';

import { AreaChart, Label, Text } from 'components';

import { useAppSelector } from 'hooks';

import { balance } from './mock';
import type { PortfolioAsyncProps } from './type';

export default function PortfolioChart({ isLoading }: PortfolioAsyncProps) {
  const holdingsChart = useAppSelector(
    state => state.portfolio.portfolio.holdingsChart
  );
  const holdingsPerformance = useAppSelector(
    state => state.portfolio.portfolio.holdingsPerformance
  );
  const holdingsValue = useAppSelector(
    state => state.portfolio.portfolio.holdingsValue
  );
  const holdingsChartData = useMemo(
    () => fromPriceChartToLineChartSeries(holdingsChart),
    [holdingsChart]
  );
  const hasHoldingsPerformance = holdingsPerformance.change >= 0;
  const holdingsPerformanceColor = hasHoldingsPerformance
    ? 'success'
    : 'danger';

  if (isLoading) return <Skeleton style={{ height: 372 }} />;

  return (
    <div className="portfolio-chart">
      <div className="portfolio-chart__header">
        <div className="portfolio-chart__header-balance">
          <Text as="h4" scale="heading" fontWeight="semibold" color="light">
            {roundNumber(holdingsValue, 2)} €
          </Text>
          <Text as="span" scale="tiny" fontWeight="medium" color="dark-gray">
            Total Balance
          </Text>
        </div>
        <div
          className={`portfolio-chart__header-change--${balance.change.type}`}
        >
          <Label color={holdingsPerformanceColor}>
            {hasHoldingsPerformance ? <CaretUpIcon /> : <CaretDownIcon />}
            {roundNumber(Math.abs(holdingsPerformance.changePercent) * 100, 2)}%
          </Label>
          <Text
            as="span"
            scale="body"
            fontWeight="semibold"
            color={holdingsPerformanceColor}
          >
            {roundNumber(holdingsPerformance.change, 2)} €
          </Text>
        </div>
      </div>
      <div className="portfolio-chart__view">
        <AreaChart serie={holdingsChartData} ticker="€" height={210} />
      </div>
    </div>
  );
}
