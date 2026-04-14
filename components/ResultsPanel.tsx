import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"

marked.use({
  renderer: {
    codespan(token) {
      return `<code>${hljs.highlightAuto(token.text).value}</code>`;
    },
    code({ text, lang }) {
      const highlighted = lang && hljs.getLanguage(lang)
        ? hljs.highlight(text, { language: lang }).value
        : hljs.highlightAuto(text).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    },
  },
});



interface Props {
    result: string;
    isLoading: boolean;
  }
  
  export default function ResultsPanel({ result, isLoading }: Props) {
    if (!result && !isLoading) return null;
  
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 min-h-[200px]">
        {isLoading && !result && (
          <div className="flex items-center gap-3 text-[#555]">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#C0460A] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-[#C0460A] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-[#C0460A] rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            <span className="text-sm">Analysing your code...</span>
          </div>
        )}
  
        {result && (
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-medium
              prose-p:text-[#aaa] prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-medium
              prose-code:text-[#E8652A] prose-code:bg-[#1e0e04] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
              prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
              prose-li:text-[#aaa]
              prose-hr:border-white/10"
            dangerouslySetInnerHTML={{ __html: marked(result) }}
          />
        )}
      </div>
    );
  }