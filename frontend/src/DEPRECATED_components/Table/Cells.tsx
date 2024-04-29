import styles from "./Cells.module.scss";
import * as React from "react";
import { ACTIVE_TEXT, GREY_FONT } from "../../utils/colors";
import { classNames } from "../../utils/classnames";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import TargetButton from "../buttons/TargetButton";
import TweakIcon from "../../ui-lib/Icons/TweakIcon";
import { CopyButton } from "../../ui-lib/components/Button/CopyButton";
import { SHOW_NOT_IMPLEMENTED } from "../../dev.config";

export function TitleWithIcon({ title, icon: Icon, isActive }: { title: string; icon: React.FC<IconProps>; isActive?: boolean }) {
  return (
    <div className={classNames(styles.titleWithIcon, isActive && styles.active)}>
      <Icon color={isActive ? ACTIVE_TEXT : GREY_FONT} />
      <span>{title}</span>
    </div>
  );
}

export function ParametersControls(props: {
  onTrack?: () => void;
  onTweak?: () => void;
  isTweaked?: boolean;
  isTrack?: boolean;
  copyValue?: string;
}): React.ReactElement {
  const { copyValue, onTrack, onTweak, isTrack = false, isTweaked = false } = props;
  return (
    <div>
      {SHOW_NOT_IMPLEMENTED && onTrack && <TargetButton onClick={onTrack} isActive={isTrack} />}
      {copyValue && <CopyButton value={copyValue} />}
      {SHOW_NOT_IMPLEMENTED && onTweak && (
        <button onClick={onTweak}>
          <TweakIcon isActive={isTweaked} />
        </button>
      )}
    </div>
  );
}
