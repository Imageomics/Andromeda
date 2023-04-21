import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

function apiURL(suffix: string) {
  return publicRuntimeConfig.apiURL + suffix;
}

export async function uploadDataset(file: File) {
  console.log(publicRuntimeConfig.apiURL);
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(apiURL("/dataset/"), {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function dimensionalReduction(dataset_id: string, weights: any) {
  const data = {
    weights: weights,
  };
  const response = await fetch(
    apiURL("/dataset/" + dataset_id + "/dimensional-reduction"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

export async function reverseDimensionalReduction(
  dataset_id: string,
  movedPositions: any[]
) {
  const data = {
    images: movedPositions,
  };
  const response = await fetch(
    apiURL("/dataset/" + dataset_id + "/inverse-dimensional-reduction"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}
