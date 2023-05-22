import Papa from papaparse;


function parse_file(file){
    // parse passed file
    var config = {dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => {
            setParsedCsvData(results.data)
        }};

    var results = Papa.parse(file, {
                                complete: function(results) {
                                    console.log(results);
                                }
                            },
                            config);
    return results
}

function label_opts(results){
    // find and return list of columns that have unique values (i.e., can serve as labels)
    // results[0] is list of column names
    const NUM_KEYS = results[0].length;
    const NUM_ROWS = results.length;
    label_cols = new Array();
    for (let col = 0; col < NUM_KEYS; col++) {
        var current_col_vals = new Set()
        for (let row = 1; row < NUM_ROWS; row++) {
            // cycle through the column's values (excluding header)
            current_col_vals.add(results[row][col])
        }
        if (current_col_vals == NUM_ROWS - 1) {
            // all elements of column are unique
            label_cols[label_cols.length] = results[0][col]
        }
    }
    return label_cols
}

function find_url(results){
    // find and return array of columns that have url values by checking first row of data
    url_cols = new Array();
    for (let col = 0; col < results[0].length; col++) {
        if (typeof results[1][col] == 'string') {
            if (results[1][col].includes('http')){
                url_cols[url_cols.length] = results[0][col]
            }
        }
    }
    return url_cols
}

function get_numeric_cols(results){
    // find and return array of columns with numeric values
    numeric_cols = new Array();
    for (let col = 0; col < results[0].length; col++) {
        if (typeof results[1][col] == 'number') {
            numeric_cols[numeric_cols.length] = results[0][col]
        }
    }
    return numeric_cols
}
