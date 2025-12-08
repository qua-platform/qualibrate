import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../utils/api/types";
import {
  ALL_SNAPSHOTS,
  ONE_SNAPSHOT,
  SNAPSHOT_DIFF,
  SNAPSHOT_RESULT,
  STOP_RUNNING,
  UPDATE_SNAPSHOT,
  UPDATE_SNAPSHOTS,
} from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../utils/api/types";
import { GlobalParameterStructure } from "../../GraphStores/GraphStatus";

type SnapshotLoadTypeFlag =
  | "Minified"
  | "Metadata"
  | "DataWithoutRefs"
  | "DataWithMachine"
  | "DataWithResults"
  | "DataWithResultsWithImgs"
  | "Full";

interface SnapshotResult {
  items: SnapshotDTO[];
  per_page: number;
  page: number;
  total_items: number;
  total_pages: number;
}

export interface SnapshotDTO {
  created_at: string;
  status?: string;
  id: number;
  result?: object;
  data?: { [key: string]: object; };
  metadata?: {
    description?: string | null;
    data_path: string;
    name: string;
    run_start?: string | null;
    run_end?: string | null;
    run_duration?: number | null;
  };
  parents: [];
  parameters?: GlobalParameterStructure;
  outcomes?: object;
}

export class SnapshotsApi extends Api {
  constructor() {
    super();
  }

  static api(path: string): string {
    return this.address + path;
  }

  static fetchAllSnapshots(pageNumber: number): Promise<Res<SnapshotResult>> {
    return this._fetch(this.api(ALL_SNAPSHOTS({ pageNumber })), API_METHODS.GET, {
      headers: BASIC_HEADERS,
    });
  }

  static fetchSnapshot(id: string, loadTypeFlag?: SnapshotLoadTypeFlag[]): Promise<Res<SnapshotDTO>> {
    const url = this.api(ONE_SNAPSHOT(id));
    const params = new URLSearchParams();

    // Use DataWithMachine as default if no load type flag is provided
    const flagsToUse = loadTypeFlag && loadTypeFlag.length > 0 ? loadTypeFlag : ["DataWithMachine"];

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
}
