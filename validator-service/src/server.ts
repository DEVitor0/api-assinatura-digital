import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import app from './app';

const PORT = process.env.PORT || 5006;

const swaggerFilePath = path.join(__dirname, 'swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));

app.use('/api/validator/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Validator-service rodando na porta ${PORT}`);
  console.log(`Swagger UI disponível em http://localhost:${PORT}/api/validator/docs`);
});
