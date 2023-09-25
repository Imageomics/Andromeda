import Image from 'next/image'

interface ObservationTableProps {
    iNatUser: string | undefined;
    observations: any[];
    totalObservations: number;
    maxObs: number;
}

const TH_CLASSNAME = "p-2 border text-slate-500 font-semi-bold text-sm"
const TD_CLASSNAME = "p-1 border text-slate-500 text-sm whitespace-nowrap text-ellipsis"
const KNOWN_COLUMNS = new Set([
    "Image_Label",
    "Image_Link",
    "Date",
    "Time",
    "Lat",
    "Long",
    "Species",
    "Place",
    "Seconds",
    "User"
]);

export default function ObservationTable(props: ObservationTableProps) {
    const { observations, maxObs, iNatUser, totalObservations } = props;
    const showing = Math.min(observations.length, maxObs);
    let extraColumns: string[] = [];
    if (observations.length > 0) {
        extraColumns = Object.keys(observations[0]).filter((x) => !KNOWN_COLUMNS.has(x))
    }
    const exampleObservations = observations.slice().slice(0, maxObs);
    const rows = exampleObservations.map((x) => {
        const extraColumnValues = extraColumns.map(colname => {
            return <td key={colname + "_" + x.Image_Label} className={TD_CLASSNAME}>
                {x[colname]}
            </td>;
        })
        let imageLink= null;
        if (x.Image_Link) {
            imageLink = <Image width={50} height={50}
                            src={x.Image_Link}
                            alt={x.Image_Label}
                            title={x.Image_Link} />
        }
        return <tr key={x.Image_Label}>
            <td className={TD_CLASSNAME + " sticky left-0 bg-white"}>{x.Image_Label}</td>
            <td className={TD_CLASSNAME}>
                {imageLink}
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
            {extraColumnValues}
        </tr>
    });
    const extraColumnHeaders = extraColumns.map(colname => {
        return <th key={colname} className={TH_CLASSNAME}>{colname}</th>;
    })
    return <>
        <div className="my-1">
            <span className="text-lg flex-auto">Observations by {iNatUser}</span>
        </div>
        <div className="overflow-auto">
            <table className="border-collapse border table-auto">
                <thead className="bg-slate-50 border-slate-400">
                    <tr>
                        <th className={TH_CLASSNAME+ " sticky left-0 bg-slate-50"}>Image_Label</th>
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
        </div>
        <span className="text-sm">
            Showing {showing} rows ({totalObservations} in total)
        </span>

    </>;
}
