import { NextApiRequest, NextApiResponse } from 'next';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import formidable from 'formidable';
import fs from 'fs/promises';

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
  if (req.method === 'POST') {
    const form = formidable({ multiples: true });
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'ファイルのアップロードに失敗しました。' });
      }

      const message = fields.message?.[0] as string;
      const modelId = fields.modelId?.[0] as string;
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

      const params = {
        modelId: modelId,
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

      try {
        const command = new InvokeModelCommand(params);
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        if (responseBody.error) {
          throw new Error(responseBody.error.message || '不明なエラーが発生しました');
        }
        
        res.status(200).json({ response: responseBody.content[0].text });
      } catch (error) {
        console.error('エラー:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : '不明なエラーが発生しました。' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `メソッド ${req.method} は許可されていません` });
  }
}
