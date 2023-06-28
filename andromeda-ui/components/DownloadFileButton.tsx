import {buttonColorClassName} from "./ButtonColors";

interface DownloadFileButtonProps {
    url: string;
}

export default function DownloadFileButton(props: DownloadFileButtonProps) {
    const { url } = props;
    const className = buttonColorClassName("blue");
    return <a className={className} download href={url}>Download CSV</a>;
}
