import Pagination from "@mui/material/Pagination";
import styles from "./PaginationWrapper.module.scss";
import React from "react";
import { useRootDispatch } from "../../../../stores";
import { setPageNumber, getTotalPages, getIsLoadingSnapshots } from "../../../../stores/SnapshotsStore";
import { useSelector } from "react-redux";

type PaginationWrapperProps = {
  defaultPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
};
const PaginationWrapper = ({
  defaultPage = 1,
  siblingCount = 0,
  boundaryCount = 2,
}: PaginationWrapperProps) => {
  const dispatch = useRootDispatch();
  const numberOfPages = useSelector(getTotalPages);
  const isLoading = useSelector(getIsLoadingSnapshots);
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
          dispatch(setPageNumber(page));
        }}
      />
    </div>
  );
};

export default PaginationWrapper;
