import Replicate from 'replicate';

export default async function handler(req, res) {
    const { prompt } = req.body;

    const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
    });

    const input = {
        prompt: prompt,
        width: 1024,
        height: 1024
    };

    try {
        const output = await replicate.run(
            "ai-forever/kandinsky-2.2:ad9d7879fbffa2874e1d909d1d37d9bc682889cc65b31f7bb00d2362619f194a",
            { input }
        );
        res.status(200).json({ imageUrl: output[0] });
    } catch (error) {
        console.error("Failed to generate image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
}
