import { Button } from '@/components/ui/button';

export default function LoadMoreButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex justify-center">
            <Button variant="muted" onClick={onClick}>
                Показать еще
            </Button>
        </div>
    );
}