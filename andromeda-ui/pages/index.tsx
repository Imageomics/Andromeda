import dynamic from 'next/dynamic'
import { uploadDataset, dimensionalReduction, reverseDimensionalReduction } from "../backend/dataset";
import React, { useState } from 'react';
import UploadFile from '../components/UploadFile';
const DataExplorer = dynamic(() => import("../components/DataExplorer"), {
  ssr: false,
});

export default function Home() {
  const [datasetID, setDatasetID] = useState<string>();
  const [imageData, setImageData] = useState<any[]>();
  const [weightData, setWeightData] = useState<any[]>();

  async function performDimensionalReduction(id: string, weights: any) {
    const result = await dimensionalReduction(id, weights)
    setDatasetID(id);
    setImageData(result.images);
    setWeightData(result.weights);
    return result;
  }

  async function performReverseDimensionalReduction(id: string, movedPositions: any[]) {
    const result = await reverseDimensionalReduction(id, movedPositions)
    setWeightData(result.weights);
    return result;
  }

  async function uploadFile(selectedFile: any) {
    const result = await uploadDataset(selectedFile);
    const initialWeights = { all: 0.5 };
    await performDimensionalReduction(result.id, initialWeights);
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
        />
      </>
  }

  return (
    <main className="flex min-h-screen flex-col px-12 py-2">
      <h2 className="text-3xl font-medium leading-tight">Andromeda</h2>
      <UploadFile uploadFile={uploadFile} />
      <div>
        {dataExplorer}
      </div>
    </main>
  )
}
