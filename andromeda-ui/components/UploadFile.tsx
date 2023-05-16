import React, { useState } from 'react';
import { showError } from "../util/toast";

interface UploadFileProps {
    uploadFile: any;
}

export default function UploadFile(props: UploadFileProps) {
    const { uploadFile } = props;
    const [selectedFile, setSelectedFile] = useState<File>();

    function onChangeSelectedFile(event: React.ChangeEvent<HTMLInputElement>) {
        const { files } = event.target;
        const selectedFiles = files as FileList;
        setSelectedFile(selectedFiles?.[0]);
    }

    async function onClickUploadFile() {
        if (selectedFile) {
            await uploadFile(selectedFile);
        } else {
            showError("File must be selected first.");
        }
    }

    return <div>
        <label
            className="text-md font-medium"
            htmlFor="formFile">
            Select a CSV file:
        </label>
        <input
            type="file"
            className="m-2"
            onChange={onChangeSelectedFile}
            accept=".csv"
            id="formFile" />
        <button
            className="m-2 px-6 py-2 rounded bg-blue-400 hover:bg-blue-500 disabled:opacity-50 text-slate-100 inline-block"
            type="button"
            disabled={!selectedFile}
            onClick={onClickUploadFile}>
            Upload File
        </button>
    </div>
}