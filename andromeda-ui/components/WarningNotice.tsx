interface WarningNoticeProps {
    message: string;
}

export default function WarningNotice(props: WarningNoticeProps) {
    return <div className="text-red-600 mt-4 mb-6">{props.message}</div>
}
