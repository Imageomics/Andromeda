import SimpleSelect from "../components/SimpleSelect";
import SelectColumnsList from "../components/SelectColumnsList";
import ColoredButton from './ColoredButton';

interface ConfigureDatasetProps {
    columnDetails: any;
    columnSettings: any;
    setColumnSettings: any;
    onClickVisualize: any
}

export default function ConfigureDataset(props: ConfigureDatasetProps) {
    const { columnDetails, columnSettings, setColumnSettings, onClickVisualize } = props;
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

    return <div>
        <h2 className="text-xl mb-2 font-bold">Configure Visualization</h2>
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
                numericColumns={columnDetails.numeric}
                selectedColumns={columnSettings.selected}
                changeSelectedColumn={changeSelectedColumn} />
        </div>
        <div className="mt-4">
            <ColoredButton
                label="Visualize Data"
                onClick={onClickVisualize}
                disabled={!columnSettings.label || columnSettings.selected.length == 0}
                color="blue"
            />
        </div>
    </div>
}
