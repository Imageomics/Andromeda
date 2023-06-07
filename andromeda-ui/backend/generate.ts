import { fetch_json, apiURL } from "./dataset";

export async function generateCSV(iNatUser: string) {
  const result = await fetch_json(apiURL("/inaturalist/" + iNatUser), {
    method: "POST",
  });
  return result;
}
