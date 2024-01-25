const CHECKBOXES_PER_ROW = 6;

interface SelectColumnsListrProps {
    columns: string[];
    selectedColumns: string[];
    changeSelectedColumn: any;
}

function groupItems(items: string[], size: number) {
    const results: any = [];
    const mutableItems = items.slice();
    while (mutableItems.length > 0) {
        results.push(mutableItems.splice(0, size));
    }
    return results;
}

export default function SelectColumnsList(props: SelectColumnsListrProps) {
    const { columns, selectedColumns, changeSelectedColumn } = props
    const groupedItems = groupItems(columns, CHECKBOXES_PER_ROW)
    const columnTableRows = groupedItems.map((columnNamesSubset: string[], idx: number) => {
        const checkboxes: any = columnNamesSubset.map((x) => {
            const name = "select_column_" + x;
            return <td key={x} className="px-2 whitespace-nowrap">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={selectedColumns.includes(x)}
                    onChange={(e) => changeSelectedColumn(x, e.target.checked)}
                />
                &nbsp;
                <label htmlFor={name}>{x}</label>
            </td>
        });
        return <tr key={idx}>
            {checkboxes}
        </tr>
    });
    return <table className="ml-1">
        <tbody>
            {columnTableRows}
        </tbody>
    </table>;
}
