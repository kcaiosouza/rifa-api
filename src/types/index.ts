export interface CreatePaymentRequest {
  fullName: string;
  cpf: string;
  phone: string;
  numbers: number[];
}

export interface EfiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface EfiPixResponse {
  calendario: {
    criacao: string;
    expiracao: number;
  };
  txid: string;
  revisao: number;
  loc: {
    id: number;
    location: string;
    tipoCob: string;
  };
  location: string;
  status: string;
  devedor: {
    cpf: string;
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador: string;
  pixCopiaECola?: string;
  qrcode?: string;
}

export interface WebhookPayload {
  pix: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    infoPagador?: string;
  }>;
}
