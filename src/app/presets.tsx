import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Api } from "@/lib/api"

async function getPresets() {
    const response = await Api.GET('/v1/presets');
    return response.data?.data ?? [];
}

export default async function Presets() {
    const presets = await getPresets();

    return (
        <div>
            <div className="text-md font-semibold mb-2">Часто ищут</div>
            <div className="flex flex-wrap gap-2 ">
                {presets.map(preset => (
                    <div className="w-full md:w-auto overflow-x-auto" key={preset.id}>
                        <Button variant="default" asChild>
                            <Link href={`/events/${preset.slug}`}>{preset.title}</Link>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
