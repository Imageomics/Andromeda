import WeightSlider from "../components/WeightSlider";
import MoveableImage from "../components/MoveableImage";
import { useState, useRef, Children } from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';


interface DataExplorerProps {
    images: any[] | undefined;
    setImageData: any;
    weights: any | undefined;
    datasetID: string | undefined;
    drFunc: any;
    rdrFunc: any;
    imagePanelSize: number;
}

function createImage(item: any, gridSize: number, imageSize: number,
    showLabel: boolean, showImage: boolean, onImageMoved: any) {
    return <MoveableImage
        key={item.label}
        label={item.label}
        url={item.url}
        x={item.x}
        y={item.y}
        gridSize={gridSize}
        imageSize={imageSize}
        showLabel={showLabel}
        showImage={showImage}
        showSelected={item.selected}
        onImageMoved={onImageMoved}
    />
}

export default function DataExplorer({ images, setImageData, weights, datasetID, drFunc, rdrFunc, imagePanelSize }: DataExplorerProps) {
    const [imageSize, setImageSize] = useState<number>(40);
    const [showLabel, setShowLabel] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<boolean>(true);
    const [sliderWeights, setSliderWeights] = useState<any>(weights);
    const [working, setWorking] = useState<boolean>(false);
    const [gridScale, setGridScale] = useState<number>(1.0);
    const stageRef = useRef(null);

    let imageControls = null;
    function onImageMoved(imageSettings: any) {
        if (images) {
            const newImages = [...images];
            const idx = images.findIndex((x) => x.label === imageSettings.label);
            newImages[idx].x = imageSettings.x;
            newImages[idx].y = imageSettings.y;
            newImages[idx].selected = true;
            setImageData(newImages);
        }
    }
    if (images) {
        imageControls = images.map(item => createImage(
            item, imagePanelSize, imageSize,
            showLabel, showImage, onImageMoved
        ))
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
        const results = await drFunc(sliderWeights);
        setSliderWeights(results.weights);
        setWorking(false);
    }

    async function updateGridWithScale(newGridScale: number) {
        setGridScale(newGridScale);
    }

    async function applyMovedObservations() {
        if (images) {
            const movedPositions = images.filter((x) => x.selected);
            if (movedPositions.length < 2) {
                alert("You must move at least 2 images first.");
            } else {
                setWorking(true);
                const results = await rdrFunc(movedPositions);
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
        const results = await drFunc(newWeights);
        setSliderWeights(results.weights);
        setImageData(results.images);
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

    var scaleBy = 1.05;
    function onWheel(e: any) {
        e.evt.preventDefault();
        console.log()
        const stage: any = stageRef.current;
        var oldScale = stage.scaleX();
        var pointer = stage.getPointerPosition();

        var mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        var newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
    }

    return (

        <div>
            <div className="flex">
                <div>
                    <Stage draggable={true} ref={stageRef} width={imagePanelSize} height={imagePanelSize} className="mr-4"
                        onWheel={onWheel}>
                        <Layer scaleX={1} scaleY={1}>
                            <Rect width={imagePanelSize} height={imagePanelSize} stroke="black"></Rect>
                            {imageControls}
                        </Layer>
                    </Stage>
                    <div>
                        <button
                            onClick={applyMovedObservations}
                            disabled={working}
                            className="m-2 px-6 py-2 rounded bg-green-400 hover:bg-green-500 disabled:opacity-50 text-slate-100 inline-block"
                            type="button">Apply Moved Observations</button>
                        <button
                            onClick={applySliderWeights}
                            disabled={working}
                            className="m-2 px-6 py-2 rounded bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-slate-100 inline-block"
                            type="button">Apply Slider Weights</button>
                        <button
                            onClick={resetPlot}
                            disabled={working}
                            className="m-2 px-6 py-2 rounded bg-red-400 hover:bg-red-500 disabled:opacity-50 text-slate-100 inline-block"
                            type="button">Reset Plot</button>
                    </div>
                    <div>
                        <div>
                            <label htmlFor="imageSize">Adjust image size:&nbsp;</label>
                            <input
                                id="imageSize"
                                name="imageSize"
                                type="range"
                                min="10"
                                max="100"
                                step="0.05"
                                value={imageSize}
                                onChange={(evt) => setImageSize(parseInt(evt.target.value))}
                            ></input>
                        </div>
                        <div>
                            <div >
                                Show:
                                <div className="inline-block m-2">
                                    <input
                                        type="radio"
                                        id="showImage"
                                        name="show"
                                        value="image"
                                        checked={showImage && !showLabel}
                                        onChange={onChangeShow}
                                    />
                                    <label className="ml-1" htmlFor="showImage">Image</label>
                                </div>
                                <div className="inline-block m-2">
                                    <input
                                        type="radio"
                                        id="showLabel"
                                        name="show"
                                        value="label"
                                        checked={showLabel && !showImage}
                                        onChange={onChangeShow}
                                    />
                                    <label className="ml-1" htmlFor="showLabel">Label</label>
                                </div>
                                <div className="inline-block m-2">
                                    <input
                                        type="radio"
                                        id="showBoth"
                                        name="show"
                                        value="both"
                                        checked={showImage && showLabel}
                                        onChange={onChangeShow}
                                    />
                                    <label className="ml-1" htmlFor="showBoth">Image and Label</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {weightControls}
                </div>
            </div>
        </div >
    )
}
