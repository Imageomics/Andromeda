interface LabeledSliderProps {
    name: string;
    value: number;
    label: string;
    min: number,
    max: number,
    step: number;
    onChange: any;
}

export default function LabeledSlider(props: LabeledSliderProps) {
    return <>
        <label htmlFor={props.name}>{props.label}&nbsp;</label>
        <input
            id={props.name}
            name={props.name}
            type="range"
            min={props.min}
            max={props.max}
            step={props.step}
            value={props.value}
            onChange={props.onChange}
        ></input>
    </>;
}
