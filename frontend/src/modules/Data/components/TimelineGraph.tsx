import { SnapshotDTO } from "../../Snapshots/SnapshotDTO";
import React, { Dispatch, SetStateAction } from "react";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";

export const TimelineGraph = ({
  allSnapshots,
  selectedSnapshotIndex,
  setSelectedSnapshotIndex,
  setSelectedSnapshotId,
  setFlag,
  fetchOneGitgraphSnapshot,
}: {
  allSnapshots: SnapshotDTO[];
  selectedSnapshotIndex: number | undefined;
  setSelectedSnapshotIndex: Dispatch<SetStateAction<number | undefined>>;
  setSelectedSnapshotId: Dispatch<SetStateAction<number | undefined>>;
  setFlag: Dispatch<SetStateAction<boolean>>;
  fetchOneGitgraphSnapshot: (snapshots: SnapshotDTO[], selectedIndex: number) => void;
}) => {
  const withoutAuthor = templateExtend(TemplateName.Metro, {
    commit: {
      message: {
        displayAuthor: false,
      },
      spacing: 50,
    },
  });

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    allSnapshots?.length > 0 &&
    selectedSnapshotIndex !== undefined && (
      <Gitgraph options={{ template: withoutAuthor }}>
        {(gitgraph) => {
          const mainBranch = gitgraph.branch({
            name: "main",
            style: {
              color: "gray",
              label: {
                strokeColor: "gray",
              },
              spacing: 0.5,
            },
            commitDefaultOptions: {
              style: {
                color: "gray",
                message: {
                  color: "#d9d5d4",
                },
              },
            },
          });

          allSnapshots.map((snapshot: SnapshotDTO, index) => {
            const snapshotId = snapshot?.id.toString();
            mainBranch.commit({
              hash: `#${snapshotId}`,
              author: "",
              body: formatDateTime(snapshot.created_at),
              subject: snapshot.metadata?.name,
              style: {
                dot: {
                  color: selectedSnapshotIndex === index ? "#d9d5d4" : "gray",
                },
              },
              onClick: () => {
                setFlag(true);
                setSelectedSnapshotIndex(index);
                setSelectedSnapshotId(snapshot?.id);
                fetchOneGitgraphSnapshot(allSnapshots, index);
              },
            });
          });
        }}
      </Gitgraph>
    )
  );
};
