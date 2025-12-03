import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'your-project-id';
const KEY_FILE = process.env.GCP_KEY_FILE || 'path/to/your/keyfile.json';
const REGION = process.env.GCP_REGION || 'us-central1';

const auth = new GoogleAuth({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE,
});

export { PROJECT_ID, KEY_FILE, REGION, auth };