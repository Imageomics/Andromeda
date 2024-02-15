import { apiURL, fetch_json } from "../../backend/util";

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
    jest.spyOn(global, "fetch").mockImplementation(
        jest.fn(
          () => Promise.resolve({ ok: true, json: () => Promise.resolve({"data": 123}),
        }),
      ) as jest.Mock );
    const result = await fetch_json(url, { method: "GET"});
    expect(result).toStrictEqual({
        "data": 123
    });
});
