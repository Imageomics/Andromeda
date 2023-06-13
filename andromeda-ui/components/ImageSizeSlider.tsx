import LabeledSlider from "../components/LabeledSlider";

interface ImageSizeSliderProps {
    imageSize: number;
    setImageSize: any;
}

export default function ImageSizeSlider(props: ImageSizeSliderProps) {
    const { imageSize, setImageSize } = props
    return <LabeledSlider
        name="imageSize"
        label="Adjust image size:"
        min={10}
        max={100}
        step={1}
        value={imageSize}
        onChange={(evt: any) => setImageSize(parseInt(evt.target.value))}
    />
}
