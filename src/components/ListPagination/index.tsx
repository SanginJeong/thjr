interface PageProps {
  limit: number;
  count: number;
  hasNext: boolean;
  activePage: number;
  pagingMax?: number;
  onPageChange: (pageNumber: number) => void;
}

const ListPagination = ({ limit = 5, count, hasNext, activePage = 1, pagingMax = 7, onPageChange }: PageProps) => {
  const totalPages = Math.ceil(count / limit);

  if (totalPages <= 1 && !hasNext) {
    return null;
  }

  const getPageRange = (): number[] => {
    if (totalPages <= pagingMax) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(pagingMax / 2);
    let start = activePage - half;
    if (start < 1) {
      start = 1;
    }
    let end = start + pagingMax - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - pagingMax + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageRange();
  const showArrows = totalPages > pagingMax;

  const pageItemBase =
    "mx-2 flex h-32 min-w-32 cursor-pointer items-center justify-center rounded-5 text-12 transition-colors duration-300 tablet:h-40 tablet:min-w-40 tablet:text-16";

  const arrowBase =
    "mx-2 flex h-32 min-w-32 cursor-pointer items-center justify-center text-[32px] leading-none tablet:h-36";

  return (
    <div className="flex w-full justify-center">
      {showArrows && (
        <button
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage === 1}
          className={`${arrowBase} disabled:cursor-default disabled:text-gray-30`}
        >
          ‹
        </button>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${pageItemBase} ${page === activePage ? "bg-green-30 text-white" : "hover:bg-[#f0f0f0]"}`}
        >
          {page}
        </button>
      ))}
      {showArrows && hasNext && (
        <button onClick={() => onPageChange(activePage + 1)} className={arrowBase}>
          ›
        </button>
      )}
    </div>
  );
};

export default ListPagination;
