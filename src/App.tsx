import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFFile } from './types';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  List,
  ListItem,
  HStack,
  useToast,
  Container,
} from '@chakra-ui/react';

const API_URL = 'http://localhost:5000';

function App() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error fetching files',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: 'File uploaded',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error uploading file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`${API_URL}/${filename}`);
      fetchFiles();
      toast({
        title: 'File deleted',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error deleting file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExtract = async (filename: string) => {
    try {
      const response = await axios.get(`${API_URL}/extract/${filename}`);
      toast({
        title: 'Data extracted',
        description: JSON.stringify(response.data, null, 2),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error extracting data:', error);
      toast({
        title: 'Error extracting data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider>
      <Container maxW="xl" centerContent>
        <VStack spacing={8} width="100%" py={10}>
          <Heading>Sheet Manager</Heading>
          <Box as="form" onSubmit={handleUpload} width="100%">
            <VStack spacing={4}>
              <Input type="file" onChange={handleFileChange} accept=".pdf" />
              <Button type="submit" colorScheme="blue" width="100%">Upload</Button>
            </VStack>
          </Box>
          <VStack width="100%" align="stretch">
            <Heading size="md">Uploaded Files:</Heading>
            <List spacing={3}>
              {files.map((file) => (
                <ListItem key={file.name} borderWidth={1} p={4} borderRadius="md">
                  <HStack justify="space-between">
                    <Text>{file.name}</Text>
                    <HStack>
                      <Button onClick={() => handleDelete(file.name)} colorScheme="red" size="sm">Delete</Button>
                      <Button as="a" href={`${API_URL}/uploads/${file.name}`} target="_blank" rel="noopener noreferrer" colorScheme="green" size="sm">View</Button>
                      <Button onClick={() => handleExtract(file.name)} colorScheme="purple" size="sm">Extract Data</Button>
                    </HStack>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </VStack>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;