import DEPRECATEDButton from "../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import CalendarButton from "../../DEPRECATED_components/DEPRECATED_Buttons/CalendarButton";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import LoadingBar from "../../ui-lib/loader/LoadingBar";
import { NavigatedPanel } from "../../DEPRECATED_common/DEPRECATED_interfaces/NavigatedPanels";
import { NoResultsPlaceholderIcon } from "../../ui-lib/Icons/NoResultsPlaceholderIcon";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import SearchResult from "./components/SearchResult";
import { SortingDescendingIcon } from "../../ui-lib/Icons/SortingDescendingIcon";
import Tag from "../../DEPRECATED_components/Tag/Tag";
import styles from "./SearchPage.module.scss";
import UseNavigatedPanels from "../../DEPRECATED_hooks/UseNavigatedPanels";

const SearchPage = () => {
  const experimentInfoPanels: NavigatedPanel[] = [
    {
      nav: { name: "All" },
      panel: <></>,
    },
    {
      nav: { name: "Notebook" },
      panel: <></>,
    },
    {
      nav: { name: "Experiment runs" },
      panel: <></>,
    },
    {
      nav: { name: "Data" },
      panel: <></>,
    },
    {
      nav: { name: "Analysis scripts" },
      panel: <></>,
    },
    {
      nav: { name: "Components" },
      panel: <></>,
    },
  ];

  const [Navigation, Panels] = UseNavigatedPanels(experimentInfoPanels);

  const RESULTS_ARE_READY = true;

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchMenu}>
        <CalendarButton />
        <DEPRECATEDButton actionName="All users" type={ButtonTypes.ACTION} customClassName={styles.selectUsersButton} />
        <div className={styles.searchTags}>
          <h3>Tags</h3>
          <div className={styles.tags}>
            <Tag name="Elementum" /> <Tag name="Morb" />
            <Tag name="Convallis" /> <Tag name="Vulputate" />
            <Tag name="Pellentesque" />
          </div>
        </div>
      </div>
      <div className={styles.searchFrame}>
        <div className={styles.searchBar}>
          <InputField icon={<SearchIcon />} placeholder="" onChange={(f) => f} className={styles.searchField} />
          <DEPRECATEDButton
            actionName="by Start Date"
            type={ButtonTypes.ACTION}
            customClassName={styles.searchButton}
            icon={<SortingDescendingIcon />}
            sortButton
          />
        </div>
        {/* eslint-disable-next-line css-modules/no-undef-class */}
        <div className={styles.searchNavigation}>
          {Navigation}
          {Panels}
        </div>
        <div className={styles.searchOutput}>
          {RESULTS_ARE_READY ? (
            <>
              <SearchResult />
              <SearchResult />
            </>
          ) : (
            <LoadingBar
              icon={<NoResultsPlaceholderIcon />}
              text="No matching search results"
              actionButton={<DEPRECATEDButton actionName="Clear All Filters" customClassName={styles.clearFiltersButton} />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
