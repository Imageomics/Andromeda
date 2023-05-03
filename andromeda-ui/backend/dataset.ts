import getConfig from "next/config";
import {
  csvParse,
  autoType,
  deviation,
  sum,
  forceManyBody,
  forceCenter,
  forceSimulation,
  forceLink,
  scaleLinear,
} from "d3";
const { publicRuntimeConfig } = getConfig();
import { enhance_data, normalized_data } from "./andromeda";

function apiURL(suffix: string) {
  return publicRuntimeConfig.apiURL + suffix;
}

const globalDatasets: any = {};
let dataset_next_id = 1;
export async function uploadDataset(file: File) {
  const text = await file.text();
  var data = csvParse(text, autoType);
  globalDatasets[dataset_next_id] = data;
  return { id: dataset_next_id };
}

function scaleCoordinate(x: number, size: number) {
  return x / size - 0.5;
}

function getNumericProperyNames(obj: any) {
  const names = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value == "number") {
      names.push(key);
    }
  }
  return names;
}

function lookupWeight(weights, name) {
  if (name in weights) {
    return weights[name];
  }
  return weights.all;
}

export async function dimensionalReduction(dataset_id: string, weights: any) {
  console.log("dr dataset_id", dataset_id);
  console.log("dr weights", weights);
  const data = globalDatasets[dataset_id];
  data.attrs = getNumericProperyNames(data[0]); // the quantitative attributes in the data table
  data.label = "Image_Label"; // data.columns[0]; // the column to use for the dot labels
  data.stdevs = {}; // zscore normalization factors for each attribute, for Distance()
  data.attrs.forEach(
    (a: any) => (data.stdevs[a] = deviation(data, (r: any) => r[a]))
  );
  data.weights = {};
  data.attrs.forEach((a: any) => (data.weights[a] = lookupWeight(weights, a)));

  // JPB ADDITION: normalize the weights
  const sum_weights = sum(Object.values(data.weights));
  Object.keys(data.weights).forEach(
    (k) => (data.weights[k] = data.weights[k] / sum_weights)
  );

  function Distance(r1, r2) {
    return sum(
      data.attrs.map(
        (attr) =>
          (Math.abs(r1[attr] - r2[attr]) / data.stdevs[attr]) *
          data.weights[attr]
      )
    );
  }

  var vertices = data.map((r, i) => ({ id: r[data.label], index: i, row: r }));
  var edges = []; // completely connected graph
  vertices.forEach((src, isrc) =>
    vertices.forEach((dst, idst) => {
      if (isrc < idst)
        edges.push({
          source: src,
          target: dst,
          mydistance: Distance(src.row, dst.row),
        });
    })
  );
  var graph = { vertices: vertices, edges: edges };

  console.log(graph);
  var size = 700;
  var distanceMultiplier = 600; // spreads out x,y more

  var simulation = forceSimulation(graph.vertices)
    .force(
      "link",
      forceLink(graph.edges)
        .distance((e) => e.mydistance * distanceMultiplier)
        .strength((e) => 10.0 / e.distance)
        .strength(0.5)
    )
    .force("charge", forceManyBody())
    .force("center", forceCenter(size / 2, size / 2));
  simulation.tick();

  const new_images = graph.vertices.map((vert: any) => {
    return {
      label: vert.row.Image_Label,
      url: vert.row.Image_Link,
      x: scaleCoordinate(vert.x, size),
      y: scaleCoordinate(vert.y, size),
    };
  });
  return {
    images: new_images,
    weights: data.weights,
  };
}

function euclidean_distance(a: any, b: any): number {
  if (a != null && b != null) {
    if (a.length == b.length) {
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        let diff = a[i] - b[i];
        let square = diff ** 2;
        result += square;
      }
      return Math.sqrt(result);
    }
  }
  return 0;
}

function manhattan_distance(a: any, b: any): number {
  if (a != null && b != null) {
    if (a.length == b.length) {
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        let diff = a[i] - b[i];
        let absolute = Math.abs(diff);
        result += absolute;
      }
      return result;
    }
  }
  return 0;
}

function pairwise_distance(
  dataset: any,
  selected_cords: any,
  distance_function: string
) {
  console.log("dataset", dataset);
  if (selected_cords.length >= 2) {
    let row_index = selected_cords.length;
    let col_index = selected_cords[0].length;
    let result = [];
    for (let i = 0; i < row_index; ++i) {
      let row = [];
      for (let j = 0; j < row_index; ++j) {
        let distance = 0;
        if (distance_function == "euclidean") {
          distance = euclidean_distance(dataset[i], dataset[j]);
        } else if (distance_function == "manhattan") {
          distance = manhattan_distance(dataset[i], dataset[j]);
        }
        row.push(distance);
      }
      result.push(row);
    }
    return result;
  } else {
    return [];
  }
}

function apply_weights(data: any, weights: any) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    let row = [];
    for (let j = 0; j < weights.length; j++) {
      row.push(data[i][j] * weights[j]);
    }
    result.push(row);
  }
  return result;
}

function stress(distHD: any, dist2D: any) {
  let diff_sum = 0;
  let total_sum = 0;
  for (let i = 0; i < distHD.length; i++) {
    for (let j = 0; j < distHD[0].length; j++) {
      let x = distHD[i][j];
      let y = dist2D[i][j];
      diff_sum += (x - y) ** 2;
      total_sum += x ** 2;
    }
  }
  return diff_sum / total_sum;
}

function new_proposal(current: any, step: any, direction: any) {
  //console.log(current, step, direction)
  let move = current + direction * step * Math.random();
  if (move > 0.9999) {
    move = 0.9999;
  } else if (move < 0.00001) {
    move = 0.00001;
  }
  return move;
}

function inversMDS(
  dataHDpart: any,
  data2Dnew: any,
  dist2D: any,
  selected_cords: any
) {
  const start = Date.now();
  //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  let MAX = 500;
  let col = dataHDpart[0].length;
  let row = dataHDpart.length;

  let curWeights = Array(col).fill(1 / col);
  let newWeights = Array(col).fill(1 / col);

  let flag = Array(col).fill(0);
  let direction = Array(col).fill(1);
  let step = Array(col).fill(1 / col);

  let dataHDw = apply_weights(dataHDpart, curWeights);
  let distHD = pairwise_distance(dataHDw, selected_cords, "manhattan");
  let curStress = stress(distHD, dist2D);
  //console.log("cur_stress: " + curStress)
  for (let i = 0; i < MAX; ++i) {
    for (let dim = 0; dim < col; dim++) {
      let nw = new_proposal(curWeights[dim], step[dim], direction[dim]);
      //console.log(nw)
      let s = 1 + nw - curWeights[dim];
      for (let index = 0; index < curWeights.length; index++) {
        let temp = curWeights[index] / s;
        newWeights[index] = curWeights[index] / s;
      }
      newWeights[dim] = nw / s;

      dataHDw = apply_weights(dataHDpart, newWeights);
      distHD = pairwise_distance(dataHDw, selected_cords, "manhattan");

      let newStress = stress(distHD, dist2D);
      //console.log('newstress: '+ newStress + " curstress: "+curStress)
      if (newStress < curStress) {
        let temp = curWeights;
        curWeights = newWeights;
        newWeights = temp;
        curStress = newStress;
        flag[dim] = flag[dim] + 1;
      } else {
        flag[dim] = flag[dim] - 1;
        direction[dim] = -direction[dim];
      }
      if (flag[dim] >= 5) {
        step[dim] = step[dim] * 2;
        flag[dim] = 0;
      } else if (flag[dim] <= -5) {
        step[dim] = step[dim] / 2;
        flag[dim] = 0;
      }
    }
  }
  const end = Date.now();
  console.log("inverse mds speed: ", end - start);
  console.log("final stress: " + curStress);
  return curWeights;
}

function getDataHDpart(selected_data: any) {
  let result = [];
  for (let i = 0; i < selected_data.length; i++) {
    let row = Object.values(selected_data[i]).slice(1);
    result.push(row);
  }
  return result;
}

function makeSelectedData(data: any, movedPositions: any) {
  const labels = movedPositions.map((pos: any) => pos.label);
  const numeric_names = getNumericProperyNames(data[0]);
  const items = data.filter((item: any) => labels.includes(item.Image_Label));
  return items.map((item: any) => {
    const result: any = { Name: item.Image_Label };
    numeric_names.forEach((name: string) => (result[name] = item[name]));
    return result;
  });
}

function makeDataHDpart(selected_data: any) {
  let result = [];
  for (let i = 0; i < selected_data.length; i++) {
    let row = Object.values(selected_data[i]).slice(1);
    result.push(row);
  }
  return result;
}

export async function reverseDimensionalReduction(
  dataset_id: string,
  movedPositions: any[]
) {
  console.log(movedPositions);
  console.log(dataset_id);
  console.log(globalDatasets);
  const data = globalDatasets[dataset_id];
  console.log(data);

  const selected_data = makeSelectedData(data, movedPositions);
  console.log("selected_data");
  console.log(selected_data);
  const dataHDPart = makeDataHDpart(selected_data);
  console.log("dataHDPart");
  console.log(dataHDPart);
  const width = 1152;
  const height = 700;
  const scale_x = scaleLinear()
    .domain([0, width]) // unit: km
    .range([-30, 30]); // unit: pixels

  const scale_y = scaleLinear()
    .domain([0, height]) // unit: km
    .range([30, -30]); // unit: pixels
  const selected_cords = movedPositions.map((pos: any) => {
    return { x: scale_x(pos.x), y: scale_y(pos.y) };
  });

  const dist2D = pairwise_distance(selected_cords, selected_cords, "euclidean");
  console.log("dist2D");
  console.log(dist2D);
  /*
  const result = inversMDS(dataHDPart, selected_cords, dist2D, selected_cords);
  console.log("result");
  console.log(result);
*/
  return {
    weights: [],
  };
}
