import { fetch_json, apiURL } from "./util";

export async function fetchObservations(iNatUser: string, addSatCSV: boolean, addLandCover: boolean) {
    const url = makeObservationURL(iNatUser, addSatCSV, addLandCover, "json");
    return await fetch_json(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export function makeObservationURL(iNatUser: string, addSatCSV: boolean, addLandCover: boolean, format: "json" | "csv") {
  let base_url = "/inaturalist/" + iNatUser;
  if (format) {
    base_url += "?format=" + format;
  }
  base_url += "&add_sat_csv_data=" + addSatCSV;
  base_url += "&add_land_api_data=" + addLandCover;
  return apiURL(base_url);
}
