import React, { useCallback, useEffect, useMemo, useState } from "react";
import Row from "../../../../../DEPRECATED_components/Table/Row";
import { inputIcons, outputIcons } from "../icons";
import EditableTableValue from "./EditableTableValue";
import RowGroup from "../../../../../DEPRECATED_components/Table/RowGroup";
import Table from "../../../../../DEPRECATED_components/Table/Table";
import TargetButton from "../../../../../DEPRECATED_components/DEPRECATED_Buttons/TargetButton";
import cyKeys from "../../../../../utils/cyKeys";
import { useEditParameterContext } from "../../../GraphModule/nodeInfo/parameters/EditParameterContext";
import { IconProps } from "../../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { ParametersControls, TitleWithIcon } from "../../../../../DEPRECATED_components/Table/Cells";
import { useNodeInfoContext } from "../../../GraphModule/utils/NodeInfoContext";
import { useGraphContext } from "../../../GraphModule/utils/GraphContext";
import { extractNodeParameters } from "../../../GraphModule/utils/graph";
import { CopyButton } from "../../../../../ui-lib/components/Button/CopyButton";
import { JOB_OUTPUT_URL } from "../../../../../DEPRECATED_common/modules";
import { useActiveProjectContext } from "../../../../ActiveProject/ActiveProjectContext";
import { JobApi } from "../../../../../DEPRECATED_common/DEPRECATED_api/job";
import { JobStatuses } from "../../../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";

const ParametersTable = () => {
  const { projectUserState } = useActiveProjectContext();
  const { currentParameter } = useEditParameterContext();
  const { nodeInfo, parameters, selectedNode } = useNodeInfoContext();
  const { graphData } = useGraphContext();
  const [inputTableItems, outputTableItems] = useMemo(
    () => extractNodeParameters(nodeInfo, graphData, parameters),
    [parameters, nodeInfo, graphData]
  );
  const [isTracking, setIsTracking] = useState<boolean[]>(Array(outputTableItems.length).fill(false));
  const [jobStatus, setJobStatus] = useState<string | undefined>(undefined);

  const getTableIcon = useCallback((iconId: number, type: "input" | "output"): React.FC<IconProps> => {
    return type === "input" ? inputIcons[iconId] : outputIcons[iconId];
  }, []);

  const fetchJobStatus = useCallback(
    async (jobId: number) => {
      const { isOk: statusOk, result: newStatus } = await JobApi.getJobStatus(jobId);
      if (statusOk && newStatus) {
        setJobStatus(newStatus.current_status);
      }
    },
    [projectUserState]
  );

  useEffect(() => {
    fetchJobStatus(projectUserState?.job || -1);
    return () => {
      setJobStatus(undefined);
    };
  }, [projectUserState]);

  const ShowIFrame = (props: { output_name: string }) => {
    return props.output_name ? (
      <iframe
        src={JOB_OUTPUT_URL(projectUserState?.job_eui, selectedNode?.id, props.output_name)}
        style={{ height: "600px", width: "100%" }}
      />
    ) : (
      <></>
    );
  };

  return (
    <>
      <Table tableName="Inputs" data-cy={cyKeys.experiment.INPUT_TABLE}>
        {inputTableItems?.map(({ name, units, value, iconId, ...rest }) => {
          const isActive = name === currentParameter?.name;
          return (
            <RowGroup key={`input-row-group${name}`} highlight={isActive} gridStyle={"1fr 1fr 30px"}>
              <TitleWithIcon isActive={isActive} title={`${name} (${units})`} icon={getTableIcon(iconId, "input")} />
              {/* TODO FIX NEXT LINE */}
              <EditableTableValue value={value} name={name} isEditable={!(rest as any).isReference} highlight={isActive} />
              <ParametersControls
                onTweak={() => {
                  console.log("tweak!");
                }}
              />
            </RowGroup>
          );
        })}
      </Table>
      <Table tableName="Outputs">
        {outputTableItems &&
          outputTableItems.map(({ name, units, value, iconId }, index) => {
            return (
              <div key={`output-div-wrapper-${name}`}>
                <RowGroup key={`output-row-group${name}`}>
                  <TitleWithIcon title={`${name} (${units})`} icon={getTableIcon(iconId, "output")} />
                  <Row
                    key={`output-row${name}`}
                    controls={[
                      <TargetButton
                        key={`output-target-button-${name}`}
                        isActive={isTracking[index]}
                        onClick={() => {
                          const cloneIsTracking = [...isTracking];
                          cloneIsTracking[index] = !isTracking[index];
                          setIsTracking(cloneIsTracking);
                        }}
                      />,
                      <CopyButton key={`output-copy-button-${name}`} value={"#" + selectedNode?.ident + "/" + name} />,
                    ]}
                  >
                    {value}
                  </Row>
                </RowGroup>
                {iconId == 2 && jobStatus === JobStatuses.SUCCESSFUL && <ShowIFrame output_name={name} />}
              </div>
            );
          })}
      </Table>
    </>
  );
};

export default ParametersTable;
