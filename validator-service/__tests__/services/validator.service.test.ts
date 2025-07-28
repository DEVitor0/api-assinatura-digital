import { validarDocumentoPorCodigo } from '../../src/services/validator.service';
import * as certificateClient from '../../src/clients/certificateClient';
import * as documentClient from '../../src/clients/documentClient';
import * as hashUtils from '../../src/utils/hashUtils';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockedCertificateClient = jest.mocked(certificateClient);
const mockedDocumentClient = jest.mocked(documentClient);
const mockedHashUtils = jest.mocked(hashUtils);

jest.mock('../../src/clients/certificateClient');
jest.mock('../../src/clients/documentClient');
jest.mock('../../src/utils/hashUtils');

describe('validarDocumentoPorCodigo', () => {
  const mockCertificado = {
    hash: 'abc123',
    documentId: 'doc1',
  };

  const mockDocumento = {
    _id: 'doc1',
    path: '/fake/path.pdf',
    hash: 'abc123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna válido quando o hash bate', async () => {
    mockedCertificateClient.getCertificateByIdentifier.mockResolvedValue(mockCertificado as any);
    mockedDocumentClient.getDocumentById.mockResolvedValue(mockDocumento as any);
    mockedDocumentClient.downloadDocumentFile.mockResolvedValue(Buffer.from('fake-pdf-content'));
    mockedHashUtils.gerarHash.mockReturnValue('abc123');

    const resultado = await validarDocumentoPorCodigo('codigo123');

    expect(resultado.valido).toBe(true);
    expect(resultado.mensagem).toBe('Documento íntegro e válido.');
  });

  it('retorna inválido quando o hash não bate', async () => {
    mockedCertificateClient.getCertificateByIdentifier.mockResolvedValue(mockCertificado as any);
    mockedDocumentClient.getDocumentById.mockResolvedValue(mockDocumento as any);
    mockedDocumentClient.downloadDocumentFile.mockResolvedValue(Buffer.from('conteudo-modificado'));
    mockedHashUtils.gerarHash.mockReturnValue('diferente123');

    const resultado = await validarDocumentoPorCodigo('codigo123');

    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toBe('Documento corrompido ou alterado.');
    expect(resultado.hashOriginal).toBe('abc123');
    expect(resultado.hashCalculado).toBe('diferente123');
  });

  it('retorna erro quando certificado não é encontrado', async () => {
    mockedCertificateClient.getCertificateByIdentifier.mockResolvedValue(null);

    const resultado = await validarDocumentoPorCodigo('codigo-invalido');

    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toBe('Certificado não encontrado.');
  });
});
