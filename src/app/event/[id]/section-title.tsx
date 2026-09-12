import { cn } from '@/lib/utils';
import { discoverySectionTitleClass } from '@/lib/discovery-ui';

interface SectionTitleProps {
    title?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function SectionTitle({ title, children, className }: SectionTitleProps) {
    return (
        <h2 className={cn(discoverySectionTitleClass, className)}>
            {title}
            {children}
        </h2>
    );
}
