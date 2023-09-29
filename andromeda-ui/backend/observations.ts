import { fetch_json, apiURL } from "./util";

export const LANDCOVER_FETCH_SECONDS = 5;

export async function fetchObservations(iNatUser: string, addLandCover: boolean,
  maxObs: number) {
    const url = makeObservationURL(iNatUser, addLandCover, "json", maxObs);
    return await fetch_json(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export function makeObservationURL(iNatUser: string, addLandCover: boolean, 
      format: "json" | "csv", maxObs?: number) {
  let base_url = "/inaturalist/" + iNatUser + "?format=" + format;
  if (maxObs) {
    base_url += "&limit=" + maxObs;
  }
  base_url += "&add_landcover_data=" + addLandCover;
  return apiURL(base_url);
}

export function downloadSecondsEstimate(numObservations: number) {
  const seconds = numObservations * LANDCOVER_FETCH_SECONDS;
  if (seconds < 60) {
    return seconds + "seconds";
  } else {
    return Math.ceil(seconds / 60) + " minutes"
  }
}
