import { useRouter } from 'next/router'
import { uploadDataset } from "../backend/dataset";
import React, { useState, useEffect } from 'react';
import UploadFile from '../components/UploadFile';
import TitleBar from "../components/TitleBar";
import Main from "../components/Main";
import { showError } from "../util/toast";


export default function Home() {
  const router = useRouter()
  const [datasetID, setDatasetID] = useState<string>();

  async function uploadFile(selectedFile: any) {
    try {
      const result = await uploadDataset(selectedFile);
      router.push({
        pathname: `/dataset/${result.id}`,
        query: {
            name: selectedFile.name
        }
      });
    } catch (error: any) {
      showError(error.message);
      throw error;
    }
  }

  return (
    <>
      <TitleBar selected="/" />
      <Main>
        <div>
          <UploadFile
            uploadFile={uploadFile}
          />
        </div>
      </Main>
    </>
  )
}
