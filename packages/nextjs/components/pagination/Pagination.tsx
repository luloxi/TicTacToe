import React from "react";
import { ButtonGroup, Flex } from "@chakra-ui/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (totalPages <= maxButtons) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage <= Math.ceil(maxButtons / 2)) {
      startPage = 1;
      endPage = maxButtons;
    } else if (currentPage + Math.floor(maxButtons / 2) >= totalPages) {
      startPage = totalPages - maxButtons + 1;
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          className={`btn pagination-button ${i === currentPage ? "btn-primary" : "btn-secondary"}`}
          key={i}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>,
      );
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <Flex justifyContent="center" mt={1}>
      <ButtonGroup spacing="2">
        <button
          className="btn btn-primary pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {renderPageButtons()}
        <button
          className="btn btn-primary pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </ButtonGroup>
    </Flex>
  );
};

export default Pagination;
