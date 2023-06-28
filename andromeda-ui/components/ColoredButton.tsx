import {buttonColorClassName} from "./ButtonColors";

interface ColoredButtonProps {
    label: string;
    onClick: any;
    disabled?: boolean;
    color: string;
}

export default function ColoredButton(props: ColoredButtonProps) {
    const { label, disabled, color, onClick } = props;
    const className = buttonColorClassName(color);
    return <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        type="button">{label}</button>;
}
