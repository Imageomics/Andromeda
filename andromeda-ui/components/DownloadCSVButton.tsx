import ColoredButton from "../components/ColoredButton";

interface DownloadCSVButtonProps {
    csvURL: string;
    iNatUser: string;
    satDataset: string;
}

export default function DownloadCSVButton(props: DownloadCSVButtonProps) {
    const { csvURL, iNatUser, satDataset } = props;
    return <form method="post" action={csvURL}>
        <input type="hidden" id="iNatUser" name="iNatUser" value={iNatUser} />
        <input type="hidden" id="satDataset" name="satDataset" value={satDataset} />
        <ColoredButton submit={true} label="Download CSV" color="blue" />
    </form>
}