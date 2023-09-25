import {buttonColorClassName} from "./ButtonColors";
import Spinner from "./Spinner";

interface ColoredButtonProps {
    label: string;
    onClick: any;
    disabled?: boolean;
    color: string;
    spinnerOnDisabled?: boolean;
}

export default function ColoredButton(props: ColoredButtonProps) {
    const { label, disabled, color, spinnerOnDisabled, onClick } = props;
    const className = buttonColorClassName(color);
    let beforeLabel = null;
    if (disabled && spinnerOnDisabled) {
        beforeLabel = <Spinner />;
    }
    return <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        type="button">
            {beforeLabel}{label}
        </button>;
}
