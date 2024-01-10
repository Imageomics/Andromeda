import { NextRouter } from 'next/router'

export interface UrlColumnSettings {
    datasetID: string;
    datasetName: string;
    label: string;
    url: string;
    selected: string[];
}

export function ensureIsString(item: any) : string {
    if (isNonEmptyString(item)) {
        return item
    }
    return "";
}

export function isNonEmptyString(item: any): boolean {
    return item && typeof item === "string";
}

function ensureIsArray(item: any) : string[] {
    if (item && Array.isArray(item)) {
        return item
    }
    return [];
}

export function makeUrlColumnSettings(router: NextRouter) : UrlColumnSettings {
    let datasetID = ensureIsString(router.query.dataset);
    let datasetName = ensureIsString(router.query.name);
    if (!datasetName) {
        datasetName = datasetID;
    }
    return {
        datasetID: datasetID,
        datasetName: datasetName,
        label: ensureIsString(router.query.label),
        url: ensureIsString(router.query.url),
        selected: ensureIsArray(router.query.selected),
    };
}

export function configureURLQueryDict(datasetName: string, label: string, url: string, selected: string[]) {
    return {
        name: datasetName,
        label: label,
        url: url,
        selected: selected
    }
}
