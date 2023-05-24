interface ColoredButtonProps {
    label: string;
    onClick: any;
    disabled: boolean;
    color: string;
}

const COLOR_CLASSNAME_LOOKUP: any = {
    green: "bg-green-400 hover:bg-green-500",
    orange: "bg-orange-400 hover:bg-orange-500",
    red: "bg-red-400 hover:bg-red-500",
    blue: "bg-blue-400 hover:bg-blue-500",
}

export default function ColoredButton(props: ColoredButtonProps) {
    const { label, disabled, color, onClick } = props;
    let className = "px-6 py-2 rounded disabled:opacity-50 text-slate-100 inline-block";
    const colorClassName = COLOR_CLASSNAME_LOOKUP[color]
    if (colorClassName) {
        className += " " + colorClassName;
    }
    return <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        type="button">{label}</button>;
}
