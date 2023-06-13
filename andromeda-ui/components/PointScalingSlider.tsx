import LabeledSlider from "../components/LabeledSlider";

interface PointScalingSliderProps {
    pointScaling: number;
    setPointScaling: any;
}

export default function PointScalingSlider(props: PointScalingSliderProps) {
    const { pointScaling, setPointScaling } = props
    return <>
        <LabeledSlider
            name="pointScaling"
            label="Scale:"
            min={0.2}
            max={2}
            step={0.05}
            value={pointScaling}
            onChange={(evt: any) => setPointScaling(parseFloat(evt.target.value))}
        />
        &nbsp;
        {Math.round(pointScaling * 100)} %
    </>;
}
