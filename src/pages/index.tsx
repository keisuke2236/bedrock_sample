import { useState } from 'react';

const models = [
  { id: "anthropic.claude-3-haiku-20240307-v1:0", name: "Claude 3 Haiku" },
  { id: "anthropic.claude-3-sonnet-20240229-v1:0", name: "Claude 3 Sonnet" },
  { id: "anthropic.claude-v2:1", name: "Claude v2" },
];

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('message', message);
    formData.append('modelId', selectedModel);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Amazon Bedrock Chat</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力してください"
          rows={4}
        />
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? '送信中...' : '送信'}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">応答:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
