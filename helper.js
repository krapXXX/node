import * as crypto from 'node:crypto';
import settings from './appsettings.js';
import Base64 from './base_64.js';

const time = () => new Date().toTimeString().substring(0, 8)
function delay(timeout, isOk = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            isOk ? resolve() : reject()
        }, timeout)
    })
}

function getAllowedContentType(path) {
 let dotIndex = path.lastIndexOf('.')
        if (dotIndex ==-1) {
            return null;
        }

            const ext = path.substring(dotIndex+1);
            console.log(ext);
            let contentType = null;
          switch (ext) {
  case 'html': contentType = "text/html; charset=utf-8"; break;
  case 'css':  contentType = "text/css; charset=utf-8"; break;
  case 'js':   contentType = "text/javascript; charset=utf-8"; break;
  case 'txt':  contentType = "text/plain; charset=utf-8"; break;

  case 'bmp':  contentType = "image/bmp"; break;
  case 'gif':  contentType = "image/gif"; break;
  case 'png':  contentType = "image/png"; break;
  case 'webp': contentType = "image/webp"; break;
  case 'jpg':
  case 'jpeg': contentType = "image/jpeg"; break;

  case 'pdf':  contentType = "application/pdf"; break;

  // ✅ нові типи
  case 'mp3':  contentType = "audio/mpeg"; break;
  case 'ogg':  contentType = "audio/ogg"; break;
  case 'wav':  contentType = "audio/wav"; break;

  case 'mp4':  contentType = "video/mp4"; break;
  case 'webm': contentType = "video/webm"; break;
}

            return contentType;
}
 
 function getSignature(data, secret) {
    if (typeof secret == 'undefined') {
      secret = settings.jwtSecret;
    }
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

   function getToken(request) {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        return "Missing or empty 'Authorization' header";
      }
  
      const scheme = "Bearer ";
      if (!authHeader.startsWith(scheme)) {
        return `Invalid Authorization scheme: ${scheme} required`;
      }
  
      const jwt = authHeader.substring(scheme.length);
      // Валідуємо токен дотримуючись алгоритму зі стандарту
      // https://datatracker.ietf.org/doc/html/rfc7519#section-7.2
      const parts = jwt.split('.');
      if (parts.length < 3) {
        return "Invalid token: signed JWT expected";
      }
      let jwtHeader;
      try {
        jwtHeader = JSON.parse(Base64.decodeUrl(parts[0]));
      }
      catch (err) {
        return "Invalid token header: Base64Url encoded JSON expected. " + err;
      }
      if (typeof jwtHeader.typ == 'undefined') {
        return "Missing token type (header.typ)";
      }
      if (jwtHeader.typ != 'JWT') {
        return "Unsupported token type: JWT only";
      }
  
      if (typeof jwtHeader.alg === 'undefined') {
        return `Missing token algorithm (header.alg)`;
      }
  
      if (jwtHeader.alg !== "HS256") {
        return "Unsupported token algorithm: 'HS256' only";
      }
  
      // Перевіряємо підпис: генеруємо підпис для одержаного тіла 
      // та порівнюємо з підписом, що міститься у токені.
      const jwtBody = parts[0] + "." + parts[1];
      if (this.getSignature(jwtBody) != parts[2]) {
        return "Signature error";
      }
      try {
        jwtHeader = JSON.parse(Base64.decodeUrl(parts[1]));
      }
      catch (err) {
        return "Invalid token payload: Base64Url encoded JSON expected. " + err;
      }
      const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "undefined" && now >= payload.exp) {
    return "Token expired";
  }

  if (typeof payload.nbf !== "undefined" && now < payload.nbf) {
    return "Token not yet active";
  }

  return { valid: true, payload };
    }
export {delay, time, getAllowedContentType, getSignature, getToken};