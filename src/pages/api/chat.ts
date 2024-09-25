import { NextApiRequest, NextApiResponse } from 'next';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import formidable from 'formidable';
import fs from 'fs/promises';

const models = [
  { id: "anthropic.claude-v2:1", name: "Claude v2.1", provider: "anthropic" },
  { id: "anthropic.claude-3-haiku-20240307-v1:0", name: "Claude 3 Haiku", provider: "anthropic" },
  { id: "anthropic.claude-3-5-sonnet-20240620-v1:0", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "anthropic.claude-instant-v1", name: "Claude Instant", provider: "anthropic" },
  { id: "amazon.titan-text-express-v1", name: "Titan Text Express", provider: "amazon" },
];

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = formidable({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to upload files.' });
    }

    const message = fields.message?.[0] as string;
    const modelId = fields.modelId?.[0] as string;
    const model = models.find(m => m.id === modelId);

    if (!model) {
      return res.status(400).json({ error: 'Invalid model selected.' });
    }

    let fileContents: { type: string; source: { type: string; media_type: string; data: string } }[] = [];

    if (files.files) {
      const fileArray = Array.isArray(files.files) ? files.files : [files.files];
      for (const file of fileArray) {
        const fileBuffer = await fs.readFile(file.filepath);
        const base64Content = fileBuffer.toString('base64');
        const mediaType = file.mimetype || 'application/octet-stream';
        fileContents.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64Content }
        });
      }
    }

    let params;
    switch (model.provider) {
      case 'anthropic':
        params = {
          modelId: model.id,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: message },
                  ...fileContents
                ]
              }
            ],
            temperature: 0.7,
          }),
        };
        break;
      case 'amazon':
        params = {
          modelId: model.id,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            inputText: message,
            textGenerationConfig: {
              maxTokenCount: 1000,
              temperature: 0.7,
              topP: 1,
            }
          }),
        };
        break;
      default:
        return res.status(400).json({ error: 'Unsupported model provider.' });
    }

    try {
      const command = new InvokeModelCommand(params);
      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      let responseText;
      switch (model.provider) {
        case 'anthropic':
          responseText = responseBody.content[0].text;
          break;
        case 'amazon':
          responseText = responseBody.results[0].outputText;
          break;
        default:
          throw new Error('Unsupported model provider.');
      }
      
      return res.status(200).json({ response: responseText });
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
      return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
  });
}
