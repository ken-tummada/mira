import { connect } from "livekit-client";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const wsUrl = process.env.LIVEKIT_URL;
const token = process.env.LIVEKIT_API_TOKEN; // you can generate one manually for testing

const room = await connect(wsUrl, token);
console.log("🤖 Agent connected to LiveKit");

room.on("dataReceived", async (payload, participant) => {
  const text = new TextDecoder().decode(payload);
  console.log(`[${participant.identity}]:`, text);

  try {
    const data = JSON.parse(text);
    if (data.kind === "labels") {
      const description = await client.responses.create({
        model: "gpt-4o-mini",
        input: `Describe what you see based on: ${data.labels.join(", ")}.`,
      });
      const message = description.output_text;
      console.log("AI:", message);

      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ reply: message })),
      );
    }
  } catch (e) {
    console.warn("⚠️ parse error:", e);
  }
});
