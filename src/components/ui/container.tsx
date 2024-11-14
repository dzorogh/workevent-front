export default function Container({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`container max-w-screen-xl mx-auto ${className}`}>
            {children}
        </div>
    );
}