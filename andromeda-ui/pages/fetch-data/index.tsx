import TitleBar from "../../components/TitleBar";
import ColoredButton from "../../components/ColoredButton";
import ObservationTable from "../../components/ObservationTable";
import DownloadFileButton from "../../components/DownloadFileButton";
import FetchDataForm from "../../components/FetchDataForm";
import WarningNotice from "../../components/WarningNotice";
import Main from "../../components/Main";
import { fetchObservations, makeObservationURL, downloadSecondsEstimate,
    getCustomDataConfig } from "../../backend/observations";
import { useState, useEffect, use } from 'react';
import { showError } from "../../util/toast";

const SHOW_OBS_MAX = 6;
const FETCH_WARNINGS: any = {
    missing_lat_long: `Warning:
    Missing latitude and longitude for some iNaturalist observations.
    Please fix these observations at iNaturalist.org.`,
    multiple_sat_matches: `Multiple satellite entries found for a single location.`,
    no_sat_matches: `No matching satellite data found.`,
    landcover_not_setup: `Landcover data is not currently supported.`
}

function makeMessages(warnings: string[]): string {
    if (warnings) {
        const messages = warnings.map((x: string) => FETCH_WARNINGS[x] || x);
        return messages.join(" ");
    }
    return "";
}

export default function GeneratePage() {
    const [iNatUser, setINatUser] = useState<string>("");
    const [addLandCover, setAddLandCover] = useState<boolean>(false);
    const [addCustomSatData, setAddCustomSatData] = useState<boolean>(false);
    const [warning, setWarning] = useState<string>("");
    const [fetching, setFetching] = useState<boolean>(false);
    const [showObservations, setShowObservations] = useState<boolean>(false);
    const [observations, setObservations] = useState<any[]>([]);
    const [totalObservations, setTotalObservations] = useState<number>(0);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [customSatDataConfig, setCustomSatDataConfig] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
          const result = await getCustomDataConfig()
          setCustomSatDataConfig(result);
          setLoaded(true);
        };
        fetchData().catch(console.error);
      }, []);

    async function onClickFetch() {
        if (iNatUser) {
            setWarning("");
            setFetching(true);
            try {
                const result = await fetchObservations(iNatUser, addCustomSatData, addLandCover, SHOW_OBS_MAX);
                setObservations(result.data);
                setTotalObservations(result.total);
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
    let downloadingNote = null;
    if (addLandCover) {
        const estimatedTimeMsg = downloadSecondsEstimate(totalObservations);
        downloadingNote = <span className="py-2 ml-2 text-sm italic align-text-bottom">
            NOTE: Downloading will take ~ {estimatedTimeMsg} for this dataset due to fetching landcover data.
        </span>;
    }
    if (showObservations) {
        const csvURL = makeObservationURL(iNatUser, addCustomSatData, addLandCover, "csv");
        content = <div>
            <ObservationTable
                iNatUser={iNatUser}
                observations={observations}
                totalObservations={totalObservations}
                maxObs={SHOW_OBS_MAX} />
            {warningNotice}
            <div className="flex gap-2 my-2">
                <ColoredButton label="Back" color="white" onClick={onClickBack} />
                <DownloadFileButton url={csvURL}  />
                {downloadingNote}
            </div>
        </div>;
    } else {
        if (loaded) {
            content =  <div>
                <FetchDataForm
                    iNatUser={iNatUser}
                    setINatUser={setINatUser}
                    addLandCover={addLandCover}
                    setAddLandCover={setAddLandCover}
                    customSatDataConfig={customSatDataConfig}
                    addCustomSatData={addCustomSatData}
                    setAddCustomSatData={setAddCustomSatData}
                    disableFetchButton={fetching}
                    onClickFetch={onClickFetch}/>
                {warningNotice}
            </div>
        }

    }
    return <>
        <TitleBar selected="/fetch-data" />
        <Main>
            {content}
        </Main>
    </>;
}
