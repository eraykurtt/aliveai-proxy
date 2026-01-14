const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'AliveAI Proxy' });
});

// Poz listesini çeken endpoint
app.get('/api/poses', async (req, res) => {
    try {
          const email = process.env.ALIVEAI_EMAIL;
          const password = process.env.ALIVEAI_PASSWORD;

          if (!email || !password) {
                  return res.status(500).json({ error: 'API credentials not configured' });
                }

          // AliveAI'dan pozları çek
          const response = await fetch('https://api.aliveai.app/api/v1/controlnet/list', {
                  method: 'GET',
                  headers: {
                            'Authorization': `Bearer ${email}:${password}`,
                            'Content-Type': 'application/json'
                                    }
                        });

          const data = await response.json();
          res.json(data);
        } catch (error) {
          console.error('Pose fetch error:', error);
          res.status(500).json({ error: error.message });
        }
  });

app.post('/api/aliveai', async (req, res) => {
  const { endpoint, method = 'GET', body, headers = {} } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`https://api.aliveai.app/${endpoint}`, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
