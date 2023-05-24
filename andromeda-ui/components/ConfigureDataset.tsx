import SimpleSelect from "../components/SimpleSelect";
import SelectColumnsList from "../components/SelectColumnsList";
import ColoredButton from './ColoredButton';
import { showError } from "../util/toast";

interface ConfigureDatasetProps {
    columnDetails: any;
    columnSettings: any;
    setColumnSettings: any;
    visualizeData: any;
    onClickBack: any;
}

export default function ConfigureDataset(props: ConfigureDatasetProps) {
    const { columnDetails, columnSettings, setColumnSettings, visualizeData, onClickBack } = props;
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
