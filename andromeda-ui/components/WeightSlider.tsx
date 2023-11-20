interface WeightSliderProps {
    id: string;
    weights: any;
    highlight: number | undefined;
    onChange: any;
}

const SLIDER_WIDTH = 200;


export default function WeightSlider({ id, weights, highlight, onChange }: WeightSliderProps) {
    const value = weights[id];
    let highlightDiv = null;
    if (highlight !== undefined) {
        const hintPosition = highlight * (SLIDER_WIDTH - 4);
        highlightDiv = <div className="absolute left-2 top-1 inline w-1 bg-cyan-600 h-3" style={{"left": hintPosition + "px"}}>
            &nbsp;
        </div>;
    }
    return <div key={id} className="flex flex-nowrap">
        <div className="relative">
            <input
                type="range"
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                min="0.001"
                max="0.999"
                step="0.001"
                style={{"width": SLIDER_WIDTH + "px"}}
            ></input>
            {highlightDiv}
        </div>
        &nbsp;
        <label htmlFor="volume">{id}</label>
    </div>
}
