import { fetch_json, apiURL } from "./util";

const IMAGE_GRID_MAX_VALUE = 1.0;

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return await fetch_json(apiURL("/dataset/"), {
    method: "POST",
    body: formData,
  });
}

export async function readDataset(datasetId: string) {
  const url = apiURL("/dataset/" + datasetId);
  const response = await fetch(url);
  const text = await response.text()
  return text;
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

export function calculatePointScaling(images: any[]) {
  const max_abs_x = Math.max(...images.map(img => Math.abs(img.x)));
  const max_abs_y = Math.max(...images.map(img => Math.abs(img.y)));
  const max_x_y_value = Math.max(max_abs_x, max_abs_y);
  // the image grid top left is 1,1 and the bottom right is -1,-1
  // the maximum displayable abs(value) is 1 (IMAGE_GRID_MAX_VALUE)
  // if the points already fit we do not need to scale the points
  if (max_x_y_value > IMAGE_GRID_MAX_VALUE) {
    return 1.0 / max_x_y_value;
  } else {
    return 1.0; // default scaling
  }
}

export async function getColumnConfig() {
  return await fetch_json(apiURL("/column-config"), {});
}
