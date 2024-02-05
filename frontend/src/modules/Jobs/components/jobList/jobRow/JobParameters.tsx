import { LIGHT, getColorTheme } from "../../../../themeModule/themeHelper";
import ReactJson from "react-json-view";
import styles from "./JobRow.module.scss";
import cyKeys from "../../../../../utils/cyKeys";
import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import useJobInfo from "../utils/useJobInfo";
import { formatDate } from "../../../../../utils/date";

interface Props {
  job: JobDTO;
}
const JobParameters = ({ job }: Props) => {
  const { params, status } = useJobInfo(job);
  if (!params && !status) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.jobContext} data-cy={cyKeys.jobs.JOB_PARAMETERS} onClick={(e) => e.stopPropagation()}>
      <div className={styles.jobContextResult}>
        <span>Saved on: permanent storage</span>
        <span>{`Start: ${formatDate(job.submit)}`}</span>
        <span>{`End: ${formatDate(job.end)}`}</span>
      </div>
      {params && (
        <ReactJson
          style={{ backgroundColor: "transparent" }}
          name="Parameters"
          theme={getColorTheme() === LIGHT ? "summerfruit:inverted" : "google"}
          collapsed
          enableClipboard
          src={params.parameters}
          displayObjectSize={false}
          displayDataTypes={false}
        />
      )}
      {status && (
        <ReactJson
          style={{ backgroundColor: "transparent" }}
          name="Output info"
          theme={getColorTheme() === LIGHT ? "summerfruit:inverted" : "google"}
          collapsed
          enableClipboard
          src={status}
          displayObjectSize={false}
          displayDataTypes={false}
        />
      )}
    </div>
  );
};

export default JobParameters;
