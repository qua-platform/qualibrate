import React, { useMemo } from "react";
import Row, { RowTypes } from "../../../../../DEPRECATED_components/Table/Row";
import { inputIcons, outputIcons } from "../../../components/ExperimentPanels/icons";

import RowGroup from "../../../../../DEPRECATED_components/Table/RowGroup";
import Table from "../../../../../DEPRECATED_components/Table/Table";
import { IconProps } from "../../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { useNodeInfoContext } from "../../utils/NodeInfoContext";
import { useGraphContext } from "../../utils/GraphContext";
import { extractNodeParameters } from "../../utils/graph";

const DocumentationTable = () => {
  const { nodeInfo, parameters } = useNodeInfoContext();
  const { graphData } = useGraphContext();
  const [inputTableItems, outputTableItems] = useMemo(
    () => extractNodeParameters(nodeInfo, graphData, parameters),
    [parameters, nodeInfo, graphData]
  );
  const getTableIcon = (iconId: number, type: "input" | "output"): React.FC<IconProps> => {
    return type === "input" ? inputIcons[iconId] : outputIcons[iconId];
  };

  return (
    <>
      <Table tableName="Inputs">
        {inputTableItems &&
          inputTableItems.map(({ name, units, description, iconId }) => (
            <RowGroup>
              <Row type={RowTypes.HEADER}>
                {getTableIcon(iconId, "input")({})}
                {name + ` (${units})`}
              </Row>
              <Row>{description}</Row>
            </RowGroup>
          ))}
      </Table>
      <Table tableName="Outputs">
        {outputTableItems &&
          outputTableItems.map(({ name, units, description, iconId }) => (
            <RowGroup>
              <Row type={RowTypes.HEADER}>
                {getTableIcon(iconId, "output")({})}
                {name + ` (${units})`}
              </Row>
              <Row>{description}</Row>
            </RowGroup>
          ))}
      </Table>
    </>
  );
};

export default DocumentationTable;
