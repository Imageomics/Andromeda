import SimpleSelect from "../components/SimpleSelect";
import SelectColumnsList from "../components/SelectColumnsList";
import ColoredButton from './ColoredButton';
import { groupColumnsByType } from "../backend/parseCSV";

interface ConfigureDatasetProps {
    datasetName: string
    columnDetails: any;
    columnSettings: any;
    setColumnSettings: any;
    visualizeData: any;
    onClickBack: any;
}

export default function ConfigureDataset(props: ConfigureDatasetProps) {
    const { datasetName, columnDetails, columnSettings, setColumnSettings, visualizeData, onClickBack } = props;
    function setLabelColumnName(value: string) {
        setColumnSettings({ ...columnSettings, label: value })
    }
    function setURLColumnName(value: string) {
        setColumnSettings({ ...columnSettings, url: value })
    }

    function changeSelectedColumn(changedColumnName: string, checked: boolean) {
        const selected = columnSettings.selected;
        let newSelectedColumns = null;
        if (checked) {
            newSelectedColumns = selected.concat(changedColumnName);
        } else {
            newSelectedColumns = selected.filter((x: any) => x !== changedColumnName);
        }
        setColumnSettings({ ...columnSettings, selected: newSelectedColumns })
    }

    let urlSelect = null;
    if (columnDetails.urls.length > 0) {
        urlSelect = <SimpleSelect
            label="Image URL"
            value={columnSettings.url}
            setValue={setURLColumnName}
            values={columnDetails.urls} />
    }
    const {regularColumns, ancillaryColumns} = groupColumnsByType(
        columnDetails.columns,
        new Set(columnSettings.ancillaryColumns)
    )

    let selectAncillaryColumns = null;
    if (ancillaryColumns.length) {
        selectAncillaryColumns = <>
            <div className="text-md font-medium">Ancillary Columns</div>
            <SelectColumnsList
                columns={ancillaryColumns}
                selectedColumns={columnSettings.selected}
                changeSelectedColumn={changeSelectedColumn} />
        </>
    }

    return <div>
        <h2 className="text-xl mb-2 font-bold">Configure Visualization</h2>
        <div>
            <div className="text-md font-medium">CSV file</div>
            <div className="ml-3">{datasetName}</div>
        </div>
        <div>
            <SimpleSelect
                label="Label"
                value={columnSettings.label}
                setValue={setLabelColumnName}
                values={columnDetails.labels}
            />
        </div>
        <div>
            {urlSelect}
        </div>
        <div>
            <div className="text-md font-medium">Columns</div>
            <SelectColumnsList
                columns={regularColumns}
                selectedColumns={columnSettings.selected}
                changeSelectedColumn={changeSelectedColumn} />
            {selectAncillaryColumns}
        </div>
        <div className="mt-4 flex gap-2">
            <ColoredButton
                label="Back"
                onClick={onClickBack}
                color="white"
            />
            <ColoredButton
                label="Visualize Data"
                onClick={visualizeData}
                disabled={!columnSettings.label || columnSettings.selected.length == 0}
                color="blue"
            />
        </div>
    </div>
}
