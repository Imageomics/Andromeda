import WeightSlider from "../components/WeightSlider";
import ShowRadioGroup from "../components/ShowRadioGroup";
import ImageSizeSlider from "../components/ImageSizeSlider";
import PointScalingSlider from "../components/PointScalingSlider";
import ThumbnailGrid from "../components/ThumbnailGrid";
import ColoredButton from "../components/ColoredButton";
import ImageGrid from "../components/ImageGrid";
import { useState, useRef } from 'react';

const DEFAULT_IMAGE_SIZE = 40;
const DEFAULT_POINT_SCALING = 1.0;
const GRID_SIZE = 600;
const THUMBNAIL_SIZE = 100;

interface DataExplorerProps {
    images: any[];
    setImageData: any;
    weights: any | undefined;
    datasetID: string | undefined;
    drFunc: any;
    rdrFunc: any;
}

export default function DataExplorer(props: DataExplorerProps) {
    const { images, setImageData, weights, datasetID, drFunc, rdrFunc } = props;
    const [imageSize, setImageSize] = useState<number>(DEFAULT_IMAGE_SIZE);
    const [pointScaling, setPointScaling] = useState<number>(DEFAULT_POINT_SCALING);
    const [showLabel, setShowLabel] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<boolean>(true);
    const [sliderWeights, setSliderWeights] = useState<any>(weights);
    const [working, setWorking] = useState<boolean>(false);
    const stageRef = useRef<any>(null);

    function onImageMoved(x: number, y: number, label: string) {
        if (images) {
            const newImages = [...images];
            const idx = images.findIndex((x) => x.label === label);
            newImages[idx].x = x;
            newImages[idx].y = y;
            newImages[idx].selected = true;
            setImageData(newImages);
        }
    }

    let weightControls = null;
    function onChangeWeight(key: string, value: number) {
        let newWeights = { ...sliderWeights };
        newWeights[key] = value;
        setSliderWeights(newWeights)
    }

    if (weights) {
        weightControls = Object.keys(weights).map(key => <WeightSlider
            key={key}
            id={key}
            weights={sliderWeights}
            onChange={(evt: any) => onChangeWeight(key, parseFloat(evt.target.value))} />);
    }

    async function applySliderWeights() {
        setWorking(true);
        const results = await drFunc(datasetID, sliderWeights);
        setSliderWeights(results.weights);
        setWorking(false);
    }

    async function applyMovedObservations() {
        if (images) {
            const movedPositions = images.filter((x) => x.selected);
            if (movedPositions.length < 2) {
                alert("You must move at least 2 images first.");
            } else {
                setWorking(true);
                const results = await rdrFunc(datasetID, movedPositions);
                setSliderWeights(results.weights);
                //clear selected images
                const newImages = images.map((x) => {
                    return { ...x, selected: false }
                })
                setImageData(newImages);
                setWorking(false);
            }
        }
    }

    async function resetPlot() {
        setWorking(true);
        let newWeights = { ...sliderWeights };
        for (const key in newWeights) {
            newWeights[key] = 0.5;
        }
        setSliderWeights(newWeights);
        const results = await drFunc(datasetID, newWeights);
        setSliderWeights(results.weights);
        setImageData(results.images);
        if (stageRef.current) {
            stageRef.current.x(0);
            stageRef.current.y(0);
        }
        setWorking(false);
    }

    function onChangeShow(evt: any) {
        const showType = evt.target.value;
        if (showType === "image") {
            setShowImage(true);
            setShowLabel(false);
        } else if (showType === "label") {
            setShowImage(false);
            setShowLabel(true);
        } else {
            setShowImage(true);
            setShowLabel(true);
        }
    }

    return (
        <div className="flex">
            <div>
                <ImageGrid
                    stageRef={stageRef}
                    size={GRID_SIZE}
                    imageSize={imageSize}
                    pointScaling={pointScaling}
                    showLabel={showLabel}
                    showImage={showImage}
                    onImageMoved={onImageMoved}
                    images={images}
                />
                <div>
                    <ColoredButton
                        label="Apply Moved Observations"
                        working={working}
                        onClick={applyMovedObservations}
                        color="green"
                    />
                    <ColoredButton
                        label="Apply Slider Weights"
                        working={working}
                        onClick={applySliderWeights}
                        color="orange"
                    />
                    <ColoredButton
                        label="Reset Plot"
                        working={working}
                        onClick={resetPlot}
                        color="red"
                    />
                </div>
                <div>
                    <ImageSizeSlider imageSize={imageSize} setImageSize={setImageSize} />
                    <PointScalingSlider pointScaling={pointScaling} setPointScaling={setPointScaling} />
                    <ShowRadioGroup showImage={showImage} showLabel={showLabel} onChangeShow={onChangeShow} />
                </div>
            </div>
            <div>
                <ThumbnailGrid images={images} size={THUMBNAIL_SIZE} />
                {weightControls}
            </div>
        </div>
    )
}
