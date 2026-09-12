export default async function handler(request, response) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(200).end();
  }

  // CORS on every response
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = request.body;

    if (!messages) {
      return response.status(400).json({ error: 'Messages are required' });
    }

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: false
      })
    });

    const data = await deepseekResponse.json();

    if (!deepseekResponse.ok) {
      return response.status(deepseekResponse.status).json({
        error: data.error?.message || 'DeepSeek API error',
        details: data
      });
    }

    return response.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({ error: error.message });
  }
}
