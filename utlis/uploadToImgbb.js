import axios from "axios";

export async function uploadToImgbb(fileBuffer, apiKey) {
    try {
        const base64Image = fileBuffer.toString("base64");

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            { image: base64Image }
        );

        return {
            success: true,
            url: response.data.data.url,
            display_url: response.data.data.display_url,
            delete_url: response.data.data.delete_url
        };

    } catch (err) {
        console.log("IMGBB ERROR:", err);
        return { success: false, error: err.message };
    }
}
