import { createColumnDetails, getDefaultSelectedColumns } from "../../backend/parseCSV";

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


test("getDefaultSelectedColumns filters out specific columns",() => {
  const result = getDefaultSelectedColumns({
    "columns": [
      // columns to keep
      "Image_Label", "Image_Link", "Date", "Time",
      "Lat", "Long", "Species",
      "sat_good", "land_good",
      // columns to remove
      "sat_Lat-Center", "sat_Lon-Center",
      "sat_Lat-NW", "sat_Lon-NW", "sat_Lat-SE", "sat_Lon-SE",
      "land_Lat-Center", "land_Lon-Center",
      "land_Lat-NW", "land_Lon-NW", "land_Lat-SE", "land_Lon-SE", "sat_in", "land_in",
      "Seconds",
      // column to keep
      "Other"
    ]
  })
  expect(result).toStrictEqual([
    "Image_Label", "Image_Link", "Date", "Time",
      "Lat", "Long", "Species",
      "sat_good", "land_good", "Other"
  ]);
});
