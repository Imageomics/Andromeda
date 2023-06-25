import { PropsWithChildren } from 'react'

export default function Main(props: PropsWithChildren) {
    return <main className="flex min-h-screen flex-col px-6 py-4">
        {props.children}
    </main>
}
