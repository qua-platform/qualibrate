import Api, { BASIC_HEADERS } from "../../../utils/api";
import { API_METHODS, Res } from "../../../utils/api/types";
import {
  ADD_COMMENT_TO_SNAPSHOT,
  ADD_TAGS_TO_SNAPSHOT,
  ALL_COMMENTS_FOR_ONE_SNAPSHOT,
  ALL_SNAPSHOT_TAGS,
  ALL_SNAPSHOTS,
  ALL_TAGS_FOR_ONE_SNAPSHOT,
  CREATE_NEW_TAG,
  DELETE_TAG,
  ONE_SNAPSHOT,
  REMOVE_COMMENT_FROM_SNAPSHOT,
  REMOVE_TAG_FROM_SNAPSHOT,
  SNAPSHOT_DIFF,
  SNAPSHOT_RESULT,
  STOP_RUNNING,
  UPDATE_COMMENT_SNAPSHOT,
  UPDATE_SNAPSHOT,
  UPDATE_SNAPSHOTS,
} from "../../../utils/api/apiRoutes";
import { GlobalParameterStructure } from "../../GraphStores/GraphStatus";

type SnapshotLoadTypeFlag =
  | "Minified"
  | "Metadata"
  | "DataWithoutRefs"
  | "DataWithMachine"
  | "DataWithResults"
  | "DataWithResultsWithImgs"
  | "Full";

export interface SnapshotResult {
  items: SnapshotDTO[];
  per_page: number;
  has_next_page: boolean;
  page: number;
  total_items: number;
  total_pages: number;
}

export interface SnapshotMetadata {
  description?: string | null;
  data_path: string;
  name: string;
  run_start?: string | null;
  run_end?: string | null;
  run_duration?: number | null;
  status?: string | null;
}

export interface ParameterStructure {
  [key: string]: string | number | null | undefined | string[];
}

export interface SnapshotData {
  machine?: {
    channels: { [key: string]: object };
  };
  parameters?: {
    model?: ParameterStructure;
    [key: string]: unknown;
  };
  quam?: { channels: { [key: string]: object } };

  [key: string]: unknown;
}

export type SnapshotSearchType = "name" | "date" | "status";

export type SnapshotOutcomesType = {
  [key: string]: {
    status: string;
    failed_on?: string;
  };
};

export type SnapshotComment = {
  id: number;
  value: string;
  createdAt: string;
};

export interface SnapshotDTO {
  type_of_execution: "node" | "workflow";
  items?: SnapshotDTO[];
  created_at: string;
  status?: string;
  id: number;
  result?: object;
  data?: SnapshotData;
  metadata: SnapshotMetadata;
  parents: number[];
  parameters?: GlobalParameterStructure;
  outcomes?: SnapshotOutcomesType;
  nodes_completed?: number;
  nodes_total?: number;
  qubits_completed?: number;
  qubits_total?: number;
  tags?: string[];
  comments?: SnapshotComment[];
}

export class SnapshotsApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllSnapshots(
    pageNumber: number,
    sortType: SnapshotSearchType = "name",
    searchString?: string,
    minDate?: string,
    maxDate?: string
  ): Promise<Res<SnapshotResult>> {
    return this._fetch(
      this.api(
        ALL_SNAPSHOTS({
          pageNumber,
          sortType,
          searchString,
          minDate,
          maxDate,
        })
      ),
      API_METHODS.GET,
      {
        headers: BASIC_HEADERS,
      }
    );
  }

  static fetchSnapshot(id: string, loadTypeFlag?: SnapshotLoadTypeFlag[]): Promise<Res<SnapshotDTO>> {
    const url = this.api(ONE_SNAPSHOT(id));
    const params = new URLSearchParams();

    // Use DataWithMachine as default if no load type flag is provided
    const flagsToUse = loadTypeFlag && loadTypeFlag.length > 0 ? loadTypeFlag : ["Full"];

    flagsToUse.forEach((flag) => params.append("load_type_flag", flag));

    const urlWithParams = `${url}?${params.toString()}`;

    return this._fetch(urlWithParams, API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchSnapshotResult(id: string): Promise<Res<object>> {
    return this._fetch(this.api(SNAPSHOT_RESULT(id)), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchSnapshotUpdate(currentId: string, newId: string): Promise<Res<object>> {
    return this._fetch(this.api(SNAPSHOT_DIFF(currentId, newId)), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static updateState(snapshotId: string, data_path: string, value: unknown): Promise<Res<boolean>> {
    return this._fetch(this.api(UPDATE_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ data_path, value }),
    });
  }

  static updateStates(
    snapshotId: string,
    listOfUpdates: {
      data_path: string;
      value: unknown;
    }[]
  ): Promise<Res<boolean>> {
    return this._fetch(this.api(UPDATE_SNAPSHOTS(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ items: listOfUpdates }),
    });
  }

  static stopNodeRunning(): Promise<Res<boolean>> {
    return this._fetch(this.api(STOP_RUNNING()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
    });
  }

  static createNewTag(tag: string): Promise<Res<boolean>> {
    return this._fetch(this.api(CREATE_NEW_TAG()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ name: tag }),
    });
  }

  static fetchAllTags(): Promise<Res<string[]>> {
    return this._fetch(this.api(ALL_SNAPSHOT_TAGS()), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static deleteTag(tag: string): Promise<Res<boolean>> {
    return this._fetch(this.api(DELETE_TAG()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ name: tag }),
    });
  }

  static addTagsToSnapshot(snapshotId: string, tags: string[]): Promise<Res<boolean>> {
    return this._fetch(this.api(ADD_TAGS_TO_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ tags }),
    });
  }

  static removeTagFromSnapshot(snapshotId: string, tag: string): Promise<Res<boolean>> {
    return this._fetch(this.api(REMOVE_TAG_FROM_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ name: tag }),
    });
  }

  static fetchAllTagsForSnapshot(snapshotId: string): Promise<Res<string[]>> {
    return this._fetch(this.api(ALL_TAGS_FOR_ONE_SNAPSHOT(snapshotId)), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static addCommentToSnapshot(snapshotId: string, commentText: string): Promise<Res<SnapshotComment>> {
    return this._fetch(this.api(ADD_COMMENT_TO_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ value: commentText }),
    });
  }

  static updateSnapshotComment(snapshotId: string, comment: SnapshotComment): Promise<Res<boolean>> {
    return this._fetch(this.api(UPDATE_COMMENT_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify(comment),
    });
  }

  static fetchAllCommentsForSnapshot(snapshotId: string): Promise<Res<SnapshotComment[]>> {
    return this._fetch(this.api(ALL_COMMENTS_FOR_ONE_SNAPSHOT(snapshotId)), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static removeCommentFromSnapshot(snapshotId: string, commentId: string): Promise<Res<boolean>> {
    return this._fetch(this.api(REMOVE_COMMENT_FROM_SNAPSHOT(snapshotId)), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      body: JSON.stringify({ id: commentId }),
    });
  }
}
