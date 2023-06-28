import { fetch_json, apiURL } from "./util";

export async function fetchObservations(iNatUser: string) {
    const url = makeObservationURL(iNatUser, "json");
    return await fetch_json(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export function makeObservationURL(iNatUser: string, format: "json" | "csv") {
  let base_url = "/inaturalist/" + iNatUser;
  if (format) {
    base_url += "?format=" + format;
  }
  return apiURL(base_url);
}
