import Search from "@/components/search";
import EventsByIndustry from "@/app/(home)/events-by-industry";
import Hero from "@/app/(home)/hero";
import PreviewChrome from "./preview-chrome";
import {
  DISCOVERY_FIXTURE_EVENTS,
  DISCOVERY_FIXTURE_INDUSTRIES,
  DISCOVERY_FIXTURE_META,
  DISCOVERY_FIXTURE_MONTH,
} from "@/lib/discovery-fixtures";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery visual fixture",
  robots: { index: false, follow: false },
};

export default function DiscoveryFixturePage() {
  return (
    <div id="discovery-fixture" className="flex flex-col">
      <PreviewChrome />
      <Hero monthLabel={DISCOVERY_FIXTURE_MONTH} />
      <div className="mt-5 min-[1200px]:mt-[24px]">
        <Search
          cities={[
            { id: 1, title: "Москва" },
            { id: 72, title: "Тюмень" },
          ]}
        />
      </div>
      <div className="mt-[14px]">
        <EventsByIndustry
          frozen
          initialIndustries={DISCOVERY_FIXTURE_INDUSTRIES}
          initialEvents={DISCOVERY_FIXTURE_EVENTS}
          initialMeta={DISCOVERY_FIXTURE_META}
        />
      </div>
    </div>
  );
}
