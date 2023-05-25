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
    let imageControl = null;
    if (showImage) {
        if (url) {
            imageControl = <Image
                image={image}
                width={imageSize}
                height={imageSize}
                strokeWidth={2}
                alt={label}
            />            
        } else {
            imageControl = <Circle radius={4} fill="black"/>
        }
    }
    let labelControl = null;
    let labelX = 0;
    let labelY = 0;
    if (showLabel) {
        if (showImage) {
            if (url) {
                labelX = imageSize + 2;
                labelY = imageSize / 3;    
            } else {
                labelX = 6;
                labelY = -6;
            }
        }
        labelControl = <Text text={label}
            x={labelX} y={labelY}
            fontSize={14}
            shadowOffsetX={1}
            shadowColor="white" />
    }
    let circleControl = null;
    if (showSelected || isDragging) {
        const halfImageSize = imageSize / 2;
        const circleRadius = halfImageSize + 6;
        if (url) {
            circleControl = <Circle x={halfImageSize} y={halfImageSize} radius={circleRadius} fill="green" opacity={0.5} />
        } else {
            circleControl = <Circle  radius={10} fill="green" opacity={0.5} />
        }
        
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
        {circleControl}
        {imageControl}
        {labelControl}
    </Group>;
}
