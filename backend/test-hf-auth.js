require('dotenv').config();
const axios = require('axios');

async function test() {
    const hfApiKey = process.env.HF_API_KEY;
    console.log("Key starting with:", hfApiKey ? hfApiKey.substring(0, 5) : "missing");
    try {
        const response = await axios.post(
            'https://router.huggingface.co/v1/chat/completions',
            {
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${hfApiKey}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        console.log("Success:", JSON.stringify(response.data.choices[0], null, 2));
    } catch (error) {
        console.log("Error status:", error.response?.status);
        console.log("Error data:", JSON.stringify(error.response?.data, null, 2));
        console.log("Error message:", error.message);
    }
}
test();
