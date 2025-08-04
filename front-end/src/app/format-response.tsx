import React from "react";

export default function formatAgentResponse(text: string) {
  return text.split("\n").map((line, idx) => {
    const match = line.match(/\*\*(.*?)\*\*/);
    if (match) {
      const [_, boldText] = match;
      const rest = line.replace(/\*\*(.*?)\*\*/, "").trim();
      return (
        <div key={idx} className="mb-4">
          <div className="font-semibold pb-2">{boldText}</div>
          <div className="ml-4 text-sm text-gray-700 dark:text-gray-300">
            {rest}
          </div>
        </div>
      );
    }
    return (
      <p key={idx} className="mb-2">
        {line}
      </p>
    );
  });
}

// export default function ChatMessage() {
//   return <div className="p-4">{formatAgentResponse(agentResponse)}</div>;
// }
