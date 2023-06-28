import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export function apiURL(suffix: string) {
    return publicRuntimeConfig.apiURL + suffix;
}

export async function fetch_json(url: string, props: any) {
    const response = await fetch(url, props);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.description);
    }
    return payload;
}
