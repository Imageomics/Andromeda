import { makeObservationURL, fetchObservations } from "../../backend/observations";
import fetchMock from 'fetch-mock';

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        apiURL: 'https://example.com/api'
    }
}))

test("makeObservationURL can create a json url", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=json";
    expect(makeObservationURL("bob", "json")).toStrictEqual(expected);
});

test("makeObservationURL creates a CSV URL", () => {
    const expected = "https://example.com/api/inaturalist/bob?format=csv";
    expect(makeObservationURL("bob", "csv")).toStrictEqual(expected);
});

test("fetchObservations returns JSON result of observations", async () => {
    const payload = {
        "user_id": "bob",
        "data": [{"label": "p1"}],
        "warnings": ["some_warning"]        
    }
    fetchMock.get('https://example.com/api/inaturalist/bob?format=json', payload);
    const results = await fetchObservations("bob");
    expect(results).toStrictEqual(payload);
    fetchMock.restore();
});
