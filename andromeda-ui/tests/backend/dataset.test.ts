import { calculatePointScaling } from "../../backend/dataset";

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        apiURL: 'https://example.com/api'
    }
}))

test("calculatePointScaling when points larger than 1", () => {
    const result = calculatePointScaling([
        { x: 0.5, y: 0.3},
        { x: 2, y: 4}
    ])
    expect(result).toEqual(0.25);
});

test("calculatePointScaling when points really large", () => {
    const result = calculatePointScaling([
        { x: 10, y: 4}
    ])
    expect(result).toEqual(0.1);
});

test("calculatePointScaling when points less than 1", () => {
    const result = calculatePointScaling([
        { x: 0.5, y: 0.3},
        { x: 0.75, y: 0.5},
        
    ])
    expect(result).toEqual(1.0);
});
