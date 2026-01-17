import fs from 'fs';
import https from 'https';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { EfiTokenResponse, EfiPixResponse } from '../types';

class EfiPayService {
  private agent: https.Agent;
  private axiosInstance: AxiosInstance;

  constructor() {
    const certificado = fs.readFileSync(config.efi.certPath);
    
    this.agent = new https.Agent({
      pfx: certificado,
      passphrase: config.efi.certPassphrase,
    });

    this.axiosInstance = axios.create({
      httpsAgent: this.agent,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccessToken(): Promise<string> {
    const credentials = `${config.efi.clientId}:${config.efi.clientSecret}`;
    const auth = Buffer.from(credentials).toString('base64');

    const response = await this.axiosInstance.post<EfiTokenResponse>(
      'https://pix.api.efipay.com.br/oauth/token',
      { grant_type: 'client_credentials' },
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  }

  async createPixCharge(
    cpf: string,
    fullName: string,
    amount: number,
    txid: string
  ): Promise<EfiPixResponse> {
    const accessToken = await this.getAccessToken();

    const response = await this.axiosInstance.put<EfiPixResponse>(
      `https://pix.api.efipay.com.br/v2/cob/${txid}`,
      {
        calendario: {
          expiracao: config.rifa.pixExpirationSeconds,
        },
        devedor: {
          cpf,
          nome: fullName,
        },
        valor: {
          original: amount.toFixed(2),
        },
        chave: config.efi.pixKey,
        solicitacaoPagador: 'Pagamento de rifa',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  async getPixCharge(txid: string): Promise<EfiPixResponse> {
    const accessToken = await this.getAccessToken();

    const response = await this.axiosInstance.get<EfiPixResponse>(
      `https://pix.api.efipay.com.br/v2/cob/${txid}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  async getQRCode(locId: number): Promise<string> {
    const accessToken = await this.getAccessToken();

    const response = await this.axiosInstance.get<{ imagemQrcode: string }>(
      `https://pix.api.efipay.com.br/v2/loc/${locId}/qrcode`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.imagemQrcode;
  }
}

export const efiPayService = new EfiPayService();
