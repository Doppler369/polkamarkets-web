import { useMemo } from 'react';

import { Table } from 'components/new';

import {
  prepareLeaderboardTableRows,
  PrepareLeaderboardTableRowsArgs
} from './prepare';
import { LeaderboardTableColumn } from './types';

type LeaderboardTableProps = {
  columns: LeaderboardTableColumn[];
  currency: string;
  isLoading: boolean;
} & Pick<PrepareLeaderboardTableRowsArgs, 'rows' | 'sortBy'>;

function LeaderboardTable({
  columns,
  rows,
  currency,
  sortBy,
  isLoading
}: LeaderboardTableProps) {
  const preparedRows = useMemo(
    () =>
      prepareLeaderboardTableRows({
        rows,
        sortBy,
        ticker: currency
      }),
    [currency, rows, sortBy]
  );

  return (
    <Table columns={columns} rows={preparedRows} isLoadingData={isLoading} />
  );
}

export default LeaderboardTable;
