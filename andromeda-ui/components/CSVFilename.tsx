interface CSVFilenameProps {
    name: string;
}

export function CSVFilename(props: CSVFilenameProps) {
    return <div>
        <span className="text-md font-medium">CSV file:&nbsp;</span>
        <span>{props.name}</span>
    </div>
}
