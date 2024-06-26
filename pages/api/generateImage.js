const FormData = require('form-data');
const axios = require('axios');

const api_key = process.env.NEXT_PUBLIC_SEGMIND_API_KEY;
const JWT = process.env.NEXT_PUBLIC_PINATA_API_KEY;

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
        console.log('API response:', response.data);
        if (response.status === 200 && response.data.status === 'Success') {
            return response.data.image; // Retorna a string base64 da imagem
        } else {
            throw new Error('Failed to generate image');
        }
    } catch (error) {
        console.error('Error generating image:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function uploadToIPFS(base64Image) {
    const formData = new FormData();
    const buffer = Buffer.from(base64Image, 'base64');
    formData.append('file', buffer, 'image.png');

    const pinataMetadata = JSON.stringify({
        name: 'Generated Image',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(res.data);
        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to IPFS with Pinata:', error);
        throw error;
    }
}

function createJsonAndConvertToHex(prompt, ipfsUri) {
    const json = {
        prompt: prompt,
        uri: ipfsUri,
        timestamp: new Date().toISOString(),
        creator: "creator_identifier", // Substituir por um identificador real depois, quando estiver integrado com Particle
        parameters: {
            negative_prompt: "((close up)),(octane render, render, drawing, bad photo, bad photography:1.3), (worst quality, low quality, blurry:1.2), (bad teeth, deformed teeth, deformed lips), (bad anatomy, bad proportions:1.1), (deformed iris, deformed pupils), (deformed eyes, bad eyes), (deformed face, ugly face, bad face), (deformed hands, bad hands, fused fingers), morbid, mutilated, mutation, disfigured",
            samples: 1,
            scheduler: "DPM++ SDE",
            num_inference_steps: 7,
            guidance_scale: 1,
            seed: 1220429729,
            img_width: 1024,
            img_height: 1024
        },
        tool: {
            name: "Segmind API",
            version: "v1",
            model: "sdxl1.0-newreality-lightning"
        }
    };
    const jsonString = JSON.stringify(json);
    const hex = Buffer.from(jsonString).toString('hex');
    return { json, hex };
}

export default async function handler(req, res) {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const imageBase64 = await generateImage(prompt);
        const ipfsUri = await uploadToIPFS(imageBase64);
        const { json, hex } = createJsonAndConvertToHex(prompt, ipfsUri);
        res.status(200).json({ image: imageBase64, uri: ipfsUri, json, hex });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
