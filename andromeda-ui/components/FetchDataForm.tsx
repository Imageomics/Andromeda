import ColoredButton from "../components/ColoredButton";

interface FetchDataFormProps {
    iNatUser: string | undefined;
    setINatUser: (user: string) => void;
    disableFetchButton: boolean;
    onClickFetch: () => void;
    addSatRGBData: boolean;
    setAddSatRGBData: (add: boolean) => void;
    addLandCover: boolean;
    setAddLandCover: (add: boolean) => void;
}

export default function FetchDataForm(props: FetchDataFormProps) {
    const {iNatUser, setINatUser, disableFetchButton, onClickFetch, 
        addSatRGBData, setAddSatRGBData, addLandCover, setAddLandCover} = props;
    function onChangeCSV(event: any){
        setAddSatRGBData(event.target.checked)
    }
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
        
            <label className="mr-2 text-md font-medium" htmlFor="AddSatCSV">RGB Satellite Data:</label>
            <input className="mr-4 accent-cyan-600" type="checkbox" id="AddSatCSV" checked={addSatRGBData} onChange={onChangeCSV}></input>
    
            <label className="mr-2 text-md font-medium" htmlFor="AddLandCover">Landcover Satellite Data:</label>
            <input className="accent-cyan-600" type="checkbox" id="AddLandCover" checked={addLandCover} onChange={onChangeLand}></input>
        </div>
        <div className="my-2">
            <ColoredButton disabled={disableFetchButton} label="Fetch Observations" color="blue" onClick={onClickFetch} />
        </div>
    </>;
}
