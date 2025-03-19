require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const response = await axios.post(
        'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        {
          model: 'deepseek-r1-250120',
          messages: data.messages,
          stream: true,
          temperature: 0.6
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`
          },
          timeout: 60000,
          responseType: 'stream'
        }
      );

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.includes('data: ')) {
            const data = line.replace('data: ', '');
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].delta.content;
                if (content) {
                  ws.send(JSON.stringify({ type: 'content', content }));
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      });

      response.data.on('end', () => {
        ws.send(JSON.stringify({ type: 'done' }));
      });

    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: '请求失败，请稍后重试'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8006;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});