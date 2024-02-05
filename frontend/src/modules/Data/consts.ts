export enum DataVizView {
  "HDF5",
  "Dash",
  "Data",
}

export const DATA_VIS_VIEWS = [
  { value: "Data view", key: DataVizView.Data },
  { value: "Timeline", key: DataVizView.Dash },
  { value: "Raw HDF5 explorer", key: DataVizView.HDF5 },
];
