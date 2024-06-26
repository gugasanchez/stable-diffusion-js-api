"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageData, setImageData] = useState(null);
  const [ipfsUri, setIpfsUri] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    console.log("Generating image with prompt: ", prompt);
    try {
      const response = await axios.post("/api/generateImage", { prompt });
      setImageData(response.data.image);
      setIpfsUri(response.data.uri);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mt-8">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
          className="border border-gray-300 p-2 rounded"
        />
        <button
          onClick={handleGenerateImage}
          className="bg-blue-500 text-white p-2 rounded ml-2"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {imageData && (
        <div className="mt-8">
          <img src={`data:image/jpeg;base64,${imageData}`} alt="Generated" />
          <p>
            IPFS URI:{" "}
            <a href={ipfsUri} target="_blank" rel="noopener noreferrer">
              {ipfsUri}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
