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
