interface LabelSelectProps {
    value: any;
    setValue: any;
    values: string[];
}

export default function LabelSelect(props: LabelSelectProps) {
    const { value, setValue, values } = props;
    const labelOptions = values.map(x => <option key={x} value={x}>{x}</option>);
    return <>
        <label>Label:&nbsp;</label>
        <select className="rounded border p-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}>
            {labelOptions}
        </select>
    </>
}
