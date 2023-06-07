import ColoredButton from "../../components/ColoredButton";
import { generateCSV } from "../../backend/generate";
import { useState } from 'react';
import { showError } from "../../util/toast";

export default function GeneratePage() {
    const [iNatUser, setINatUser] = useState<string>();

    async function onClickGenerate(e: any) {
        if (iNatUser) {
            const result = await generateCSV(iNatUser);
            console.log(result);
        } else {
            showError("You must enter a value for the iNaturalist Username field.")
        }
    }

    return <main className="flex min-h-screen flex-col px-12 py-2">
        <h2 className="text-3xl font-bold leading-tight">Andromeda</h2>
        <h3 className="text-xl font-bold leading-tight">Generate CSV</h3>
        <form method="post" action={"http://127.0.0.1:5000/api/inaturalist/" + iNatUser}>
            <div>
                <label htmlFor="iNatUser">iNaturalist Username:</label>
                &nbsp;
                <input className="border p-1" type="text" id="iNatUser" name="iNatUser" required
                    onChange={(e: any) => setINatUser(e.target.value)}
                />
            </div>
            <div>
                <ColoredButton submit={true} label="Download CSV" color="blue" />
            </div>
        </form>
    </main>
}