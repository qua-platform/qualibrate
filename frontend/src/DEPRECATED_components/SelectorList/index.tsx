import Header, { HeaderProps } from "./Header";
import List, { ListProps } from "./List";

import styles from "./SelectorList.module.scss";

interface Props extends ListProps, HeaderProps {}

const SelectorList = (props: Props) => {
  return (
    <div className={styles.wrapper}>
      <Header {...props} />
      <List {...props} />
    </div>
  );
};

export default SelectorList;
