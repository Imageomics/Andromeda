interface ObservationTableProps {
    iNatUser: string | undefined;
    satDataset: string;
    observations: any[];
    maxObs: number;
}

const TH_CLASSNAME = "p-2 border text-slate-500 font-semi-bold text-sm"
const TD_CLASSNAME = "p-1 border text-slate-500 text-sm"

export default function ObservationTable(props: ObservationTableProps) {
    const { observations, maxObs, iNatUser, satDataset } = props;
    const showing = Math.min(observations.length, maxObs);
    const rows = observations.slice(0, maxObs).map((x) => {
        const extraColumns: any[] = [];
        if (satDataset) {
            extraColumns.push(<td className={TD_CLASSNAME}>
                {x.sat_meanRed}
            </td>)
            extraColumns.push(<td className={TD_CLASSNAME}>
                {x.sat_meanGreen}
            </td>)
            extraColumns.push(<td className={TD_CLASSNAME}>
                {x.sat_meanBlue}
            </td>)
        }
        return <tr key={x.Image_Label}>
            <td className={TD_CLASSNAME}>{x.Image_Label}</td>
            <td className={TD_CLASSNAME}>
                <img
                    className="h-16 w-16"
                    src={x.Image_Link}
                    alt={x.Image_Label}
                    title={x.Image_Link} />
            </td>
            <td className={TD_CLASSNAME}>
                {x.Date}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Time}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Lat}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Long}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Species}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Place}
            </td>
            <td className={TD_CLASSNAME}>
                {x.Seconds}
            </td>
            <td className={TD_CLASSNAME}>
                {x.User}
            </td>
            {extraColumns}
        </tr>
    });
    const extraColumnHeaders: any[] = [];
    if (satDataset) {
        extraColumnHeaders.push(<th className={TH_CLASSNAME}>sat_meanRed</th>)
        extraColumnHeaders.push(<th className={TH_CLASSNAME}>sat_meanGreen</th>)
        extraColumnHeaders.push(<th className={TH_CLASSNAME}>sat_meanBlue</th>)
    }

    return <>
        <div className="my-1">
            <span className="text-lg flex-auto">Observations by {iNatUser}</span>
        </div>
        <table className="border-collapse border">
            <thead className="bg-slate-50 border-slate-400">
                <tr>
                    <th className={TH_CLASSNAME}>Image_Label</th>
                    <th className={TH_CLASSNAME}>Image_Link</th>
                    <th className={TH_CLASSNAME}>Date</th>
                    <th className={TH_CLASSNAME}>Time</th>
                    <th className={TH_CLASSNAME}>Lat</th>
                    <th className={TH_CLASSNAME}>Long</th>
                    <th className={TH_CLASSNAME}>Species</th>
                    <th className={TH_CLASSNAME}>Place</th>
                    <th className={TH_CLASSNAME}>Seconds</th>
                    <th className={TH_CLASSNAME}>User</th>
                    {extraColumnHeaders}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        <span className="text-sm">
            Showing {showing} rows ({observations.length} in total)
        </span>

    </>;
}