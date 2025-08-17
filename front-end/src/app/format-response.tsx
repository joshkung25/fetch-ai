import React from "react";

export default function formatAgentResponse(text: string) {
  return text.split("\n").map((line, idx) => {
    const headingMatch = line.match(/^#+\s+(.*)$/);
    if (headingMatch) {
      const [_, headingText] = headingMatch;
      return (
        <h1 key={idx} className="text-xl font-bold mb-4 mt-4">
          {headingText}
        </h1>
      );
    }

    // Check if line contains bold text
    if (line.includes("**")) {
      // Split the line by bold markers and render each part appropriately
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={idx} className="mb-2 mt-2">
          {parts.map((part, partIdx) => {
            const boldMatch = part.match(/\*\*(.*?)\*\*/);
            if (boldMatch) {
              // This part is bold text
              return (
                <span key={partIdx} className="font-semibold">
                  {boldMatch[1]}
                </span>
              );
            } else {
              // This part is regular text
              return <span key={partIdx}>{part}</span>;
            }
          })}
        </div>
      );
    }

    return <p key={idx}>{line}</p>;
  });
}

// export default function ChatMessage() {
//   return <div className="p-4">{formatAgentResponse(agentResponse)}</div>;
// }
