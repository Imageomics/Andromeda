import { deviation } from "d3";

export function enhance_data(data: any) {
  data.attrs = data.columns.slice(1); // the quantitative attributes in the data table
  data.label = data.columns[0]; // the column to use for the dot labels
  data.stdevs = {}; // zscore normalization factors for each attribute, for Distance()
  data.attrs.forEach(
    (a: any) => (data.stdevs[a] = deviation(data, (r: any) => r[a]))
  );
  data.weights = {};
  data.attrs.forEach((a: any) => (data.weights[a] = 1.0));
  return data;
}

export function normalized_data(attrs: any, new_data: any) {
  var stdMean: any = [];
  for (var i = 0; i < attrs.length; i++) {
    var obj: any = {};
    var arr = new_data.map((r: any) => r[attrs[i]]);
    obj["std_dev"] = deviation(arr);
    obj["mean"] = deviation(arr);
    stdMean.push(obj);
  }

  return new_data.map((r: any) => {
    var norm = Object.assign({}, r);
    for (var i = 0; i < attrs.length; i++) {
      norm[attrs[i]] =
        (norm[attrs[i]] - stdMean[i]["mean"]) / stdMean[i]["std_dev"];
    }
    return norm;
  });
}
