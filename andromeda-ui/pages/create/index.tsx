import TitleBar from "../../components/TitleBar";
import ColoredButton from "../../components/ColoredButton";
import ObservationTable from "../../components/ObservationTable";
import DownloadCSVButton from "../../components/DownloadCSVButton";
import { fetchObservations, generateCSV } from "../../backend/generate";
import { apiURL } from "../../backend/dataset";
import { useState } from 'react';
import { showError } from "../../util/toast";

const SHOW_OBS_MAX = 6;

export default function GeneratePage() {
    const [iNatUser, setINatUser] = useState<string>();
    const [satDataset, setSatDataset] = useState<string>("");
    const [fetching, setFetching] = useState<boolean>(false);
    const [showObservations, setShowObservations] = useState<boolean>(false);
    const [observations, setObservations] = useState<any[]>();

    function onChangeSatDatset(e: any) {
        setSatDataset(e.target.value);
    }

    async function onClickDownload() {
        if (iNatUser) {
            const result = await generateCSV(iNatUser, satDataset);
            console.log(result);
        } else {
            showError("You must enter a value for the iNaturalist Username field.")
        }
    }

    async function onClickFetch() {
        if (iNatUser) {
            setFetching(true);
            const result = await fetchObservations(iNatUser, satDataset);
            setObservations(result.data);
            setShowObservations(true);
            setFetching(false);
        } else {
            showError("You must enter a value for the iNaturalist Username field.")
        }
    }

    function onClickBack() {
        setShowObservations(false);
    }

    let content = null;
    if (showObservations && iNatUser) {
        if (observations?.length) {
            const csvURL = apiURL("/inaturalist/") + iNatUser + "/csv";

            content = <div>
                <ObservationTable
                    iNatUser={iNatUser}
                    satDataset={satDataset}
                    observations={observations}
                    maxObs={SHOW_OBS_MAX} />
                <div className="flex gap-2 my-2">
                    <ColoredButton label="Back" color="white" onClick={onClickBack} />
                    < DownloadCSVButton csvURL={csvURL} iNatUser={iNatUser} satDataset={satDataset} />
                </div>
            </div>;
        } else {
            content = <div>No observations found for {iNatUser}.</div>
        }
    } else {
        content = <>
            <p className="max-w-2xl text-sm m-2">
                Find iNaturalist observations to create a dataset that can be visualized in Andromeda.
                Optionally select a Satellite dataset to augment and filter the observations.
            </p>
            <div className="py-1">
                <label className="mr-2" htmlFor="iNatUser">iNaturalist Username:</label>
                <input className="border rounded p-1" type="text" id="iNatUser" name="iNatUser" required
                    value={iNatUser}
                    onChange={(e: any) => setINatUser(e.target.value)} />
            </div>
            <div className="py-1">
                <label className="mr-2" htmlFor="satDataset">Satellite Dataset:</label>
                <select value={satDataset} className="border rounded p-1" onChange={onChangeSatDatset}>
                    <option value="">None</option>
                    <option value="test">Test Data</option>
                </select>
            </div>
            <div className="my-2">
                <ColoredButton disabled={fetching} label="Fetch Observations" color="blue" onClick={onClickFetch} />
            </div>
        </>;
    }
    return <>
        <TitleBar selected="/create" />
        <main className="flex min-h-screen flex-col px-6 py-4">
            <h3 className="text-xl font-bold leading-tight">Create a CSV</h3>
            {content}
        </main>
    </>;
}


