export default function GotoLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body>
                {children}
            </body>
        </html>
    )
}