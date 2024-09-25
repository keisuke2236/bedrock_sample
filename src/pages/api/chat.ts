import { NextApiRequest, NextApiResponse } from 'next';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const params = {
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    };

    try {
      const command = new InvokeModelCommand(params);
      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      if (responseBody.error) {
        throw new Error(responseBody.error.message || 'Unknown error occurred');
      }
      
      res.status(200).json({ response: responseBody.content[0].text });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
