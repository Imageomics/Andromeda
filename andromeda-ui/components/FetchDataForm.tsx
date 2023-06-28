import ColoredButton from "../components/ColoredButton";

interface FetchDataFormProps {
    iNatUser: string | undefined;
    setINatUser: (user: string) => void;
    disableFetchButton: boolean;
    onClickFetch: () => void;
}

export default function FetchDataForm(props: FetchDataFormProps) {
    const {iNatUser, setINatUser, disableFetchButton, onClickFetch} = props;
    return <>
        <p className="max-w-2xl text-sm my-2">
            Find iNaturalist observations to create a CSV file that can be visualized in Andromeda.
        </p>
        <div className="py-1">
            <label className="mr-2 text-md font-medium" htmlFor="iNatUser">iNaturalist Username:</label>
            <input className="border rounded p-1" type="text" id="iNatUser" name="iNatUser" required
                value={iNatUser}
                onChange={(e: any) => setINatUser(e.target.value)} />
        </div>
        <div className="my-2">
            <ColoredButton disabled={disableFetchButton} label="Fetch Observations" color="blue" onClick={onClickFetch} />
        </div>
    </>;
}
