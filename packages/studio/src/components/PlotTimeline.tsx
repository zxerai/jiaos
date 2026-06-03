import { useState } from "react";

interface TimelineChapter {
  readonly number: number;
  readonly title: string;
  readonly characters: string;
  readonly events: string;
  readonly states: string;
  readonly hooks: string;
  readonly mood: string;
  readonly type: string;
}

interface PlotTimelineProps {
  readonly chapters: ReadonlyArray<TimelineChapter>;
}

const TYPE_COLORS: Record<string, string> = {
  开篇羞辱章: "#e74c3c",
  能力觉醒与建立悬疑章: "#e67e22",
  情报铺垫与局势定锚章: "#f1c40f",
  试探暴露与博弈升级章: "#e74c3c",
  博弈与信息交换章: "#3498db",
  纯潜行探查与信息确认章: "#2c3e50",
  勘察与博弈章: "#9b59b6",
  决策执行与冲突升级混合章: "#e74c3c",
  沉默取证章: "#2ecc71",
  日常与情报交换章: "#1abc9c",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || "#95a5a6";
}

function getMoodEmoji(mood: string): string {
  if (mood.includes("压抑") || mood.includes("冰寒")) return "❄️";
  if (mood.includes("紧绷") || mood.includes("高压")) return "⚡";
  if (mood.includes("警觉") || mood.includes("紧张")) return "👀";
  if (mood.includes("平静") || mood.includes("沉静") || mood.includes("沉默"))
    return "🌊";
  if (mood.includes("专注") || mood.includes("冷峻")) return "🔍";
  if (mood.includes("暗流")) return "🌊";
  if (mood.includes("兴奋") || mood.includes("满足")) return "✨";
  return "📖";
}

export function PlotTimeline({ chapters }: PlotTimelineProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground text-sm">
        暂无章节时间线
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="text-center py-2">
        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          剧情时间线
        </span>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />

        {chapters.map((ch) => {
          const isExpanded = expanded === ch.number;
          const color = getTypeColor(ch.type);
          const emoji = getMoodEmoji(ch.mood);

          return (
            <div key={ch.number} className="relative mb-2">
              <div
                className="absolute -left-6 top-3 w-3 h-3 rounded-full border-2 cursor-pointer transition-all"
                style={{
                  borderColor: color,
                  backgroundColor: isExpanded ? color : "transparent",
                }}
                onClick={() => setExpanded(isExpanded ? null : ch.number)}
              />

              <div
                className="rounded-lg border p-2.5 cursor-pointer transition-all hover:bg-secondary/30"
                onClick={() => setExpanded(isExpanded ? null : ch.number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      Ch{ch.number}
                    </span>
                    <span className="font-medium text-sm truncate">
                      {emoji} {ch.title || `第${ch.number}章`}
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {ch.type || "章节"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground italic truncate">
                    {ch.mood || "—"}
                  </span>
                </div>

                {ch.characters && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ch.characters
                      .split(/[,、]/)
                      .slice(0, 5)
                      .map((name, i) => {
                        const clean = name
                          .replace(/[（(][^)）]*[)）]/g, "")
                          .trim();
                        if (!clean || clean.length < 2) return null;
                        return (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {clean}
                          </span>
                        );
                      })}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div
                  className="ml-4 mt-1.5 pl-3 border-l-2 space-y-1.5"
                  style={{ borderColor: `${color}33` }}
                >
                  {ch.events && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        关键事件
                      </div>
                      <div className="text-xs text-foreground leading-relaxed">
                        {ch.events}
                      </div>
                    </div>
                  )}
                  {ch.states && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        状态变化
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ch.states}
                      </div>
                    </div>
                  )}
                  {ch.hooks && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        伏笔
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ch.hooks}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
