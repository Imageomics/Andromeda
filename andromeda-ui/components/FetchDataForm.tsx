import ColoredButton from "../components/ColoredButton";
import LatLonCoverNote from "../components/LatLonCoverNote";

interface FetchDataFormProps {
    iNatUser: string | undefined;
    setINatUser: (user: string) => void;
    disableFetchButton: boolean;
    onClickFetch: () => void;
    addLandCover: boolean;
    setAddLandCover: (add: boolean) => void;
}

const LAND_COVER_TOOLTIP = "Add small and big landcoverage classification columns."

export default function FetchDataForm(props: FetchDataFormProps) {
    const {iNatUser, setINatUser, disableFetchButton, onClickFetch, addLandCover, setAddLandCover} = props;
    function onChangeLand(event: any){
        setAddLandCover(event.target.checked)
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
        
            <label title={LAND_COVER_TOOLTIP} className="mr-2 text-md font-medium" htmlFor="AddLandCover">Landcover Satellite Data:</label>
            <input title={LAND_COVER_TOOLTIP} className="accent-cyan-600" type="checkbox" id="AddLandCover" checked={addLandCover} onChange={onChangeLand}></input>
            <span className="ml-2 text-sm italic align-text-bottom">(takes ~5 seconds per observation)</span>
        </div>
        <div className="my-2">
            <ColoredButton spinnerOnDisabled={true} disabled={disableFetchButton} label="Fetch Observations" color="blue" onClick={onClickFetch} />
        </div>
        <LatLonCoverNote />
    </>;
}
