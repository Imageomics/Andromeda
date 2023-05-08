import * as d3 from "d3";

export function readData(fileOrText) {
  var data = d3.csvParse(fileOrText, d3.autoType);
  data.attrs = data.columns.slice(1); // the quantitative attributes in the data table
  data.label = data.columns[0]; // the column to use for the dot labels
  data.stdevs = {}; // zscore normalization factors for each attribute, for Distance()
  data.attrs.forEach((a) => (data.stdevs[a] = d3.deviation(data, (r) => r[a])));
  data.weights = {};
  data.attrs.forEach((a) => (data.weights[a] = 1.0));
  return data;
}
