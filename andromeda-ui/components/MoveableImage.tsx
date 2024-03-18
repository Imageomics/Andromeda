import useImage from 'use-image';
import { Group, Image, Text, Circle } from 'react-konva';
import { useState } from 'react';

interface MoveableImageProps {
    label: string;
    url: string;
    x: number;
    y: number;
    imageSize: number;
    showLabel: boolean;
    showImage: boolean;
    showSelected: boolean;
    onImageMoved: any;
    onMouseEnter: any;
    onMouseLeave: any;
}

export default function MoveableImage(props: MoveableImageProps) {
    const { label, url, x, y, imageSize, showLabel, showImage, showSelected,
        onImageMoved, onMouseEnter, onMouseLeave } = props;
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [image] = useImage(url);
    const halfImageSize = imageSize / 2;
    const circleRadius = halfImageSize + 6;
    let imageOrDot = <Circle radius={4} fill="black"/>;
    if (showImage) {
        if (url) {
            imageOrDot = <Image
                x={-halfImageSize}
                y={-halfImageSize}
                image={image}
                width={imageSize}
                height={imageSize}
                strokeWidth={2}
                alt={label}
            />            
        }
    }
    let imageLabel = null;
    let labelX = 6;
    let labelY = -6;
    if (showLabel) {
        if (showImage) {
            if (url) {
                labelX = halfImageSize + 2;
            }
        }
        imageLabel = <Text text={label}
            x={labelX} y={labelY}
            fontSize={14}
            shadowOffsetX={1}
            shadowColor="white" />
    }
    let selectionShape = null
    if (showSelected || isDragging) {
        selectionShape = <Circle  radius={circleRadius} fill="green" opacity={0.5} />
    }

    function onDragEnd(evt: any) {
        setIsDragging(false);
        onImageMoved(evt.target.x(), evt.target.y(), label);
    }

    return <Group
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-label={label}
        draggable
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        x={x}
        y={y}>
        {selectionShape}
        {imageOrDot}
        {imageLabel}
    </Group>;
}
