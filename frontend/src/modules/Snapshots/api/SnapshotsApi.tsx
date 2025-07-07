import Api, { BASIC_HEADERS } from "../../../utils/api";
import { Res } from "../../../common/interfaces/Api";
import {
  ALL_SNAPSHOTS,
  ONE_SNAPSHOT,
  SNAPSHOT_DIFF,
  SNAPSHOT_RESULT,
  STOP_RUNNING,
  UPDATE_SNAPSHOT,
  UPDATE_SNAPSHOTS,
} from "../../../utils/api/apiRoutes";
import { API_METHODS } from "../../../common/enums/Api";
import { SnapshotDTO } from "../SnapshotDTO";

export interface SnapshotResult {
  items: SnapshotDTO[];
  per_page: number;
  page: number;
  total_items: number;
  total_pages: number;
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

  static fetchSnapshot(id: string): Promise<Res<SnapshotDTO>> {
    return this._fetch(this.api(ONE_SNAPSHOT(id)), API_METHODS.GET, {
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
      // queryParams: { data_path, value },
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
      // queryParams: { data_path, value },
    });
  }

  static stopNodeRunning(): Promise<Res<boolean>> {
    return this._fetch(this.api(STOP_RUNNING()), API_METHODS.POST, {
      headers: BASIC_HEADERS,
      // body: JSON.stringify({ data_path, value }),
      // queryParams: { data_path, value },
    });
  }
}
