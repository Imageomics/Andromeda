import LabeledRadio from "../components/LabeledRadio";

interface ShowRadioGroupProps {
    showImage: boolean;
    showLabel: boolean;
    onChangeShow: any;
}

export default function ShowRadioGroup(props: ShowRadioGroupProps) {
    const { showImage, showLabel, onChangeShow } = props;
    return <div>
        Show:
        <LabeledRadio
            id="showImage"
            name="show"
            value="image"
            label="Image"
            checked={showImage && !showLabel}
            onChange={onChangeShow}
        />
        <LabeledRadio
            id="showLabel"
            name="show"
            value="label"
            label="Label"
            checked={showLabel && !showImage}
            onChange={onChangeShow}
        />
        <LabeledRadio
            id="showBoth"
            name="show"
            value="both"
            label="Image and Label"
            checked={showImage && showLabel}
            onChange={onChangeShow}
        />
    </div>;
}
