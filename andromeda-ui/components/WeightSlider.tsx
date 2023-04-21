interface WeightSliderProps {
    id: string;
    weights: any;
    onChange: any;
}

export default function WeightSlider({ id, weights, onChange }: WeightSliderProps) {
    const value = weights[id];

    return <div key={id} className="flex flex-nowrap">
        <input
            type="range"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            min="0.001"
            max="0.999"
            step="0.001"
            className="w-60"
        ></input>
        &nbsp;
        <label htmlFor="volume">{id}</label>
    </div>
}