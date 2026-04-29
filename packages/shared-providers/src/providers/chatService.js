export async function parseChatStream(
  response,
  onEvent
) {
  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) break;

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    const parts =
      buffer.split("\n");

    buffer = parts.pop();

    for (const part of parts) {
      let trimmed =
        part.trim();

      if (!trimmed) continue;

      if (
        trimmed.startsWith(
          "data:"
        )
      ) {
        trimmed = trimmed
          .replace(
            /^data:\s*/,
            ""
          )
          .trim();
      }

      if (
        trimmed ===
        "[DONE]"
      ) {
        onEvent({
          type: "done"
        });

        return;
      }

      try {
        const json =
          JSON.parse(
            trimmed
          );

        if (
          json.type ===
          "conversationId"
        ) {
          onEvent({
            type:
              "conversationId",
            value:
              json.value
          });

          continue;
        }

        if (
          json.type ===
          "text"
        ) {
          onEvent({
            type: "chunk",
            text:
              json.content
          });
        }

        if (
          json.type === "error"
        ) {
          onEvent({
            type: "error",
            message:
              json.message
          });

          continue;
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