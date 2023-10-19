import {buttonColorClassName} from "./ButtonColors";
import Spinner from "./Spinner";

interface DownloadFileButtonProps {
    url: string | undefined;
}

export default function DownloadCSVButton(props: DownloadFileButtonProps) {
    const { url } = props;
    const className = buttonColorClassName("blue");
    if (url) {
        return <a className={className} download href={url}>Download CSV</a>;
    } else {
        // using a button here since an anchor can't be disabled
        return <button className={className} disabled><Spinner /> Generating CSV</button>;
    }
}
