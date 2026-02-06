import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "..";
import {SnapshotData, SnapshotDTO} from "./api/SnapshotsApi";
import {NodeDTO} from "../../modules/Nodes";
import {InputParameter} from "../../components";

export const getSnapshotsState = (state: RootState) => state.snapshots;

export const getNodesState = (state: RootState) => state.nodes;

export const getTrackLatestSidePanel = createSelector(getSnapshotsState, (state) => state.trackLatestSidePanel);

export const getTrackPreviousSnapshot = createSelector(getSnapshotsState, (state) => state.trackPreviousSnapshot);

export const getTotalPages = createSelector(getSnapshotsState, (state) => state.totalPages);

export const getPageNumber = createSelector(getSnapshotsState, (state) => state.pageNumber);

export const getAllSnapshots = createSelector(getSnapshotsState, (state) => state.allSnapshots);

export const getIsLoadingSnapshots = createSelector(getSnapshotsState, (state) => state.isLoadingSnapshots);

export const getSnapshotsSearchQuery = createSelector(
    getSnapshotsState,
    getPageNumber,
    (state, pageNumber) => {
        const {tags, sortType, searchString, minDate, maxDate} =
            state.snapshotsFilters;

        const baseParams = {
            page: pageNumber.toString(),
            per_page: "100",
            descending: "true",
            sort: sortType,
            grouped: "true",
            ...(searchString && {name_part: searchString}),
            ...(minDate && { min_date: minDate }),
            ...(maxDate && { max_date: maxDate }),
        };

        const tagParams =
            tags?.reduce((acc, tag) => {
                acc.push(["tag_name", tag]);
                return acc;
            }, [] as [string, string][]) ?? [];

        return new URLSearchParams([
            ...Object.entries(baseParams),
            ...tagParams,
        ]).toString();
    }
);


export const getSelectedSnapshot = createSelector(getSnapshotsState, (state) => state.selectedSnapshot);

export const getAllTags = createSelector(getSnapshotsState, (state) => state.allTags);

export const getSelectedWorkflow = createSelector(getSnapshotsState, (state) => state.selectedWorkflow);

export const getSelectedNodeInWorkflowName = createSelector(getSnapshotsState, (state) => state.selectedNodeInWorkflowId);

export const getBreadCrumbs = createSelector(getSnapshotsState, (state) => state.breadCrumbs);

const findByBreadcrumbs = (items: SnapshotDTO[], breadcrumbs: string[]): SnapshotDTO | undefined =>
    breadcrumbs.reduce<SnapshotDTO | undefined>((current, name, index) => {
        const source = index === 0 ? items : current?.type_of_execution === "workflow" ? current.items : undefined;

        if (!source) return undefined;

        return source.find((item: SnapshotDTO) => item.metadata?.name === name);
    }, undefined);

export const getSelectedWorkflowForGraph = createSelector(getAllSnapshots, getBreadCrumbs, (allSnapshots = [], breadcrumbs = []) =>
    breadcrumbs.length ? findByBreadcrumbs(allSnapshots, breadcrumbs) : undefined
);

export const getSelectedSnapshotId = createSelector(getSnapshotsState, (state) => state.selectedSnapshotId);

export const getLatestSnapshotId = createSelector(getSnapshotsState, (state) => state.latestSnapshotId);

export const getClickedForSnapshotSelection = createSelector(getSnapshotsState, (state) => state.clickedForSnapshotSelection);

export const getJsonData = createSelector(getSnapshotsState, (state) => state.jsonData);

export const getJsonDataSidePanel = createSelector(getSnapshotsState, (state) => state.jsonDataSidePanel);

export const getDiffData = createSelector(getSnapshotsState, (state) => state.diffData);

export const getResult = createSelector(getSnapshotsState, (state) => state.result);

export const getFirstId = createSelector(getSnapshotsState, (state) => state.firstId);

export const getSecondId = createSelector(getSnapshotsState, (state) => state.secondId);

export const getSelectedSnapshotNode = createSelector(getSnapshotsState, getNodesState, getJsonData,
    (snapshotState, nodesState, jsonData) => {
        const node = nodesState?.allNodes ? nodesState?.allNodes[snapshotState.selectedSnapshot?.metadata?.name ?? ""] : undefined;
        const model = (jsonData as SnapshotData).parameters?.model;

        if (!node || !model) return undefined;

        const newParameters: InputParameter = {};

        Object.entries(node.parameters || {}).forEach(([key, param]) => {
            const modelParamValue = model[key];
            newParameters[key] = {
                ...param,
                default: modelParamValue || ""
            };
        });

        return {
            ...node,
            parameters: newParameters,
        } as NodeDTO;
    }
);