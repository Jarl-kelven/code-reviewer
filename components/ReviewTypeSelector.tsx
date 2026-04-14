type ReviewType = "all" | "bugs" | "performance" | "security";

const types: { value: ReviewType; label: string; desc: string }[] = [
  { value: "all",         label: "Full review",   desc: "Bugs, perf & security" },
  { value: "bugs",        label: "Bugs",          desc: "Logic & runtime errors" },
  { value: "performance", label: "Performance",   desc: "Speed & efficiency"     },
  { value: "security",    label: "Security",      desc: "Vulnerabilities & risks" },
];

interface Props {
  selected: ReviewType;
  onChange: (value: ReviewType) => void;
}

export default function ReviewTypeSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {types.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
            selected === t.value
              ? "bg-[#1e0e04] border-[#C0460A] text-white"
              : "bg-[#1a1a1a] border-white/10 text-[#aaa] hover:border-white/20 hover:text-white"
          }`}
        >
          <p className={`text-sm font-medium mb-0.5 ${selected === t.value ? "text-[#E8652A]" : ""}`}>
            {t.label}
          </p>
          <p className="text-xs text-[#666] leading-snug">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}