import Anchor from "../components/Anchor";

export default function SourceNote() {
    return <p className="text-sm mt-4 max-w-prose" >
        <b>Note: </b>
        All source code is available on the&nbsp;
        <Anchor href="https://github.com/Imageomics/Andromeda" target="_blank">Andromeda GitHub repository</Anchor>.
        <br></br>
        User and developer guides are available on the&nbsp;
        <Anchor href="https://github.com/Imageomics/Andromeda/wiki" target="_blank">repository wiki</Anchor>,
        &nbsp;and sample datasets can be found in the&nbsp;
        <Anchor href="https://github.com/Imageomics/Andromeda/tree/main/datasets" target="_blank">
        datasets directory
        </Anchor>.
    </p>
}
