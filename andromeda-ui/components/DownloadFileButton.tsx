import {buttonColorClassName} from "./ButtonColors";
import Spinner from "./Spinner";

interface DownloadFileButtonProps {
    url: string | undefined;
}

export default function DownloadFileButton(props: DownloadFileButtonProps) {
    const { url } = props;
    const className = buttonColorClassName("blue");
    if (url) {
        return <a className={className} download href={url}>Download CSV</a>;
    } else {
        return <button className={className} disabled><Spinner /> Download CSV</button>;
    }
}
