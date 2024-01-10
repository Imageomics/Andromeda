import Papa from "papaparse";

export async function parseCSVFile(fileContent: string) {
  // Wrap Papa.parse in a promise to allow async/await usage
  const promise: any = new Promise((resolve, reject) => {
    var config = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      },
    };
    Papa.parse(fileContent, config);
  });
  return await promise;
}

export function getColumnNames(rows: any[]) {
  if (rows && rows.length > 0) {
    return Object.keys(rows[0]);
  }
  throw new Error("This CSV dataset is empty.");
}

function valuesAreUnique(rows: any[], columnName: string) {
  const uniqueValues = new Set(rows.map((x) => x[columnName]));
  return rows.length == uniqueValues.size;
}

function isURL(value: any) {
  if (typeof value === "string") {
    if (value.startsWith("http")) {
      return true;
    }
  }
  return false;
}

function valuesAreURLs(rows: any[], columnName: string) {
  return rows.every((x) => isURL(x[columnName]));
}

function isLabelColumn(rows: any[], columnName: string) {
  return valuesAreUnique(rows, columnName) && !valuesAreURLs(rows, columnName);
}

export function getLabelColumnNames(rows: any[]) {
  // find and return the names of columns that have unique values (i.e., can serve as labels)
  // and are not URLs. Raises error if no label columns are found.
  const columnNames = getColumnNames(rows).filter((columnName) =>
    isLabelColumn(rows, columnName)
  );
  if (columnNames.length === 0) {
    throw new Error(
      "No unique columns found in your CSV dataset. Please add a unique column to serve as a label."
    );
  }
  return columnNames;
}

export function getURLColumnNames(rows: any[]) {
  // find and return the names of columns that have url values by checking first row of data
  // may return an empty array if no URL fields are found
  if (rows.length > 0) {
    const firstRow = rows[0];
    return getColumnNames(rows).filter((columnName) =>
      isURL(firstRow[columnName])
    );
  } else {
    throw new Error("This CSV dataset is empty.");
  }
}

function isValidNumericColumn(rows: any[], columnName: string) {
  const isNummeric = rows.every((x) => typeof x[columnName] === "number");
  if (isNummeric) {
    // must have more than one value
    const values = new Set(rows.map((x) => x[columnName]));
    return values.size > 1;
  }
  return false;
}

export function getValidNumericColumnNames(rows: any[]) {
  // find and return array of column names that contain numeric values
  // and have more than one value
  return getColumnNames(rows).filter((columnName) =>
    isValidNumericColumn(rows, columnName)
  );
}

export function createColumnDetails(rows: any[]) {
  // column details are data derived from the CSV row data
  // used to create column settings
  return {
    labels: getLabelColumnNames(rows),
    urls: getURLColumnNames(rows),
    columns: getValidNumericColumnNames(rows),
  };
}

export function groupColumnsByType(columns: string[], ancillaryColumnSet: Set<string>) {
  return {
      regularColumns: columns.filter((colname) => !ancillaryColumnSet.has(colname)),
      ancillaryColumns: columns.filter((colname) => ancillaryColumnSet.has(colname))
  };
}

export function createColumnSettings(columnDetails: any, columnConfig: any) {
  // column settings are the user adjustable values
  // that determine how the CSV file is used by the MDS code
  let url = undefined;
  if (columnDetails.urls.length > 0) {
    url = columnDetails.urls[0];
  }
  const { regularColumns, ancillaryColumns} = groupColumnsByType(
    columnDetails.columns,
    new Set(columnConfig.ancillary_columns));
  return {
    label: columnDetails.labels[0],
    url: url,
    selected: regularColumns,
    ancillaryColumns: ancillaryColumns
  };
}
