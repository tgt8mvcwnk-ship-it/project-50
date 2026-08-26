export async function onRequestPost(context) {
  try {
    const { goal, deadline, skills, location } =
      await context.request.json();

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization":
            `Bearer ${context.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "gpt-5.4-mini",

          input: [
            {
              role: "system",
              content:
                "You are the AI engine for PROJECT 50. " +
                "Create realistic, practical and personalized ways " +
                "for the user to make extra money. " +
                "Use the user's location when recommending local opportunities. " +
                "Prioritize opportunities that match their existing skills and resources. " +
                "Give 3-5 prioritized actions with realistic earning ranges, " +
                "time needed, why each option fits, and the first concrete step. " +
                "Do not guarantee earnings. Keep the answer concise and useful."
            },

            {
              role: "user",
              content:
                `Income goal: $${goal}\n` +
                `Deadline: ${deadline} day(s)\n` +
                `Location: ${location || "Not provided"}\n` +
                `Skills/resources: ${skills || "Not provided"}`
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "OpenAI request failed"
        },
        { status: response.status }
      );
    }

    const plan =
      data.output
        ?.flatMap(item => item.content || [])
        ?.find(item => item.type === "output_text")
        ?.text ||
      "No plan was generated.";

    return Response.json({ plan });

  } catch (error) {

    return Response.json(
      {
        error:
          error.message ||
          "Server error"
      },
      { status: 500 }
    );
  }
}
