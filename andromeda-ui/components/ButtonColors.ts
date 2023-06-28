const COLOR_CLASSNAME_LOOKUP: any = {
    green: "bg-green-400 hover:bg-green-500 text-slate-100 ",
    orange: "bg-orange-400 hover:bg-orange-500 text-slate-100 ",
    red: "bg-red-400 hover:bg-red-500 text-slate-100 ",
    blue: "bg-blue-400 hover:bg-blue-500 text-slate-100 ",
    white: "bg-white-400 hover:bg-white-500 text-black-100 border",
}

export function buttonColorClassName(color: string) {
    let className = "px-3 py-2 rounded disabled:opacity-50 inline-block";
    const colorClassName = COLOR_CLASSNAME_LOOKUP[color]
    if (colorClassName) {
        className += " " + colorClassName;
    }
    return className;
}
