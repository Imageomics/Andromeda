import ColoredButton from "../components/ColoredButton";
import LatLonCoverNote from "../components/LatLonCoverNote";
import {LANDCOVER_FETCH_SECONDS} from "../backend/observations";

interface FetchDataFormProps {
    iNatUser: string | undefined;
    setINatUser: (user: string) => void;
    disableFetchButton: boolean;
    onClickFetch: () => void;
    addLandCover: boolean;
    setAddLandCover: (add: boolean) => void;
    customSataDataConfig: any | null;
    addCustomSatData: boolean;
    setAddCustomSatData: (add: boolean) => void;
}

const LAND_COVER_TOOLTIP = "Add small and big landcoverage classification columns."

export default function FetchDataForm(props: FetchDataFormProps) {
    const {iNatUser, setINatUser, disableFetchButton, onClickFetch, addLandCover, setAddLandCover,
        customSataDataConfig, addCustomSatData, setAddCustomSatData} = props;
    function onChangeLand(event: any){
        setAddLandCover(event.target.checked)
    }
    function onChangeAddCustomSatData(event: any){
        setAddCustomSatData(event.target.checked)
    }
    let customSatDataDiv = null;
    let customSatDataNote = null;
    if (customSataDataConfig) {
        customSatDataDiv = <div className="py-1">
            <label className="mr-2 text-md font-medium" htmlFor="AddCustomSatData">
                    {customSataDataConfig.label}:
                </label>
                <input
                    type="checkbox" id="AddCustomSatData"
                    checked={addCustomSatData}
                    onChange={onChangeAddCustomSatData}>
                </input>
        </div>
        if (customSataDataConfig.note) {
            customSatDataNote = <p className="text-sm mt-4 max-w-prose" >
                {customSataDataConfig.note}
            </p>
        }
    }

    return <>
        <p className="max-w-2xl text-sm my-2">
            Find iNaturalist observations to create a CSV file that can be visualized in Andromeda.
        </p>
        <div className="py-1">
            <label className="mr-2 text-md font-medium" htmlFor="iNatUser">iNaturalist Username:</label>
            <input className="mr-4 border rounded p-1" type="text" id="iNatUser" name="iNatUser" required
                value={iNatUser}
                onChange={(e: any) => setINatUser(e.target.value)} />
        </div>
        <div className="py-1">
            <label title={LAND_COVER_TOOLTIP} className="mr-2 text-md font-medium" htmlFor="AddLandCover">
                Add Landcover Satellite Data:
            </label>
            <input title={LAND_COVER_TOOLTIP} className="accent-cyan-600" type="checkbox" id="AddLandCover" checked={addLandCover} onChange={onChangeLand}></input>
            <span className="ml-2 text-sm italic align-text-bottom">(takes ~{LANDCOVER_FETCH_SECONDS} seconds per observation)</span>
        </div>
        {customSatDataDiv}
        <div className="my-2">
            <ColoredButton spinnerOnDisabled={true} disabled={disableFetchButton} label="Fetch Observations" color="blue" onClick={onClickFetch} />
        </div>
        <LatLonCoverNote />
        {customSatDataNote}
    </>;
}
