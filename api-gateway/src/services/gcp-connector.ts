import { google } from 'googleapis';

const projectId = process.env.GCP_PROJECT_ID;
const keyFile = process.env.GCP_KEY_FILE;

const gcpClient = new google.auth.GoogleAuth({
  projectId,
  keyFile,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

export const getGCPClient = async () => {
  return await gcpClient.getClient();
};

export const listGCPResources = async () => {
  const client = await getGCPClient();
  const compute = google.compute({ version: 'v1', auth: client });
  
  const res = await compute.instances.aggregatedList({ project: projectId });
  return res.data;
};

// Additional functions to interact with other GCP services can be added here.