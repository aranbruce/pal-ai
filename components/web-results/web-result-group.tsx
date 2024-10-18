import { Suspense } from "react";
import getWebResults from "@/server/get-web-results";
import WebResultContent from "@/components/web-results/web-result-content";
import WebResultSkeleton from "@/components/web-results/web-result-group-skeleton";
import { CountryCode, FreshnessOptions, Units } from "@/libs/schema";

export interface WebResult {
  title: string;
  description: string;
  url: string;
  date: string;
  author: string;
  imageURL: string;
}

interface WebResultGroupProps {
  query: string;
  country?: CountryCode;
  freshness?: FreshnessOptions;
  units?: Units;
  count?: number;
  offset?: number;
}

async function WebResultData({
  query,
  country,
  freshness,
  units,
  count,
  offset,
}: WebResultGroupProps) {
  const results = await getWebResults({
    query,
    country,
    freshness,
    units,
    count,
    offset,
  });

  if (Array.isArray(results)) {
    return <WebResultContent results={results} query={query} />;
  } else {
    return null;
  }
}

export default function WebResultGroup({
  query,
  country,
  freshness,
  units,
  count,
  offset,
}: WebResultGroupProps) {
  return (
    <Suspense fallback={<WebResultSkeleton />}>
      <WebResultData
        query={query}
        country={country}
        freshness={freshness}
        units={units}
        count={count}
        offset={offset}
      />
    </Suspense>
  );
}
