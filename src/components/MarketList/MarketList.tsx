import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListRange } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';

import cn from 'classnames';
import type { Market } from 'models/market';

import Footer from 'components/Footer';
import PredictionCard from 'components/PredictionCard';

type MarketListProps = {
  markets: Market[];
  rect: DOMRect;
};

export default function MarketList({ markets, rect }: MarketListProps) {
  const [overflow, setOverflow] = useState(false);
  const [needOverflow, setNeedOverflow] = useState(true);
  const prevTop = useRef(0);
  const handleRangeChange = useCallback(
    (range: ListRange) => {
      if (markets.length - 2 === range.endIndex - 1) setNeedOverflow(false);
      else if (!needOverflow) setNeedOverflow(true);
    },
    [needOverflow, markets.length]
  );
  const handleVirtuosoScroll = useCallback(
    (event: React.UIEvent<'div', UIEvent>) => {
      const { scrollTop } = event.target as HTMLDivElement;

      if (prevTop.current > scrollTop && !scrollTop && overflow)
        setOverflow(false);

      prevTop.current = scrollTop;
    },
    [overflow]
  );
  const handleItemContent = useCallback(
    (index: number, data: Market) => (
      <PredictionCard
        market={data}
        className={cn({
          'mb-grid': index !== markets.length - 1
        })}
      />
    ),
    [markets.length]
  );

  useEffect(() => {
    function handleDocumentScroll() {
      if (needOverflow && !overflow && window.scrollY >= Math.floor(rect.top))
        setOverflow(true);
    }
    document.addEventListener('scroll', handleDocumentScroll);

    return () => {
      document.removeEventListener('scroll', handleDocumentScroll);
    };
  }, [needOverflow, overflow, rect.top]);
  useEffect(() => {
    if (!overflow) return () => null;

    document.body.classList.add('o-hidden');

    return () => document.body.classList.remove('o-hidden');
  }, [overflow]);

  return (
    <Virtuoso
      data={markets}
      onScroll={handleVirtuosoScroll}
      rangeChanged={handleRangeChange}
      itemContent={handleItemContent}
      components={{
        Footer
      }}
      className={cn({
        'o-hidden!': !overflow
      })}
    />
  );
}
