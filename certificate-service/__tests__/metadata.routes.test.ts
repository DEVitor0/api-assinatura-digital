import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, jest } from '@jest/globals';
import Metadata from '../src/models/Metadata';

jest.mock('../src/models/Metadata');
const mockedFindOne = Metadata.findOne as jest.MockedFunction<typeof Metadata.findOne>;

describe('🧪 Metadata Routes', () => {
  describe('POST /api/generate-metadata', () => {
    it('✅ Deve retornar metadados com hash, protocolo, urls e QR Code', async () => {
      const res = await request(app)
        .post('/api/generate-metadata')
        .send({ content: 'Conteúdo do certificado para teste' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hash');
      expect(res.body).toHaveProperty('protocol');
      expect(res.body).toHaveProperty('qrCodeDataUrl');
      expect(res.body).toHaveProperty('downloadUrl');
      expect(res.body).toHaveProperty('verificationUrl');
    });

    it('Deve retornar 400 se o content estiver ausente', async () => {
      const res = await request(app)
        .post('/api/generate-metadata')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Conteúdo do documento é obrigatório.'
      });
    });
  });

  describe('POST /api/certificates', () => {
    it('Deve retornar 400 se algum campo obrigatório estiver ausente', async () => {
      const res = await request(app)
        .post('/api/certificates')
        .send({});
    
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Campos obrigatórios: name, signers, filePath'
      });
    });
  });
});

describe('Public Routes', () => {
  describe('GET /api/public/certificates/:identifier', () => {
    it('deve retornar 404 se certificado não for encontrado', async () => {
      mockedFindOne.mockResolvedValue(null);

      const res = await request(app).get('/api/public/certificates/nao-existe');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Certificado não encontrado.' });
    });
  });
});