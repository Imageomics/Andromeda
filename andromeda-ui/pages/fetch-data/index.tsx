import TitleBar from "../../components/TitleBar";
import ColoredButton from "../../components/ColoredButton";
import ObservationTable from "../../components/ObservationTable";
import DownloadFileButton from "../../components/DownloadFileButton";
import FetchDataForm from "../../components/FetchDataForm";
import WarningNotice from "../../components/WarningNotice";
import Main from "../../components/Main";
import { fetchObservations, makeObservationURL } from "../../backend/observations";
import { useState } from 'react';
import { showError } from "../../util/toast";

const SHOW_OBS_MAX = 6;
const FETCH_WARNINGS: any = {
    missing_lat_long: `Warning:
    Missing latitude and longitude for some iNaturalist observations.
    Please fix these observations at iNaturalist.org.`
}

function makeMessages(warnings: string[]): string {
    if (warnings) {
        const messages = warnings.map((x: string) => FETCH_WARNINGS[x] || x);
        return messages.join(", ");
    }
    return "";
}

export default function GeneratePage() {
    const [iNatUser, setINatUser] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [fetching, setFetching] = useState<boolean>(false);
    const [showObservations, setShowObservations] = useState<boolean>(false);
    const [observations, setObservations] = useState<any[]>([]);

    async function onClickFetch() {
        if (iNatUser) {
            setWarning("");
            setFetching(true);
            try {
                const result = await fetchObservations(iNatUser);
                setObservations(result.data);
                if (result.warnings.length) {
                    setWarning(makeMessages(result.warnings));
                    setShowObservations(true);
                } else {
                    if (result.data.length == 0) {
                        setWarning("No observations found for user " + iNatUser);
                        setShowObservations(false);
                    } else {
                        setShowObservations(true);
                    }
                }
            } catch (error: any) {
                setShowObservations(false);
                showError(error.message);
            }
            setFetching(false);
        } else {
            setWarning("You must enter a value for the iNaturalist Username field.")
        }
    }

    function onClickBack() {
        setShowObservations(false);
        setObservations([]);
        setWarning("");
    }

    let content = null;
    let warningNotice = null;
    if (warning) {
        warningNotice = <WarningNotice message={warning} />;
    }
    if (showObservations) {
        const csvURL = makeObservationURL(iNatUser, "csv");
        content = <div>
            <ObservationTable
                iNatUser={iNatUser}
                observations={observations}
                maxObs={SHOW_OBS_MAX} />
            {warningNotice}
            <div className="flex gap-2 my-2">
                <ColoredButton label="Back" color="white" onClick={onClickBack} />
                <DownloadFileButton url={csvURL}  />
            </div>
        </div>;
    } else {
        content =  <div>
            <FetchDataForm
                iNatUser={iNatUser}
                setINatUser={setINatUser}
                disableFetchButton={fetching}
                onClickFetch={onClickFetch}/>
            {warningNotice}
        </div>
    }
    return <>
        <TitleBar selected="/fetch-data" />
        <Main>
            {content}
        </Main>
    </>;
}
