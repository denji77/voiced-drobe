//Serverless function entry point for Vercel
import app from './index.js';

export default async (req, res) => {
  //Mark that we're running in Vercel environment
  process.env.VERCEL = '1';
  
  //Forward the request to our Express app
  return new Promise((resolve, reject) => {
    try {
      app(req, res);
      //Wait for the response to be sent
      res.on('finish', resolve);
    } catch (error) {
      console.error('Error in serverless function:', error);
      res.status(500).json({ message: 'Internal server error' });
      resolve();
    }
  });
}; 