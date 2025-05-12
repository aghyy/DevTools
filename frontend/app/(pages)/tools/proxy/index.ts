// Create a flat structure of all examples for a single dropdown
export type ExampleOption = {
  id: string;
  label: string;
  icon: string;
  code: string;
};

// JavaScript examples
const javascriptExamples = {
  fetch: `fetch("$PROXY_URL$$TARGET_URL$", {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`,

  axios: `import axios from 'axios';

axios.get("$PROXY_URL$$TARGET_URL$")
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,

  xhr: `const xhr = new XMLHttpRequest();
xhr.open('GET', "$PROXY_URL$$TARGET_URL$", true);
xhr.onload = function() {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};
xhr.onerror = function() {
  console.error('Request failed');
};
xhr.send();`,

  nodejs: `const https = require('https');

https.get("$PROXY_URL$$TARGET_URL$", (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(JSON.parse(data));
  });

}).on("error", (err) => {
  console.error("Error: " + err.message);
});`
};

// Python examples
const pythonExamples = {
  requests: `import requests

response = requests.get("$PROXY_URL$$TARGET_URL$")
data = response.json()
print(data)`
};

// Shell examples
const shellExamples = {
  curl: `curl "$PROXY_URL$$TARGET_URL$"`,

  wget: `wget -O - "$PROXY_URL$$TARGET_URL$"`
};

// Other language examples
const languageExamples = {
  php: {
    curl: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$PROXY_URL$$TARGET_URL$");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
?>`
  },

  java: {
    httpClient: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("$PROXY_URL$$TARGET_URL$"))
    .GET()
    .build();
    
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`
  },

  csharp: {
    httpClient: `using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using (HttpClient client = new HttpClient())
        {
            string response = await client.GetStringAsync("$PROXY_URL$$TARGET_URL$");
            Console.WriteLine(response);
        }
    }
}`
  }
};

// Combined flat list of examples
export const allExamples: ExampleOption[] = [
  // JavaScript examples
  {
    id: 'javascript-fetch',
    label: 'JavaScript (fetch)',
    icon: '/icons/languages/js.svg',
    code: javascriptExamples.fetch
  },
  {
    id: 'javascript-axios',
    label: 'JavaScript (axios)',
    icon: '/icons/languages/js.svg',
    code: javascriptExamples.axios
  },
  {
    id: 'javascript-xhr',
    label: 'JavaScript (XHR)',
    icon: '/icons/languages/js.svg',
    code: javascriptExamples.xhr
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    icon: '/icons/languages/nodejs.svg',
    code: javascriptExamples.nodejs
  },
  
  // Python examples
  {
    id: 'python-requests',
    label: 'Python (requests)',
    icon: '/icons/languages/python.svg',
    code: pythonExamples.requests
  },
  
  // Shell examples
  {
    id: 'curl',
    label: 'cURL',
    icon: '/icons/languages/terminal.svg',
    code: shellExamples.curl
  },
  {
    id: 'wget',
    label: 'wget',
    icon: '/icons/languages/terminal.svg',
    code: shellExamples.wget
  },
  
  // PHP
  {
    id: 'php-curl',
    label: 'PHP (curl)',
    icon: '/icons/languages/php.svg',
    code: languageExamples.php.curl
  },
  
  // Java
  {
    id: 'java-httpclient',
    label: 'Java',
    icon: '/icons/languages/java.svg',
    code: languageExamples.java.httpClient
  },
  
  // C#
  {
    id: 'csharp-httpclient',
    label: 'C#',
    icon: '/icons/languages/csharp.svg',
    code: languageExamples.csharp.httpClient
  },
]; 