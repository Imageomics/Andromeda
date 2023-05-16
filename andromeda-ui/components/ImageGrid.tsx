import MoveableImage from "../components/MoveableImage";
import { Stage, Layer, Rect } from 'react-konva';

const POINT_RADIUS = 2;
const POINT_OFFSET = 10;

interface ImageGridProps {
    stageRef: any;
    size: number;
    imageSize: number;
    pointScaling: number;
    showLabel: boolean;
    showImage: boolean;
    onImageMoved: any;
    images: any[];
}

function fromGridCoordinates(x: number, y: number, gridSize: number, pointScaling: number) {
    const halfGrid = (gridSize / 2);
    return {
        x: (x - halfGrid) / pointScaling / halfGrid,
        y: (y - halfGrid) / pointScaling / halfGrid,
    }
}

function toGridCoordinates(x: number, y: number, gridSize: number, pointScaling: number) {
    const halfGrid = (gridSize / 2);
    return {
        imageX: x * pointScaling * halfGrid + halfGrid,
        imageY: y * pointScaling * halfGrid + halfGrid
    }
}

function createImage(item: any, gridSize: number, imageSize: number, pointScaling: number,
    showLabel: boolean, showImage: boolean, onImageMoved: any,
    onMouseEnter: any, onMouseLeave: any) {
    const { imageX, imageY } = toGridCoordinates(item.x, item.y, gridSize, pointScaling);
    return <MoveableImage
        key={item.label}
        label={item.label}
        url={item.url}
        x={imageX}
        y={imageY}
        imageSize={imageSize}
        showLabel={showLabel}
        showImage={showImage}
        showSelected={item.selected}
        onImageMoved={onImageMoved}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    />
}

export default function ImageGrid(props: ImageGridProps) {
    const { stageRef, size, imageSize, pointScaling, showLabel, showImage, images } = props;
    function onMouseEnter(evt: any) {
        stageRef.current.container().style.cursor = 'move';
    }

    function onMouseLeave(evt: any) {
        stageRef.current.container().style.cursor = 'grab';
    }

    const imageControls = images.map(item => createImage(
        item, size, imageSize, pointScaling,
        showLabel, showImage, onImageMoved,
        onMouseEnter, onMouseLeave
    ))

    function onImageMoved(imageX: number, imageY: number, label: string) {
        const { x, y } = fromGridCoordinates(imageX, imageY, size, pointScaling);
        props.onImageMoved(x, y, label);
    }

    return <Stage ref={stageRef} draggable={true} width={size} height={size} className="cursor-grab">
        <Layer>
            <Rect width={size} height={size} />
            {imageControls}
        </Layer>
    </Stage>;
}




