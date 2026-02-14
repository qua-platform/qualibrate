import Pagination from "@mui/material/Pagination";
import styles from "./PaginationWrapper.module.scss";
import React from "react";

type PaginationWrapperProps = {
  defaultPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
  numberOfPages?: number;
  isLoading?: boolean;
  setPageNumber?: (page: number) => void;
};
const PaginationWrapper = ({
  defaultPage = 1,
  siblingCount = 0,
  boundaryCount = 2,
  numberOfPages = 1,
  isLoading = false,
  setPageNumber = () => {},
}: PaginationWrapperProps) => {
  return (
    <div className={styles.wrapper}>
      <Pagination
        sx={{
          "& .Mui-selected": {
            opacity: "initial",
            color: "#2CCBE5",
            backgroundColor: "transparent !important",
          },
        }}
        count={numberOfPages}
        defaultPage={defaultPage}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        disabled={isLoading}
        onChange={(event: React.ChangeEvent<unknown>, page: number) => {
          setPageNumber(page);
        }}
      />
    </div>
  );
};

export default PaginationWrapper;
