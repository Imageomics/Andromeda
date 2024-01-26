import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react';
import TitleBar from "@/components/TitleBar";
import Main from "@/components/Main";
import { showError } from "@/util/toast";
const DataExplorer = dynamic(() => import("@/components/DataExplorer"), {
  ssr: false,
});
import { dimensionalReduction, reverseDimensionalReduction, calculatePointScaling} from "@/backend/dataset";
import Spinner from '@/components/Spinner';
import { CSVFilename } from '@/components/CSVFilename';
import { makeUrlColumnSettings, configureURLQueryDict, UrlColumnSettings } from '@/util/router-utils'

const DEFAULT_POINT_SCALING = 1.0;


export default function Home() {
  const router = useRouter()

  const [datasetID, setDatasetID] = useState<string>("");
  const [datasetName, setDatasetName] = useState<string>("");
  const [imageData, setImageData] = useState<any[]>();
  const [weightData, setWeightData] = useState<any[]>();
  const [columnSettings, setColumnSettings] = useState<any>();
  const [pointScaling, setPointScaling] = useState<number>(DEFAULT_POINT_SCALING);

  useEffect(() => {
    let urlColumnSettings = makeUrlColumnSettings(router);
    if (urlColumnSettings.datasetID) {
      applyURLSettings(urlColumnSettings);
    }
  }, [router.query.dataset, router.query.name]);

  useEffect(() => {
    if (datasetID && columnSettings) {
      const initialWeights = { all: 1.0 / columnSettings.selected.length };
      performDimensionalReduction(datasetID, initialWeights);
    }
  }, [datasetID, columnSettings]);

  async function applyURLSettings(urlColumnSettings: UrlColumnSettings) {
    setDatasetName(urlColumnSettings.datasetName);
    setDatasetID(urlColumnSettings.datasetID);
    setColumnSettings(urlColumnSettings);
    setImageData(undefined);
    setWeightData(undefined);
  }

  async function performDimensionalReduction(id: string, weights: any) {
    try {
      console.log(weights);
      console.log(columnSettings);
      const result = await dimensionalReduction(id, weights, columnSettings)
      setDatasetID(id);
      setPointScaling(calculatePointScaling(result.images));
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
  function onDataExplorerClickBack() {
    router.back()
  }

  let content = <Spinner />;;
  if (datasetID && imageData) {
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
          onClickBack={onDataExplorerClickBack}
          pointScaling={pointScaling}
          setPointScaling={setPointScaling}
        />
      </>;
  }

  return (
    <>
      <TitleBar selected="/" />
      <Main>
        <div>
          <CSVFilename name={datasetName} />
        </div>
        <div>
          {content}
        </div>
      </Main>
    </>
  )
}
