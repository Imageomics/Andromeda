interface LabeledRadioProps {
    id: string;
    name: string;
    value: string;
    label: string;
    checked: any;
    onChange: any;
}

export default function LabeledRadio(props: LabeledRadioProps) {
    return <div className="inline-block m-2">
        <input
            type="radio"
            id={props.id}
            name={props.name}
            value={props.value}
            checked={props.checked}
            onChange={props.onChange}
        />
        <label className="ml-1" htmlFor={props.id}>{props.label}</label>
    </div>;
}
