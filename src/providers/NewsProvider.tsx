import React, { createContext, useContext, useEffect, useState } from "react";

export type SectionHeadline = {
  section: string; // e.g., "Armed conflicts and attacks"
  text: string; // the sentence inside .content
  dateTitle: string; // e.g., "October 25, 2025 (Saturday)"
  link?: string; // optional: the section item’s "link" URL
};

type NewsContextType = {
  headlines: SectionHeadline[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const NewsContext = createContext<NewsContextType>({
  headlines: [],
  loading: true,
  error: null,
  refresh: () => {},
});

const NEWS_URL = "https://newsasfacts.com";
const PROXY = "https://api.allorigins.win/raw?url=";

const ABS = (path?: string) =>
  path?.startsWith("http")
    ? path
    : path
      ? new URL(path, NEWS_URL).toString()
      : undefined;

function clean(s?: string) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/\s([,.;:!?])/g, "$1")
    .trim();
}

function extractDateTitle(doc: Document): string {
  const h1 = doc.querySelector(".day > h1") || doc.querySelector("h1");
  return clean(h1?.textContent || "");
}

function extractSectionHeadlines(doc: Document): SectionHeadline[] {
  const day = doc.querySelector(".day") as HTMLElement | null;
  if (!day) return [];

  const dateTitle = extractDateTitle(doc);

  // Sections are top-level h2 under .day
  const h2s = Array.from(
    day.querySelectorAll(":scope > h2"),
  ) as HTMLHeadingElement[];

  // If you only want these three, keep this filter. Otherwise, remove it to take the first 3 sections.
  const wanted = new Set([
    "Armed conflicts and attacks",
    "International relations",
    "Politics and elections",
  ]);

  const picked: SectionHeadline[] = [];

  for (const h2 of h2s) {
    const sectionTitle = clean(h2.textContent || "");
    if (!wanted.has(sectionTitle)) continue;

    // Find first sibling <article> after this <h2>
    let sib: Element | null = h2.nextElementSibling;
    while (sib && sib.tagName.toLowerCase() !== "article") {
      sib = sib.nextElementSibling;
    }
    if (!sib) continue;

    const article = sib as HTMLElement;
    const content = article.querySelector(".content") as HTMLElement | null;
    if (!content) continue;

    const clone = content.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll(".sources, .related, .action-bar, script, style")
      .forEach((el) => el.remove());
    const text = clean(clone.textContent || "");
    if (!text || text.length < 40) continue;

    const link = ABS(
      article
        .querySelector(".action-bar .direct-link a")
        ?.getAttribute("href") || undefined,
    );

    picked.push({ section: sectionTitle, text, dateTitle, link });
  }

  // Fallback: if site changed, at least return the first three articles
  if (picked.length === 0) {
    const articles = Array.from(day.querySelectorAll(":scope > article")).slice(
      0,
      3,
    );
    for (const art of articles) {
      const content = art.querySelector(".content") as HTMLElement | null;
      if (!content) continue;
      const clone = content.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll(".sources, .related, .action-bar, script, style")
        .forEach((el) => el.remove());
      const text = clean(clone.textContent || "");
      if (!text || text.length < 40) continue;
      const link = ABS(
        art.querySelector(".action-bar .direct-link a")?.getAttribute("href") ||
          undefined,
      );
      picked.push({ section: "Top story", text, dateTitle, link });
    }
  }

  // Return at most 3 (your request)
  return picked.slice(0, 3);
}

async function fetchSectionHeadlines(): Promise<SectionHeadline[]> {
  const res = await fetch(PROXY + encodeURIComponent(NEWS_URL), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return extractSectionHeadlines(doc);
}

export const NewsProvider = ({ children }: { children: React.ReactNode }) => {
  const [headlines, setHeadlines] = useState<SectionHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchSectionHeadlines();
      setHeadlines(items);
      console.log("[News] Loaded sections:", items);
    } catch (e: any) {
      console.error("[News] Error:", e);
      setError(e?.message || "Failed to load news");
      setHeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <NewsContext.Provider value={{ headlines, loading, error, refresh: load }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
