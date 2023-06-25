import { apiURL, fetch_json } from "../../backend/util";
import fetchMock from 'fetch-mock';

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        apiURL: 'https://example.com/api'
    }
}))

test("apiURL creates a URL for a prefix", () => {
    const expected = "https://example.com/api/dataset/123";
    expect(apiURL("/dataset/123")).toStrictEqual(expected);
});

test("fetch_json calls fetch", async () => {
    const url = "https://example.com/api/dataset/123";
    fetchMock.get(url, {
        "data": 123
    });
    const result = await fetch_json(url, { method: "GET"});
    expect(result).toStrictEqual({
        "data": 123
    });
});
