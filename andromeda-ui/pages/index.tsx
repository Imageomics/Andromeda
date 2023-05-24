import dynamic from 'next/dynamic'
import { uploadDataset, dimensionalReduction, reverseDimensionalReduction } from "../backend/dataset";
import React, { useState } from 'react';
import UploadFile from '../components/UploadFile';
import ConfigureDataset from "../components/ConfigureDataset";
const DataExplorer = dynamic(() => import("../components/DataExplorer"), {
  ssr: false,
});
import { showError } from "../util/toast";
import { parseCSVFile, createColumnDetails, createColumnSettings } from "../backend/parseCSV";


export default function Home() {
  const [datasetID, setDatasetID] = useState<string>();
  const [imageData, setImageData] = useState<any[]>();
  const [weightData, setWeightData] = useState<any[]>();
  const [columnDetails, setColumnDetails] = useState<any>();
  const [columnSettings, setColumnSettings] = useState<any>();

  async function performDimensionalReduction(id: string, weights: any) {
    const result = await dimensionalReduction(id, weights, columnSettings)
    setDatasetID(id);
    setImageData(result.images);
    setWeightData(result.weights);
    return result;
  }

  async function performReverseDimensionalReduction(id: string, movedPositions: any[]) {
    const result = await reverseDimensionalReduction(id, movedPositions, columnSettings)
    setWeightData(result.weights);
    return result;
  }

  async function uploadFile(selectedFile: any) {
    try {
      const result = await uploadDataset(selectedFile);
      const rows = await parseCSVFile(selectedFile);
      const details = createColumnDetails(rows);
      const settings = createColumnSettings(details);
      setDatasetID(result.id);
      setColumnDetails(details);
      setColumnSettings(settings);
      setImageData(undefined);
      setWeightData(undefined);
    } catch (error: any) {
      showError(error.message);
      throw error;
    }
  }

  async function onClickVisualize() {
    if (datasetID) {
      const initialWeights = { all: 1.0 / columnSettings.selected.length };
      await performDimensionalReduction(datasetID, initialWeights);
      console.log("Here1");
    }
  }

  let content = null;
  if (imageData) {
    content =
      <>
        <hr />
        <br />
        <DataExplorer
          datasetID={datasetID}
          images={imageData}
          weights={weightData}
          setImageData={setImageData}
          drFunc={performDimensionalReduction}
          rdrFunc={performReverseDimensionalReduction}
        />
      </>
  } else {
    if (datasetID) {
      content = <ConfigureDataset
        columnDetails={columnDetails}
        columnSettings={columnSettings}
        setColumnSettings={setColumnSettings}
        onClickVisualize={onClickVisualize}
      />;
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-12 py-2">
      <h2 className="text-3xl font-bold leading-tight">Andromeda</h2>
      <UploadFile uploadFile={uploadFile} />
      <div>
        {content}
      </div>
    </main>
  )
}
