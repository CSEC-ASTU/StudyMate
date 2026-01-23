export async function streamAnswer(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { question, filters } = req.body;

    const context = await retrieveContext({ question, filters });

    if (!context.length) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
    }

    for await (const token of generateAnswerStream({ question, context })) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
}
