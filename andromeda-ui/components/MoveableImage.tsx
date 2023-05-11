import useImage from 'use-image';
import { Group, Image, Text, Circle } from 'react-konva';
import { useState } from 'react';

interface MoveableImageProps {
    label: string;
    url: string;
    x: number;
    y: number;
    gridSize: number;
    imageSize: number;
    showLabel: boolean;
    showImage: boolean;
    showSelected: boolean;
    onImageMoved: any;
}

function transformImageCoordinates(x: number, y: number, gridSize: number) {
    //transformed x and y are in the range +/- 1
    return {
        "x": x / gridSize * 2.0 - 1.0,
        "y": y / gridSize * 2.0 - 1.0,
    }
}

export default function MoveableImage(props: MoveableImageProps) {
    const { label, url, x, y, gridSize, imageSize, showLabel, showImage, showSelected, onImageMoved } = props;
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [image] = useImage(url);
    let imageControl = null;
    if (showImage) {
        imageControl = <Image
            image={image}
            width={imageSize}
            height={imageSize}
            strokeWidth={2}
            alt={"Image " + label}
        />
    }
    let labelControl = null;
    let labelX = 0;
    let labelY = 0;
    if (showLabel) {
        if (showImage) {
            labelX = imageSize;
            labelY = imageSize / 3;
        }
        labelControl = <Text
            text={label} x={labelX} y={labelY}
            shadowColor="white" shadowOffset={{ x: 1, y: 1 }} />
    }
    let circleControl = null;
    if (showSelected || isDragging) {
        const halfImageSize = imageSize / 2;
        const circleRadius = halfImageSize + 6;
        circleControl = <Circle x={halfImageSize} y={halfImageSize} radius={circleRadius} fill="green" opacity={0.5} />
    }

    function onDragEnd(evt: any) {
        setIsDragging(false);
        const imageSettings: any = {
            "label": label,
            x: evt.target.x(),
            y: evt.target.y(),
        }
        imageSettings.label = label;
        onImageMoved(imageSettings)
    }

    return <Group
        data-label={label}
        draggable
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        x={x}
        y={y}>
        {circleControl}
        {imageControl}
        {labelControl}

    </Group>;
}
