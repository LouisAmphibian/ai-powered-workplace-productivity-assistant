import { ShieldAlert } from "lucide-react";

export function ResponsibleBanner({ position = "top" }: { position?: "top" | "bottom" }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 ${
        position === "top" ? "mb-4" : "mt-4"
      }`}
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Responsible AI Notice:</span> AI-generated outputs can contain errors.
        Please review, edit, and verify all facts before sending or publishing.
      </p>
    </div>
  );
}

const FLAG_PATTERNS = [
  /\[.*?\]/g, // [placeholder]
  /\bTBD\b/gi,
  /\bTODO\b/gi,
  /\bguarantee(d|s)?\b/gi,
  /\balways\b/gi,
  /\bnever\b/gi,
  /\beveryone\b/gi,
  /\bno one\b/gi,
  /\bdefinitely\b/gi,
  /\b100%\b/gi,
  /\bXX+\b/g,
  /\b\d{4,}\b/g, // large unverified numbers
];

export function FactCheckText({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled) return <>{text}</>;
  const marks: Array<{ start: number; end: number }> = [];
  for (const re of FLAG_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      marks.push({ start: m.index, end: m.index + m[0].length });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  if (marks.length === 0) return <>{text}</>;
  marks.sort((a, b) => a.start - b.start);
  // merge overlaps
  const merged: typeof marks = [];
  for (const m of marks) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) last.end = Math.max(last.end, m.end);
    else merged.push({ ...m });
  }
  const parts: ReactNodeArr = [];
  let cursor = 0;
  merged.forEach((m, i) => {
    if (m.start > cursor) parts.push(text.slice(cursor, m.start));
    parts.push(
      <mark
        key={i}
        className="rounded bg-yellow-200 px-0.5 text-yellow-900 dark:bg-yellow-400/40 dark:text-yellow-100"
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    cursor = m.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

type ReactNodeArr = Array<string | JSX.Element>;
