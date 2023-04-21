import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

function apiURL(suffix: string) {
  return publicRuntimeConfig.apiURL + suffix;
}

async function fetch_json(url: string, props: any) {
  const response = await fetch(url, props);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.description);
  }
  return payload;
}

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return await fetch_json(apiURL("/dataset/"), {
    method: "POST",
    body: formData,
  });
}

export async function dimensionalReduction(dataset_id: string, weights: any) {
  const data = {
    weights: weights,
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
  movedPositions: any[]
) {
  const data = {
    images: movedPositions,
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
