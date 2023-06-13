interface SimpleSelectProps {
    label: string | undefined;
    value: string | undefined;
    setValue: any;
    values: string[];
}

export default function SimpleSelect(props: SimpleSelectProps) {
    const { label, value, setValue, values } = props;
    const urlOptions = values.map(x => <option key={x} value={x}>{x}</option>);
    return <>
        <label className="text-md font-medium block">{label}&nbsp;</label>
        <select className="rounded border m-2 p-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}>
            {urlOptions}
        </select>
    </>
}
