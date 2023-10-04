import { fetch_json, apiURL } from "./util";

export const LANDCOVER_FETCH_SECONDS = 5;

export async function fetchObservations(iNatUser: string, addSatRGB: boolean, addLandCover: boolean,
      maxObs: number) {
    const url = makeObservationURL(iNatUser, addSatRGB, addLandCover, "json", maxObs);
    return await fetch_json(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export function makeObservationURL(iNatUser: string, addSatRGB: boolean, addLandCover: boolean,
    format: "json" | "csv", maxObs?: number) {
  let base_url = "/inaturalist/" + iNatUser;
  base_url += "?format=" + format;
  if (maxObs) {
    base_url += "&limit=" + maxObs;
  }
  base_url += "&add_sat_rgb_data=" + addSatRGB;
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

export function makeObservationDatasetURL(iNatUser: string, addSatRGBData: boolean, addLandCover: boolean) {
  let url = `/inaturalist/${iNatUser}/dataset?` +
            `add_sat_rgb_data=${addSatRGBData}&add_landcover_data=${addLandCover}`;
  return apiURL(url);
}

export async function createObservationDataset(iNatUser: string, addSatRGBData: boolean,
      addLandCover: boolean) {
  const url = makeObservationDatasetURL(iNatUser, addSatRGBData, addLandCover);
  console.log(url);
  return await fetch_json(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  });
}
