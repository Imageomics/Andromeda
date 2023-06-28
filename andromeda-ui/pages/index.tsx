import dynamic from 'next/dynamic'
import { uploadDataset, dimensionalReduction, reverseDimensionalReduction } from "../backend/dataset";
import React, { useState } from 'react';
import UploadFile from '../components/UploadFile';
import ConfigureDataset from "../components/ConfigureDataset";
import TitleBar from "../components/TitleBar";
import Main from "../components/Main";
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

  function showUploadFileButton() {
    setDatasetID(undefined);
    setColumnDetails(undefined);
    setColumnSettings(undefined);
    setImageData(undefined);
    setWeightData(undefined);
  }

  function showEditConfig() {
    setImageData(undefined);
    setWeightData(undefined);
  }

  async function performDimensionalReduction(id: string, weights: any) {
    try {
      const result = await dimensionalReduction(id, weights, columnSettings)
      setDatasetID(id);
      setImageData(result.images);
      setWeightData(result.weights);
      return result;
    } catch (error: any) {
      console.log(error);
      showError(error.message);
    }
    return null;
  }

  async function performReverseDimensionalReduction(id: string, movedPositions: any[]) {
    try {
      const result = await reverseDimensionalReduction(id, movedPositions, columnSettings)
      setWeightData(result.weights);
      return result;
    } catch (error: any) {
      console.log(error);
      showError(error.message);
    }
    return null;
  }

  async function visualizeData() {
    if (datasetID) {
      const initialWeights = { all: 1.0 / columnSettings.selected.length };
      await performDimensionalReduction(datasetID, initialWeights);
    }
  }

  function selectedFileChanged() {

  }

  let content = null;
  if (imageData) {
    content =
      <>
        <DataExplorer
          datasetID={datasetID}
          images={imageData}
          weights={weightData}
          setImageData={setImageData}
          drFunc={performDimensionalReduction}
          rdrFunc={performReverseDimensionalReduction}
          columnSettings={columnSettings}
          onClickBack={showEditConfig}
        />
      </>;
  } else {
    if (datasetID) {
      content = <ConfigureDataset
        columnDetails={columnDetails}
        columnSettings={columnSettings}
        setColumnSettings={setColumnSettings}
        visualizeData={visualizeData}
        onClickBack={showUploadFileButton}
      />;
    }
  }

  return (
    <>
      <TitleBar selected="/" />
      <Main>
        <div>
          <UploadFile
            uploadFile={uploadFile}
            showUploadButton={datasetID === undefined}
            selectedFileChanged={showUploadFileButton}
          />
        </div>
        <div>
          {content}
        </div>
      </Main>
    </>
  )
}
