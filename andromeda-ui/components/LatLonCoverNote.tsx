import Anchor from "../components/Anchor";

export default function LatLonCoverNote() {
    return <p className="text-sm mt-4 max-w-prose" >
        Note:
        The landcover satellite data is only available for the contiguous United States 
        from 2022 and is generated using&nbsp;
        <Anchor href="https://github.com/Imageomics/LatLonCover" target="_blank">LatLonCover</Anchor>.
        Columns will be added for landcover data at two scales centered on each observation geocoordinate:
        &nbsp;
        <span className="italic" title="1/2 x 1/2 mile">small</span>
        &nbsp;and&nbsp;
        <span className="italic" title="2 x 2 mile">big</span>.
        See&nbsp;
        <Anchor href="https://github.com/Imageomics/LatLonCover/blob/main/cropScapeDocumentation/CDL_subcategories_legendCrse.csv" target="_blank">
        LatLonCover subcategories
        </Anchor>
        &nbsp;for the definitions of the classifications.
    </p>
}
