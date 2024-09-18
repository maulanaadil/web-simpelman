import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { twMerge as cx } from 'tailwind-merge';

export function NumberPage({
  page,
  limit,
  total,
  onChange,
  maxShown = 5,
}: {
  maxShown?: number;
  page?: number;
  limit: number;
  total: number;
  onChange?: (val: number) => void;
}) {
  const handleChangePage = (page: number) => {
    onChange?.(page);
  };

  const currentPage = () => page || 0;
  const lastPage = () => Math.ceil(total / limit) || 1;

  const pageList = (current: number, last: number) => {
    const arrayPage = [];
    for (let i = current; i <= last; i += 1) {
      arrayPage.push(i);
    }
    return arrayPage;
  };

  const getRange = () => {
    let initial = 1;

    let incremental = 1;
    let prev = page || 0;
    let last = page || 0;

    while (
      initial <
      (Math.ceil(total / limit) < maxShown
        ? Math.ceil(total / limit)
        : maxShown)
    ) {
      if (incremental % 2 !== 0) {
        if (prev > 1) {
          prev -= 1;
          initial += 1;
        }
      } else if (last < lastPage()) {
        last += 1;
        initial += 1;
      }
      incremental += 1;
    }

    return {
      prev,
      last,
    };
  };

  const handleChangePageToPrevious = () => {
    if (currentPage() !== 1) {
      handleChangePage(currentPage() - 1);
    }
  };

  if (total <= 0) return null;

  return (
    <div className='flex gap-2 items-center'>
      <button
        className={`text-primary-500 p-2 mr-4 rounded-xl border border-primary-500 cursor-pointer ${
          currentPage() === 1 && 'opacity-25'
        }`}
        onClick={() => handleChangePageToPrevious()}
        disabled={currentPage() <= 0}
      >
        <ChevronLeft className='w-6 h-6' color='#0f9650' />
      </button>
      {pageList(getRange().prev, getRange().last).map((p) => (
        <div
          className={cx(
            'text-sm font-bold px-4 py-2.5',
            currentPage() === p
              ? 'bg-primary-50 rounded-xl border border-primary-75 text-primary-300 pointer-events-none'
              : 'bg-white rounded-xl border border-primary-500 text-primary-500 cursor-pointer'
          )}
          key={p}
          onClick={() => handleChangePage(p)}
        >
          {p}
        </div>
      ))}
      <button
        onClick={() => handleChangePage(currentPage() + 1)}
        className={`text-primary-500 p-2 ml-4 rounded-xl border border-primary-500 cursor-pointer ${
          currentPage() === lastPage() && 'opacity-25'
        }`}
        disabled={currentPage() === lastPage()}
      >
        <ChevronRight className='w-6 h-6' color='#0f9650' />
      </button>
    </div>
  );
}
