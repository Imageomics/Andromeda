normalized_data = {
  var stdMean = []
  for(var i = 0; i < attrs.length; i++){
    var obj = {};
    var arr = new_data.map(r=>r[attrs[i]]);
    obj['std_dev'] = d3.deviation(arr);
    obj['mean'] = d3.deviation(arr);
    stdMean.push(obj);
  }
  
  return new_data.map(r => {
    var norm = Object.assign({}, r);
    for(var i = 0; i < attrs.length; i++) {
      norm[attrs[i]] = (norm[attrs[i]] - stdMean[i]["mean"]) / stdMean[i]["std_dev"];
    }
    return norm;
  })
}


