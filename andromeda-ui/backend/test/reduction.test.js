const fs = require("fs");
const reduction = require("../reduction");

async function readTestAnimalData() {
  console.log("Current directory:", __dirname);
  const csvData = fs.readFileSync(
    "/Users/jpb67/Documents/work/Andromeda/andromeda-ui/backend/test/Animal_Data_Andromeda.csv",
    "utf8"
  );
  return csvData;
}

test("adds 1 + 2 to equal 3", async () => {
  const csvData = await readTestAnimalData();
  const data = reduction.readData(csvData);
  expect(1).toBe(1);
});
