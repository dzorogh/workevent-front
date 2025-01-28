import { Badge } from "@/components/ui/badge";
import { TagResource } from "@/lib/types";

interface TagsProps {
    tags: TagResource[]
}

export default function Tags({ tags }: TagsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge
                            key={tag.id}
                        >
                            {tag.title}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}