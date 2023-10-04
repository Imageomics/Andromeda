import { PropsWithChildren } from 'react'

interface AnchorProps {
    href: string;
    target: string;
}

export default function Anchor(props: PropsWithChildren<AnchorProps>) {
    const {href, target, children} = props;
    return <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={href} target={target}>
        {children}
    </a>
}
