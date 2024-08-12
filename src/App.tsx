import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFFile } from './types';

const API_URL = 'http://localhost:5000';

function App() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file');
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`${API_URL}/${filename}`);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleExtract = async (filename: string) => {
    try {
      const response = await axios.get(`${API_URL}/extract/${filename}`);
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('Error extracting data');
    }
  };

  return (
    <div className="App">
      <h1>PDF Manager</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} accept=".pdf" />
        <button type="submit">Upload</button>
      </form>
      <h2>Uploaded Files:</h2>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.name}
            <button onClick={() => handleDelete(file.name)}>Delete</button>
            <a href={`${API_URL}/uploads/${file.name}`} target="_blank" rel="noopener noreferrer">View</a>
            <button onClick={() => handleExtract(file.name)}>Extract Data</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;