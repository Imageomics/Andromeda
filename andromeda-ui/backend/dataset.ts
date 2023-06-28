import { fetch_json, apiURL } from "./util";

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return await fetch_json(apiURL("/dataset/"), {
    method: "POST",
    body: formData,
  });
}

export async function dimensionalReduction(
  dataset_id: string,
  weights: any,
  columnSettings: any
) {
  const data = {
    weights: weights,
    columnSettings: columnSettings,
  };
  return await fetch_json(
    apiURL("/dataset/" + dataset_id + "/dimensional-reduction"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}

export async function reverseDimensionalReduction(
  dataset_id: string,
  movedPositions: any[],
  columnSettings: any
) {
  const data = {
    images: movedPositions,
    columnSettings: columnSettings,
  };
  return await fetch_json(
    apiURL("/dataset/" + dataset_id + "/inverse-dimensional-reduction"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}
