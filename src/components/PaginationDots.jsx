import React from 'react';
import { useAtom } from 'jotai';
import { GiCrownedHeart } from 'react-icons/gi';
import { pageAtom, pages } from './UI';
import YouTubeMusicPlayer from './YoutubeMusicPlayer';

const PaginationDots = () => {
  const [page, setPage] = useAtom(pageAtom);
  const totalPages = pages.length;

  // Helper function to determine which dots to show
  const getVisibleDots = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);

    if (page <= 3) {
      return [0, 1, 2, 3, 4, -1, totalPages - 1];
    }

    if (page >= totalPages - 4) {
      return [0, -1, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    }

    return [0, -1, page - 1, page, page + 1, -1, totalPages - 1];
  };

  return (
    <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
      <a
        className="pointer-events-auto flex gap-4 items-center justify-center md:justify-start mt-16 md:mt-10 md:ml-10"
        href="https://www.mattkettelkamp.com/"
      >
        <img className="w-40 md:w-36" src="/images/sj-title.png" alt="PXL Agency" />
        <span className="scale-[1.5] mb-[5px] md:mb-[7px]">
          <GiCrownedHeart color="black" />
        </span>
      </a>
    <div className="pointer-events-auto z-10 md:mr-10">
        <YouTubeMusicPlayer />
    </div>
      <div className="w-full pointer-events-auto flex justify-center mb-8">
        <div className="flex items-center gap-4">
          {getVisibleDots().map((index, i) => {
            if (index === -1) {
              return (
                <span key={`ellipsis-${i}`} className="text-white text-lg mx-2">
                  …
                </span>
              );
            }

            const isFirstPage = index === 0;
            const isLastPage = index === totalPages - 1;
            const isCurrent = index === page;

            return (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`group relative ${
                  isCurrent ? 'scale-125' : 'hover:scale-110'
                } transition-all duration-300`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-red-600'
                      : 'bg-white/50 group-hover:bg-white/80'
                  }`}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {isFirstPage
                    ? 'Cover'
                    : isLastPage
                    ? 'Back Cover'
                    : `Page ${index}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default PaginationDots;