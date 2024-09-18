import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Row,
  Table as TableType,
} from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import { SearchNormal1 } from 'iconsax-react';
import { MakeTypeNever } from 'type/utils';
import InputDebounce from '../input-debounce';
import { cn } from '~/lib/utils';
import Loader from '../loader';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NumberPage } from './number-page';
import Pagination from './pagination';

export type TablePagination = {
  pagination?: {
    page: number;
    size: number;
  };
  total?: number;
  onChangePagination?: ({ page, size }: { page: number; size: number }) => void;
};

export type ButtonAdd = {
  handleClickAdd: () => void;
  placeHolderButtonAdd: string;
};

export type ButtonUpload = {
  handleClickUpload: () => void;
};

export type BulkAction<T> = {
  handleClickAction?: (event: { type: string; row: Row<T>[] }) => void;
  handleChangeSelect?: (event: { type: string; row: Row<T>[] }) => void;
  withButtonHelper?: boolean;
};

export type TableSearch = {
  searchInputPlaceholder: string;
  search?: string;
  onChangeSearch?: (val: string) => void;
};

export type TableWithPaginate =
  | ({
      isPaginate?: false;
    } & MakeTypeNever<TablePagination>)
  | ({
      isPaginate?: true;
    } & TablePagination);

export type TableWithBulkAction<T> =
  | ({
      isHasBulkAction?: false;
    } & MakeTypeNever<BulkAction<T>>)
  | ({
      isHasBulkAction?: true;
    } & BulkAction<T>);

export type TableWithSearch =
  | ({
      isHasSearch?: false;
    } & MakeTypeNever<TableSearch>)
  | ({
      isHasSearch?: true;
    } & TableSearch);

export type TableProps<T extends Record<string, unknown>> = {
  data?: T[];
  columns: ColumnDef<T>[];
  textAlign?: string;
  isLoading?: boolean;
  customFirstColumnWidth?: string;
  isCustomHeader?: boolean;
  customEmptyState?: string;
  maxShownPagination?: number;
  title?: string;
  customHeader?: (table?: TableType<T>) => React.ReactNode;
  isCustomFooter?: boolean;
  customFooter?: (table?: TableType<T>) => React.ReactNode;
  onClickRow?: (row: Row<T>) => void;
  withoutCard?: boolean;
} & TableWithSearch &
  TableWithPaginate;

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const generateFuzzyFilter =
  <T extends Record<string, unknown>>(): FilterFn<T> =>
  (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);

    addMeta({
      itemRank,
    });

    return itemRank.passed;
  };

export default function Table<TData extends Record<string, unknown>>({
  columns,
  data,
  textAlign = 'start',
  customFirstColumnWidth,
  isHasSearch = false,
  search: searchFromProps,
  onChangeSearch,
  searchInputPlaceholder = 'Search anything',
  isCustomHeader = false,
  customHeader,
  customEmptyState,
  isPaginate = false,
  pagination: paginationFromProps,
  total,
  isLoading,
  onChangePagination,
  maxShownPagination = 5,
  isCustomFooter = false,
  customFooter,
  title,
  onClickRow,
  withoutCard = false,
}: TableProps<TData>) {
  const defaultTableData: TData[] = useMemo(() => [], []);

  const table = useReactTable<TData>({
    data: data || defaultTableData,
    columns,
    filterFns: {
      fuzzy: generateFuzzyFilter(),
    },
    enableSorting: true,
    globalFilterFn: generateFuzzyFilter(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [localSearch, setLocalSearch] = useState(
    table.initialState.globalFilter
  );

  const [localPagination, setLocalPagination] = useState({
    page: table.initialState.pagination.pageIndex,
    size: paginationFromProps?.size || table.initialState.pagination.pageSize,
  });

  const isSearchControlled = typeof searchFromProps !== 'undefined';
  const isPaginationControlled = typeof paginationFromProps !== 'undefined';

  const search = isSearchControlled ? searchFromProps : localSearch;
  const pagination = isPaginationControlled
    ? paginationFromProps
    : localPagination;

  const [tableState, setTableState] = useState({
    ...table.initialState,
    pagination: {
      pageIndex: pagination?.page,
      pageSize: pagination?.size,
    },
    globalFilter: search,
  });

  table.setOptions((prev) => ({
    ...prev,
    state: tableState,
    onStateChange: setTableState,
  }));

  const handleChangeInput = React.useCallback(
    (val: string | undefined) => {
      if (!isSearchControlled) {
        setLocalSearch(val);
      }
      onChangeSearch?.(val || '');
    },
    [isSearchControlled, onChangeSearch]
  );

  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: localPagination.page,
        pageSize: isPaginate ? localPagination.size : data?.length || 10,
      },
    }));
  }, [data?.length, isPaginate, localPagination]);

  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      globalFilter: localSearch,
    }));
  }, [localSearch]);

  return withoutCard ? (
    <_Table
      table={table}
      customFirstColumnWidth={customFirstColumnWidth}
      columns={columns}
      customEmptyState={customEmptyState}
      isLoading={isLoading}
      onClickRow={onClickRow}
      textAlign={textAlign}
    />
  ) : (
    <div className='w-full h-full'>
      {isCustomHeader ? (
        customHeader?.(table)
      ) : (
        <div className='flex flex-col gap-4 mb-3'>
          {!!title && (
            <p className='text-xl font-bold text-neutral-900'>{title}</p>
          )}
          {isHasSearch && (
            <InputDebounce
              placeholder={searchInputPlaceholder}
              value={search ?? ''}
              onChange={(val) => handleChangeInput(val as string)}
              containerClassname='w-full'
              isFixed
              fixedLabel={<SearchNormal1 />}
            />
          )}
        </div>
      )}
      <_Table
        table={table}
        customFirstColumnWidth={customFirstColumnWidth}
        columns={columns}
        customEmptyState={customEmptyState}
        isLoading={isLoading}
        onClickRow={onClickRow}
        textAlign={textAlign}
      />
      {isCustomFooter ? (
        customFooter?.(table)
      ) : (
        <div className='w-full flex justify-between items-center mt-3'>
          {isPaginate && (
            <>
              <Pagination
                pageSize={pagination.size.toString()}
                onChange={(_newValue) => {
                  const newValue = parseInt(_newValue || '10');
                  table.setPageSize(newValue);
                  if (!isPaginationControlled) {
                    setLocalPagination(() => ({
                      page: 0,
                      size: newValue,
                    }));
                  }
                  onChangePagination?.({
                    page: 0,
                    size: newValue,
                  });
                }}
              />
              <NumberPage
                page={pagination.page + 1}
                limit={pagination.size}
                total={isPaginationControlled ? total ?? 0 : data?.length || 0}
                maxShown={maxShownPagination}
                onChange={(page) => {
                  if (!isPaginationControlled) {
                    setLocalPagination((prev) => ({
                      ...prev,
                      page: page - 1,
                    }));
                  }
                  onChangePagination?.({
                    ...paginationFromProps,
                    page: page - 1,
                    size: paginationFromProps?.size || 10,
                  });
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function _Table<T extends Record<string, unknown>>({
  table,
  customFirstColumnWidth,
  columns,
  customEmptyState,
  isLoading,
  onClickRow,
  textAlign,
}: {
  table: TableType<T>;
} & Pick<
  TableProps<T>,
  | 'customFirstColumnWidth'
  | 'textAlign'
  | 'isLoading'
  | 'customEmptyState'
  | 'columns'
  | 'onClickRow'
>) {
  return (
    <table className='w-full overflow-auto'>
      <thead className='bg-base-100 text-[#7C7C7F] text-sm font-bold transition-all'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => (
              <th
                key={header.id}
                className={cn(`border-b-[1px]
                        ${
                          header.column.columnDef.enableSorting &&
                          'hover:bg-base-200 cursor-default'
                        }  ${header.column.getIsSorted() && 'bg-base-200'}`)}
                style={{
                  width:
                    customFirstColumnWidth && index === 0
                      ? `${customFirstColumnWidth}%`
                      : '',
                }}
              >
                <div
                  className={`flex text-white text-base justify-${textAlign} items-center font-medium gap-3 px-2 py-3
                          } ${
                            header.column.columnDef.enableSorting
                              ? 'cursor-pointer'
                              : 'cursor-default'
                          } `}
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {header.column.columnDef.header !==
                    headerGroup.headers[headerGroup.headers.length - 1].column
                      .columnDef.header &&
                    header.column.columnDef.enableSorting && (
                      <div className='flex flex-col'>
                        <ChevronUp
                          size={8}
                          strokeWidth={2}
                          className={`${
                            header.column.getIsSorted() === 'asc'
                              ? 'text-base-900'
                              : 'text-base-900 opacity-50'
                          }`}
                        />
                        <ChevronDown
                          size={8}
                          strokeWidth={2}
                          className={`${
                            header.column.getIsSorted() === 'desc'
                              ? 'text-base-900 font-bold'
                              : 'text-base-900 opacity-50'
                          }`}
                        />
                      </div>
                    )}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={columns?.length}>
              <div className='p-4 w-full flex justify-center items-center'>
                <Loader className='text-neutral-500' />
              </div>
            </td>
          </tr>
        ) : table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns?.length} className='text-center py-4'>
              {customEmptyState || 'Data tidak ditemukan'}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={cn(
                  'relative bg-neutral-10',
                  onClickRow && 'hover:bg-neutral-20 transition-all'
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-2 py-4 text-sm text-neutral-900 border-b-[#E0EDFF] border-b-[1px]',
                        onClickRow && 'cursor-pointer '
                      )}
                      onClick={() => onClickRow?.(row)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
