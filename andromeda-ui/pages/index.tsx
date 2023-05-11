import dynamic from 'next/dynamic'
import Image from 'next/image'
import { uploadDataset, dimensionalReduction, reverseDimensionalReduction } from "../backend/dataset";
import { Inter } from 'next/font/google'
import React, { useState } from 'react';
const DataExplorer = dynamic(() => import("../components/DataExplorer"), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] })
const IMAGE_PANEL_SIZE = 600;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [datasetID, setDatasetID] = useState<string>();
  const [dataset, setDataset] = useState<string>();
  const [imageData, setImageData] = useState<any[]>();
  const [weightData, setWeightData] = useState<any[]>();

  function onChangeSelectedFile(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    const selectedFiles = files as FileList;
    setSelectedFile(selectedFiles?.[0]);
  }

  async function performDimensionalReduction(weights: any) {
    const result = await dimensionalReduction(dataset, weights)
    setImageData(result.images);
    setWeightData(result.weights);
    return result;
  }

  async function performReverseDimensionalReduction(movedPositions: any[]) {
    console.log(movedPositions);
    const result = await reverseDimensionalReduction(dataset, movedPositions, IMAGE_PANEL_SIZE);
    setWeightData(result.weights);
    return result;
  }

  async function onClickUploadFile() {
    if (selectedFile) {
      const initialWeights = { all: 0.5 };
      const result = await uploadDataset(selectedFile);
      setDataset(result.data)
      const drResult = await dimensionalReduction(result.data, initialWeights)
      setImageData(drResult.images);
      setWeightData(drResult.weights);
    } else {
      console.log("File must be selected first.");
    }
  }

  let dataExplorer = null;
  if (imageData) {
    dataExplorer =
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
          imagePanelSize={IMAGE_PANEL_SIZE}
        />
      </>

  }

  return (
    <main className="flex min-h-screen flex-col px-12 py-2">
      <h2 className="text-3xl font-medium leading-tight">Andromeda js</h2>
      <div>
        <label
          className="text-md font-medium"
          htmlFor="formFile">
          Select a CSV file:
        </label>
        <input
          type="file"
          className="m-2"
          onChange={onChangeSelectedFile}
          id="formFile" />
        <button
          className="m-2 px-6 py-2 rounded bg-blue-400 hover:bg-blue-500 disabled:opacity-50 text-slate-100 inline-block"
          type="button"
          disabled={!selectedFile}
          onClick={onClickUploadFile}>
          Upload File
        </button>
      </div>
      <div>

      </div>
      <div>

      </div>
      <div>
        {dataExplorer}
      </div>

    </main >
  )
}
