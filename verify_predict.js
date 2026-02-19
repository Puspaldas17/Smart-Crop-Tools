import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function run() {
  const form = new FormData();
  form.append('image', fs.createReadStream('test_image.txt'));

  try {
    const res = await fetch('http://localhost:8080/api/predict', {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
      console.error('Request failed:', res.status, res.statusText);
      const text = await res.text();
      console.error('Body:', text);
      return;
    }

    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.predictions && data.predictions.length > 0) {
      console.log('SUCCESS: Predictions returned!');
    } else {
      console.error('FAILURE: No predictions returned.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
