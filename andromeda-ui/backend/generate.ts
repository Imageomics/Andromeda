import { fetch_json, apiURL } from "./dataset";

function satDatasetPlayload(satDataset: string) {
  const payload: any = {};
  if (satDataset) {
    payload["satDataset"] = satDataset;
  }
  return payload;
}

export async function fetchObservations(iNatUser: string, satDataset: string) {
  const result = await fetch_json(apiURL("/inaturalist/" + iNatUser), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(satDatasetPlayload(satDataset)),
  });
  return result;
}

export async function generateCSV(iNatUser: string, satDataset: string) {
  const result = await fetch_json(apiURL("/inaturalist/" + iNatUser + "/csv"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(satDatasetPlayload(satDataset)),
  });
  return result;
}
