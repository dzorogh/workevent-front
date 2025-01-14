import { permanentRedirect } from "next/navigation";
import { decodeUrl } from "@/lib/utils";

export default async function GotoPage({ params }: { params: Promise<{ id: string }> }) {
    const id = await params.then(params => params.id)

    const url = decodeUrl(id)

    permanentRedirect(url)
}