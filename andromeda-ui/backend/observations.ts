import { fetch_json, apiURL } from "./util";

export async function fetchObservations(iNatUser: string, addSatRGB: boolean, addLandCover: boolean) {
    const url = makeObservationURL(iNatUser, addSatRGB, addLandCover, "json");
    return await fetch_json(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export function makeObservationURL(iNatUser: string, addSatRGB: boolean, addLandCover: boolean, format: "json" | "csv") {
  let base_url = "/inaturalist/" + iNatUser;
  if (format) {
    base_url += "?format=" + format;
  }
  base_url += "&add_sat_rgb_data=" + addSatRGB;
  base_url += "&add_landcover_data=" + addLandCover;
  return apiURL(base_url);
}
