import { useState, useRef } from 'react';

const models = [
  { id: "anthropic.claude-v2:1", name: "Claude v2.1", provider: "anthropic" },
  { id: "anthropic.claude-3-haiku-20240307-v1:0", name: "Claude 3 Haiku", provider: "anthropic" },
  { id: "anthropic.claude-3-5-sonnet-20240620-v1:0", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "anthropic.claude-instant-v1", name: "Claude Instant", provider: "anthropic" },
  { id: "amazon.titan-text-express-v1", name: "Titan Text Express", provider: "amazon" },
];

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileClear = () => {
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold text-center text-gray-800">職務経歴書分析</h1>
          <div className='mb-6 text-center text-gray-600'>Amazon Bedrock Chat</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">モデル選択</label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">メッセージ</label>
              <textarea
                id="message"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力してください"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="files" className="block text-sm font-medium text-gray-700">ファイル添付</label>
              <input
                id="files"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{selectedFiles.length} ファイル選択済み</p>
                  <button
                    type="button"
                    onClick={handleFileClear}
                    className="mt-1 text-sm text-red-600 hover:text-red-800"
                  >
                    クリア
                  </button>
                </div>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {isLoading ? '送信中...' : '送信'}
              </button>
            </div>
          </form>
          {response && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">応答:</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
