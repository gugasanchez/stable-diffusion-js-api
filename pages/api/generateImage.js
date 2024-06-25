const axios = require('axios');

const api_key = process.env.NEXT_PUBLIC_SEGMIND_API_KEY;
const url = "https://api.segmind.com/v1/sdxl1.0-newreality-lightning";

async function generateImage(prompt) {
    const data = {
        "prompt": prompt,
        "negative_prompt": "((close up)),(octane render, render, drawing, bad photo, bad photography:1.3), (worst quality, low quality, blurry:1.2), (bad teeth, deformed teeth, deformed lips), (bad anatomy, bad proportions:1.1), (deformed iris, deformed pupils), (deformed eyes, bad eyes), (deformed face, ugly face, bad face), (deformed hands, bad hands, fused fingers), morbid, mutilated, mutation, disfigured",
        "samples": 1,
        "scheduler": "DPM++ SDE",
        "num_inference_steps": 7,
        "guidance_scale": 1,
        "seed": 1220429729,
        "img_width": 1024,
        "img_height": 1024,
        "base64": true
    };

    try {
        const response = await axios.post(url, data, { headers: { 'x-api-key': api_key } });
        console.log('API response:', response.data); // Adiciona mais logs
        if (response.status === 200 && response.data.status === 'Success') {
            return response.data.image; // Retorna a string base64 da imagem
        } else {
            throw new Error('Failed to generate image');
        }
    } catch (error) {
        console.error('Error generating image:', error.response ? error.response.data : error.message);
        throw error; // Re-lança o erro para ser tratado pelo chamador
    }
}

export default async function handler(req, res) {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const imageBase64 = await generateImage(prompt);
        res.status(200).json({ image: imageBase64 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
