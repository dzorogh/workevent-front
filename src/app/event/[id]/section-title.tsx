interface SectionTitleProps {
    title?: string
    children?: React.ReactNode
}

export default function SectionTitle({ title, children }: SectionTitleProps) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{title}{children}</h2>
        </div>
    )
}