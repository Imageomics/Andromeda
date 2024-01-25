import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react';
import { getColumnConfig, readDataset } from "@/backend/dataset";
import ConfigureDataset from "@/components/ConfigureDataset";
import TitleBar from "@/components/TitleBar";
import Main from "@/components/Main";
import { parseCSVFile, createColumnDetails, createColumnSettings } from "@/backend/parseCSV";
import Spinner from '@/components/Spinner';
import { makeUrlColumnSettings, configureURLQueryDict, UrlColumnSettings } from '@/util/router-utils'
import { url } from 'inspector';


export default function Home() {
  const router = useRouter()
  const [datasetID, setDatasetID] = useState<string>("");
  const [datasetName, setDatasetName] = useState<string>("");
  const [columnDetails, setColumnDetails] = useState<any>();
  const [columnSettings, setColumnSettings] = useState<any>();

  useEffect(() => {
    let urlColumnSettings = makeUrlColumnSettings(router);
    console.log(urlColumnSettings);
    if (urlColumnSettings.datasetID) {
      applyURLSettings(urlColumnSettings);
    }
  }, [router.query.dataset]);

  async function applyURLSettings(urlColumnSettings: UrlColumnSettings) {
    const datasetContent = await readDataset(urlColumnSettings.datasetID);
    const rows = await parseCSVFile(datasetContent);
    const details = createColumnDetails(rows);
    const columnConfig = await getColumnConfig();
    const settings = createColumnSettings(details, columnConfig);
    console.log(settings);
    if (urlColumnSettings.label) {
      settings.label = urlColumnSettings.label;
    }
    if (urlColumnSettings.url) {
      settings.url = urlColumnSettings.url;
    }
    if (urlColumnSettings.selected.length > 0) {
      settings.selected = urlColumnSettings.selected;
    }
    setDatasetID(urlColumnSettings.datasetID);
    setColumnDetails(details);
    setColumnSettings(settings);
    setDatasetName(urlColumnSettings.datasetName);
  }

  function visualizeData() {
    if (datasetID) {
      // update current URL so back button will load the proper settings
      router.replace({
          pathname: `/dataset/${datasetID}`,
          query: configureURLQueryDict(datasetName, columnSettings.label,
            columnSettings.url, columnSettings.selected)
      });
      // push visualization page
      router.push({
        pathname: `/dataset/${datasetID}/visualize`,
        query: configureURLQueryDict(datasetName, columnSettings.label,
          columnSettings.url, columnSettings.selected)
    });
    }
  }

  function onClickBack() {
    router.back();
  }

  let content = <Spinner />;
  console.log(datasetID);
  console.log(datasetName);
  if (datasetID && datasetName) {
    content = <ConfigureDataset
      datasetName={datasetName}
      columnDetails={columnDetails}
      columnSettings={columnSettings}
      setColumnSettings={setColumnSettings}
      visualizeData={visualizeData}
      onClickBack={onClickBack}
    />;
  }
  return (
    <>
      <TitleBar selected="/" />
      <Main>
        <div>
          {content}
        </div>
      </Main>
    </>
  )
}
