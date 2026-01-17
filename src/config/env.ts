export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  efi: {
    clientId: process.env.EFI_CLIENT_ID!,
    clientSecret: process.env.EFI_CLIENT_SECRET!,
    pixKey: process.env.EFI_PIX_KEY!,
    certPath: process.env.EFI_CERT_PATH!,
    certPassphrase: process.env.EFI_CERT_PASSPHRASE || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3333'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  rifa: {
    price: parseFloat(process.env.RIFA_PRICE || '5.00'),
    pixExpirationSeconds: parseInt(process.env.PIX_EXPIRATION_SECONDS || '300'),
  },
};
