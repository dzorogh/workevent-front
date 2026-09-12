import { TagResource } from '@/lib/types';
import { discoveryChipClass } from '@/lib/discovery-ui';

interface TagsProps {
    tags: TagResource[];
}

export default function Tags({ tags }: TagsProps) {
    if (!tags || tags.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <span key={tag.id} className={discoveryChipClass}>
                    {tag.title}
                </span>
            ))}
        </div>
    );
}
