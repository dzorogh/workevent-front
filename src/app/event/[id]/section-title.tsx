interface SectionTitleProps {
    title?: string
    children?: React.ReactNode
    className?: string
}

export default function SectionTitle({ title, children, className }: SectionTitleProps) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <h2 className="text-xl font-semibold">{title}{children}</h2>
        </div>
    )
}