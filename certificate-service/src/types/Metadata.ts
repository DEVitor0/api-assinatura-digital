export interface Signatario {
  nome: string;
  email: string;
  dataAssinatura: string;
}

export interface GenerateMetadataInput {
  titulo: string;
  conteudo: string;
  signatarios: Signatario[];
}

export interface CertificateMetadata {
  name: string;
  hash: string;
  filePath: string;
  signers: string[];
  url: string;
  generatedAt: Date;
}
