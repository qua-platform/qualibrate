import { NEW_PROJECT_BUTTON_VISIBLE, READ_OUR_ARTICLES_VISIBLE } from "../../dev.config";

import { ACTIVE_TEXT } from "../../utils/colors";
import { AddIcon } from "../../ui-lib/Icons/AddIcon";
import BannerGuide from "./components/BannerGuide";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { CircleListIcon } from "../../ui-lib/Icons/CircleListIcon";
import { CircleRocketIcon } from "../../ui-lib/Icons/CircleRocketIcon";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import LinkPlaceholder from "./components/LinkPlaceholder";
import MainLayout from "../../ui-lib/layouts/MainLayout";
import { NotebookIcon } from "../../ui-lib/Icons/NotebookIcon";
import PageName from "../../DEPRECATED_components/common/Page/PageName";
import PageSection from "../../DEPRECATED_components/common/Page/PageSection";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import WithTooltip from "../../DEPRECATED_components/wrappers/withTooltip";
import styles from "./WelcomePage.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import cyKeys from "../../utils/cyKeys";
import { IconType } from "../../DEPRECATED_common/DEPRECATED_interfaces/InputProps";

const WelcomePage = () => {
  const { openTab } = useFlexLayoutContext();

  return (
    <MainLayout className={styles.welcomePageLayout}>
      <PageName>Welcome to QUAlibrate</PageName>
      <div className={styles.pageWrapper}>
        <PageSection className={styles.selectProjectFrame} sectionName="Please select a Project">
          <InputField
            iconType={IconType.INNER}
            placeholder="Project Name"
            className={styles.searchJobField}
            onChange={(f) => f}
            icon={<SearchIcon height={18} width={18} />}
          />
        </PageSection>
        <PageSection className={styles.entropyGuideFrame} sectionName="New to QUAlibrate?">
          <div className={styles.bannerList}>
            <BannerGuide
              name="See what QUAlibrate is"
              description="QUAlibrate Hub & Flame Overview"
              onClick={() => openTab("docs")}
              icon={<CircleListIcon />}
            />
            <BannerGuide
              name="See how to get started"
              description="Getting started"
              onClick={() => openTab("getting-started")}
              icon={<CircleRocketIcon />}
            />
            {READ_OUR_ARTICLES_VISIBLE && (
              <PageSection className={styles.mightBeInterestingFrame} sectionName="Might be interesting">
                <LinkPlaceholder
                  name="Read our articles in Notebook"
                  description="30+ helpful articles to share experiences"
                  icon={<NotebookIcon height={30} />}
                />
              </PageSection>
            )}
          </div>
        </PageSection>
      </div>
      <div className={styles.pageActions}>
        <WithTooltip name="Open experiment tab">
          <BlueButton
            onClick={() => openTab("experiments")}
            className={styles.actionButton}
            disabled={true}
            data-cy={cyKeys.projects.LETS_START_BUTTON}
            isBig
          >
            Let’s Start
          </BlueButton>
        </WithTooltip>

        {NEW_PROJECT_BUTTON_VISIBLE && (
          <BlueButton isSecondary className={styles.actionButton}>
            <AddIcon height={12} color={ACTIVE_TEXT} />
            New project
          </BlueButton>
        )}
      </div>
    </MainLayout>
  );
};

export default WelcomePage;
