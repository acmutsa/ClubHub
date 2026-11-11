"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TIME_ZONE_COOKIE } from "@/constants/time-zone";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function useTimeZone() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.split("=")[1];

    if (!timeZone || decodeURIComponent(current ?? "") === timeZone) return;

    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  }, [router]);
}

export default function TimeZoneCookie(){
  useTimeZone();
  return null;
}
