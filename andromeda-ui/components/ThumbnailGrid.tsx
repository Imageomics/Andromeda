import { Stage, Layer, Rect, Circle } from 'react-konva';

const POINT_RADIUS = 2;
const POINT_OFFSET = 30;

interface ThumbnailGridProps {
    size: number;
    images: any[]
}

function scaleCoordinate(val: number, scaleAmt: number) {
    return val * scaleAmt + scaleAmt + POINT_RADIUS + POINT_OFFSET;
}

export default function ThumbnailGrid(props: ThumbnailGridProps) {
    const { size, images } = props
    const scaleAmt = size / 6;
    let points = null;
    points = images.map(item => {
        const x = scaleCoordinate(item.x, scaleAmt);
        const y = scaleCoordinate(item.y, scaleAmt);
        return <Circle
            stroke="black"
            opacity={0.5}
            key={item.label}
            x={x} y={y}
            fill="grey"
            radius={POINT_RADIUS} />
    });
    return <Stage width={size} height={size}>
        <Layer>
            <Rect stroke="grey" width={size} height={size} />
            {points}
        </Layer>
    </Stage>;
}
