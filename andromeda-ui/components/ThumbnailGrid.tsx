import { Stage, Layer, Rect, Circle } from 'react-konva';

const POINT_RADIUS = 2;
const POINT_OFFSET = 10;

interface ThumbnailGridProps {
    size: number;
    images: any[]
}

export default function ThumbnailGrid(props: ThumbnailGridProps) {
    const { size, images } = props
    const scaleAmt = size / 4;
    let points = null;
    // TODO rectangle showing where the ImageGrid is looking
    points = images.map(item => {
        const x = item.x * scaleAmt + scaleAmt + POINT_RADIUS + POINT_OFFSET;
        const y = item.y * scaleAmt + scaleAmt + POINT_RADIUS + POINT_OFFSET;
        return <Circle key={item.name} x={x} y={y} fill="grey" radius={POINT_RADIUS} />
    })
    return <Stage width={size} height={size}>
        <Layer>
            <Rect stroke="grey" width={size} height={size} />
            {points}
        </Layer>
    </Stage>;
}
