import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Presets() {
    return (
        <div>
            <div className="text-lg font-semibold mb-2">Часто ищут</div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                    <Link href="/">Конференции в Москве</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Конференции в Санкт-Петербурге</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">IT-выставки</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Международный экономический форум</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Конференции в Москве</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Конференции в Санкт-Петербурге</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">IT-выставки</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Международный экономический форум</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Конференции в Москве</Link>
                </Button>
            </div>
        </div>
    );
}
