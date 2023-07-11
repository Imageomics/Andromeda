import { makeObservationURL, fetchObservations } from "../../backend/observations";
import fetchMock from 'fetch-mock';

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        apiURL: 'https://example.com/api'
    }
}))

test("makeObservationURL can create a json url", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=json&add_sat_rgb_data=false&add_landcover_data=false";
    expect(makeObservationURL("bob", false, false, "json")).toStrictEqual(expected);
});

test("makeObservationURL creates a CSV URL", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=csv&add_sat_rgb_data=false&add_landcover_data=false";
    expect(makeObservationURL("bob",false, false, "csv")).toStrictEqual(expected);
});

test("makeObservationURL can add RGB data param", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=json&add_sat_rgb_data=true&add_landcover_data=false";
    expect(makeObservationURL("bob", true, false, "json")).toStrictEqual(expected);
});

test("makeObservationURL can add landcover data param", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=json&add_sat_rgb_data=false&add_landcover_data=true";
    expect(makeObservationURL("bob", false, true, "json")).toStrictEqual(expected);
});

test("fetchObservations returns JSON result of observations", async () => {
    const payload = {
        "user_id": "bob",
        "data": [{"label": "p1"}],
        "warnings": ["some_warning"]        
    }
    fetchMock.get('https://example.com/api/inaturalist/bob?format=json&add_sat_rgb_data=false&add_landcover_data=false', payload);
    const results = await fetchObservations("bob", false, false);
    expect(results).toStrictEqual(payload);
    fetchMock.restore();
});
