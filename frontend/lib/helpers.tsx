import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function unescapeHTML(input: string) {
    return input.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export default function FormattedContent({ content }: { content: string }) {
    const unescaped = unescapeHTML(content);

    const emojiMatch = unescaped.match(/<emoji>([\s\S]*?)<\/emoji>/);
    const textMatch = unescaped.match(/<text>([\s\S]*?)<\/text>/);
    const answerMatch = unescaped.match(/<answer>([\s\S]*?)<\/answer>/);

    return (
        <div className="space-y-3">
            {emojiMatch && <div className="text-2xl">{emojiMatch[1]}</div>}
            {textMatch && <div className="text-lg font-semibold">{textMatch[1]}</div>}
            {answerMatch && <ReactMarkdown remarkPlugins={[remarkGfm]}>{answerMatch[1].replace(/\\n/g, "\n")}</ReactMarkdown>}
        </div>
    );
}
