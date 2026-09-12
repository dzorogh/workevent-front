import Link from "next/link";
import { Api } from "@/lib/api"
import { discoveryChipClass } from "@/lib/discovery-ui";

async function getPresets() {
    const response = await Api.GET('/v1/presets', { cache: 'no-store' });
    return response.data?.data ?? [];
}

export default async function Presets() {
    const presets = await getPresets();

    if (presets.length === 0) return null;

    return (
        <>
            {presets.map(preset => (
                <Link key={preset.id} href={`/events/${preset.slug}`} className={discoveryChipClass}>
                    {preset.title}
                </Link>
            ))}
        </>
    );
}
