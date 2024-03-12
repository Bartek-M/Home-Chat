# HTTPS Certificates 

Use **OpenSSL** library to generate **HTTPS** certificates.

Put them here as `cert.pem` and `key.pem`

## Commands
```bash
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```