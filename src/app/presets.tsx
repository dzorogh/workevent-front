import { Button } from "@/components/ui/button";
import Link from "next/link";
import Api from '@/lib/api';

async function getPresets() {
    const response = await Api.GET('/v1/presets', {
        cache: 'force-cache',
        revalidate: false,
    });
    return response.data?.data ?? [];
}

export default async function Presets() {
    const presets = await getPresets();

    return (
        <div>
            <div className="text-lg font-semibold mb-2">Часто ищут</div>
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <Button variant="outline" asChild key={preset.id}>
                        <Link href={`/`}>{preset.title}</Link>
                    </Button>
                ))}
            </div>
        </div>
    );
}
