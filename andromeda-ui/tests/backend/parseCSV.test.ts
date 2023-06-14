import { createColumnDetails } from "../../backend/parseCSV";

test("createColumnDetails removes columns containing a single value", () => {
  const rows = [
    {
      Label: "p1",
      NumGood: 1,
      NumBad: 1,
    },
    {
      Label: "p2",
      NumGood: 2,
      NumBad: 1,
    },
    {
      Label: "p3",
      NumGood: 3,
      NumBad: 1,
    },
  ];
  const result = createColumnDetails(rows);
  expect(result.labels).toStrictEqual(["Label", "NumGood"]);
  expect(result.columns).toStrictEqual(["NumGood"]);
  expect(result.urls).toStrictEqual([]);
});

test("createColumnDetails can find URL columns", () => {
  const rows = [
    {
      Label: "p1",
      NumGood: 1,
      GoodURL: "https://example.com/p1.png",
    },
    {
      Label: "p2",
      NumGood: 2,
      GoodURL: "https://example.com/p2.png",
    },
    {
      Label: "p3",
      NumGood: 3,
      GoodURL: "https://example.com/p3.png",
    },
  ];
  const result = createColumnDetails(rows);
  expect(result.labels).toStrictEqual(["Label", "NumGood"]);
  expect(result.columns).toStrictEqual(["NumGood"]);
  expect(result.urls).toStrictEqual(["GoodURL"]);
});
