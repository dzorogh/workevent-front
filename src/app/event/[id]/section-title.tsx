interface SectionTitleProps {
    title: string
}

export default function SectionTitle({ title }: SectionTitleProps) {
    return (
        <h2 className="text-xl font-semibold">{title}</h2>
    )
}