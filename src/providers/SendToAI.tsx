async function sendToAI(userText: string): Promise<string> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: userText,
      // Optional: include short conversation state if you want
      // history: [...]
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "AI error");
  return j.reply || "Okay.";
}

export { sendToAI };
export default sendToAI;
