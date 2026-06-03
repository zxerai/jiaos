import { useEffect, useState } from "react";
import { fetchJson } from "../../hooks/use-api";
import { SidebarCard } from "./SidebarCard";
import { PlotTimeline } from "../PlotTimeline";

interface TimelineData {
  readonly chapters: ReadonlyArray<{
    readonly number: number;
    readonly title: string;
    readonly characters: string;
    readonly events: string;
    readonly states: string;
    readonly hooks: string;
    readonly mood: string;
    readonly type: string;
  }>;
}

interface TimelineSectionProps {
  readonly bookId: string;
}

export function TimelineSection({ bookId }: TimelineSectionProps) {
  const [chapters, setChapters] = useState<TimelineData["chapters"]>([]);

  useEffect(() => {
    fetchJson<TimelineData>(`/books/${bookId}/timeline`)
      .then((data) => setChapters(data.chapters || []))
      .catch(() => setChapters([]));
  }, [bookId]);

  if (chapters.length === 0) return null;

  return (
    <SidebarCard title="剧情时间线">
      <div className="w-full max-h-[500px] overflow-y-auto">
        <PlotTimeline chapters={chapters} />
      </div>
    </SidebarCard>
  );
}
