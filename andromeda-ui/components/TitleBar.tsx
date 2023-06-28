import Link from 'next/link'

const BASE_LINK_CLASSNAME = "text-cyan-200 hover:text-white mr-4";
const SELECTED_CLASSNAME = "border-b-2"

interface TitleBarProps {
    selected: string;
}

function lookupClassName(url: string, selected: string) {
    if (url === selected) {
        return BASE_LINK_CLASSNAME + " " + SELECTED_CLASSNAME;
    }
    return BASE_LINK_CLASSNAME;
}

export default function TitleBar(props: TitleBarProps) {
    const { selected } = props;
    let homeClassName = lookupClassName("/", selected);
    let fetchClassName = lookupClassName("/fetch-data", selected)
    return <nav className="flex items-center bg-cyan-600 p-3">
        <h2 className="text-3xl semi-bold leading-tight text-white mr-6 ">Andromeda</h2>
        <Link href="/" className={homeClassName}>Home</Link>
        <Link href="/fetch-data" className={fetchClassName}>Fetch image data</Link>
    </nav>;
}
