export async function sendChatMessage(
  text,
  token,
  onEvent
) {

  const response = await fetch(
    process.env.NEXT_PUBLIC_CONNECTOR_URL + "chat",
    {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            argusToken: token,
            messages: [
                {
                role: "user",
                content: text
                }
            ]
        })
    }
    );

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, {
        stream: true
    });

    console.log("RAW:", chunk);

    buffer += chunk;

    const parts = buffer.split("\n");

    buffer = parts.pop();

    for (const part of parts) {
        let trimmed = part.trim();

        if (!trimmed) continue;

        if (trimmed.startsWith("data:")) {
            trimmed = trimmed
            .replace(/^data:\s*/, "")
            .trim();
        }

        if (trimmed === "[DONE]") {
            onEvent({ type: "done" });
            return;
        }

        try {
            const json = JSON.parse(trimmed);

            if (json.type === "text") {
            onEvent({
                type: "chunk",
                text: json.content
            });
            }
        } catch (e) {
            console.log(
            "Cannot parse:",
            trimmed
            );
        }
    }
  }

  onEvent({
    type: "done"
  });
}