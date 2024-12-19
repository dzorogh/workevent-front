import { Button } from '@/components/ui/button';

export default function LoadMoreButton({ onClick, loadedCount, total, perPage }: { onClick: () => void, loadedCount: number, total: number, perPage: number }) {
    const remaining = total - loadedCount;
    return (
        <div className="flex justify-center">
            <Button variant="muted" onClick={onClick}>
                Показать еще {Math.min(remaining, perPage)} из {remaining}
            </Button>
        </div>
    );
}