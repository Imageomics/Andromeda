import React, { useState } from 'react';
import { showError } from "../util/toast";
import ColoredButton from './ColoredButton';

interface UploadFileProps {
    uploadFile: any;
    showUploadButton: boolean;
    selectedFileChanged: any;
}

export default function UploadFile(props: UploadFileProps) {
    const { uploadFile, showUploadButton, selectedFileChanged } = props;
    const [selectedFile, setSelectedFile] = useState<File>();

    async function onChangeSelectedFile(event: React.ChangeEvent<HTMLInputElement>) {
        const { files } = event.target;
        const selectedFiles = files as FileList;
        if (selectedFiles && selectedFiles.length > 0) {
            setSelectedFile(selectedFiles[0]);
            selectedFileChanged();
        } else {
            setSelectedFile(undefined);
        }
    }

    async function onClickUploadFile() {
        if (selectedFile) {
            await uploadFile(selectedFile);
        } else {
            showError("File must be selected first.");
        }
    }

    let uploadButton = null;
    if (showUploadButton) {
        uploadButton = <ColoredButton
            label="Upload File"
            onClick={onClickUploadFile}
            disabled={selectedFile === undefined}
            color="blue"
        />
    }

    return <>
        <div>
            <label
                className="text-md font-medium"
                htmlFor="formFile">
                Select a CSV file to visualize:
            </label>
            <input
                type="file"
                className="m-2"
                onChange={onChangeSelectedFile}
                accept=".csv"
                id="formFile" />
        </div>
        {uploadButton}
    </>
}
