import Pagination from "@mui/material/Pagination";
import styles from "./PaginationWrapper.module.scss";
import React from "react";

type PaginationWrapperProps = {
  numberOfPages: number;
  defaultPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
  setPageNumber: (pageNumber: number) => void;
};
const PaginationWrapper = ({
  numberOfPages,
  defaultPage = 1,
  siblingCount = 0,
  boundaryCount = 2,
  setPageNumber,
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
        onChange={(event: React.ChangeEvent<unknown>, page: number) => {
          setPageNumber(page);
        }}
      />
    </div>
  );
};

export default PaginationWrapper;
