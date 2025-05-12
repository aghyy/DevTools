const { checkMD5AgainstWordlist, checkSHA1AgainstWordlist, addToWordlistHelper } = require('../utils/toolHelper');
const db = require('../models');
const crypto = require('crypto');

// Function to generate a random short code
const generateShortCode = () => {
  return crypto.randomBytes(4).toString('hex');
};

// Create a shortened URL
const shortenUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // Generate a unique short code
    let shortCode;
    let existingUrl;
    
    do {
      shortCode = generateShortCode();
      existingUrl = await db.shortenedUrls.findOne({ where: { shortCode } });
    } while (existingUrl);

    // Create a new shortened URL entry
    const shortenedUrl = await db.shortenedUrls.create({
      originalUrl: url,
      shortCode
    });

    return res.status(201).json({ 
      shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/s/${shortCode}`
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Redirect to the original URL
const redirectToOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const shortenedUrl = await db.shortenedUrls.findOne({ 
      where: { shortCode } 
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL has expired
    if (shortenedUrl.expiresAt && new Date() > new Date(shortenedUrl.expiresAt)) {
      await shortenedUrl.destroy(); // Remove expired URL
      return res.status(404).json({ error: 'URL has expired' });
    }

    return res.json({ originalUrl: shortenedUrl.originalUrl });
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const useProxy = async (req, res) => {
  // Extract the URL from the query parameters
  const { url } = req.query;

  // Check if the URL is provided
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  // Validate URL format
  try {
    new URL(url); // This will throw if the URL is invalid
  } catch (err) {
    return res.status(400).json({ 
      error: "Invalid URL format", 
      details: "The provided URL is not valid. Please check the format and try again.",
      url: url 
    });
  }

  try {
    // Make a request to the provided URL
    console.log('[PROXY] Requesting URL:', url);
    
    // Set a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal 
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - the server took too long to respond');
      }
      throw err;
    });
    
    clearTimeout(timeoutId);
    
    console.log('[PROXY] Response status:', response.status);

    // Handle non-200 responses
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Target server returned ${response.status}`,
        details: `The requested URL returned a ${response.status} ${response.statusText} response`,
        status: response.status,
        statusText: response.statusText
      });
    }

    // Get content type from response
    const contentType = response.headers.get('Content-Type') || 'text/plain';
    res.setHeader('Content-Type', contentType);

    // For JSON responses, we don't need to manipulate the content
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      return res.json(jsonData);
    }

    // Extract the response body
    let body = await response.text();

    // If it's HTML content, perform some safety modifications
    if (contentType.includes('text/html')) {
      // Remove the <base> tag if present in the HTML content
      body = body.replace(/<base[^>]*>/gi, '');

      // Also remove any <meta> tags that could trigger redirection, like a meta-refresh tag
      body = body.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi, '');
    }

    // Send the proxied body back to the client
    return res.send(body);

  } catch (error) {
    // Log the error
    console.error('Error while making request to URL:', error);
    
    // Return appropriate error response with details
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ 
        error: 'Host not found',
        details: `Could not resolve the hostname in the URL: ${url}`,
        code: error.code
      });
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({ 
        error: 'Connection refused',
        details: `The server at ${url} actively refused the connection`,
        code: error.code
      });
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(400).json({ 
        error: 'Malformed URL or protocol not supported',
        details: error.message,
        url: url
      });
    } else if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Request timeout',
        details: 'The server took too long to respond'
      });
    }
    
    // Generic error for other cases
    return res.status(500).json({ 
      error: 'Proxy request failed',
      details: error.message
    });
  }
};

const decryptMD5 = async (req, res) => {
  // Extract hash from the query parameters
  const { hash } = req.query;

  // Check if the hash is provided
  if (!hash) {
    return res.status(400).json({ error: "Hash parameter is required" });
  }

  try {
    // Call the checkMD5AgainstWordlist function to check the hash
    const decryptedText = await checkMD5AgainstWordlist(hash);

    return res.json({ decryptedText: decryptedText });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while processing hash:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const decryptSHA1 = async (req, res) => {
  // Extract hash from the query parameters
  const { hash } = req.query;

  // Check if the hash is provided
  if (!hash) {
    return res.status(400).json({ error: "Hash parameter is required" });
  }

  try {
    // Call the checkSHA1AgainstWordlist function to check the hash
    const decryptedText = await checkSHA1AgainstWordlist(hash);

    return res.json({ decryptedText: decryptedText });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while processing hash:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addToWordlist = async (req, res) => {
  // Extract the word from the request body
  const { word } = req.body;

  // Check if the word is provided
  if (!word) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  try {
    // Call the addToWordlistHelper function to add the word to the wordlist
    await addToWordlistHelper(word);

    return res.json({ message: 'Word added to the wordlist' });

  } catch (error) {
    // Log the error and return a 500 status code if there's an issue
    console.error('Error while adding word to the wordlist:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { decryptMD5, decryptSHA1, addToWordlist, useProxy, shortenUrl, redirectToOriginalUrl };