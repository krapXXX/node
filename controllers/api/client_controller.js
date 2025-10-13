import Base64 from '../../base_64.js';
import UserDao from '../../dao/userDao.js';
import * as crypto from 'node:crypto';
import settings from './appsettings.js';

function isJsonContentType(header) {
  if (typeof header !== "string") return false;
  const [type] = header.split(";");
  return type.trim().toLowerCase() === "application/json";
}

export default class ClientController {

  constructor() {
    this.restResponse = {
      status: {
        code: 200,
        phrase: "OK",
        isSuccess: true,
      },
      meta: {
        service: "Client API",
        method: "",
        serverTime: new Date().getTime(),
        cache: 0,
        dataType: "",
      },
      data: null
    };
  }

  getSignature(data, secret) {
    if (typeof secret == 'undefined') {
      secret = settings.jwtSecret;
    }
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  getToken(request) {
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
  }

  doOptions(request, response) {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': request.headers['access-control-request-method'],
      'Access-Control-Allow-Headers': '*'
    });
    response.end();
  }
  doGet(request, response, id) {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    this.restResponse.meta.method = request.method;
    this.restResponse.meta.slug = id;
    this.restResponse.meta.cache = 86400;
    this.restResponse.meta.dataType = "string";
    if (id == 'auth') {
      this.authenticate(request, response);
    }
    else {
      const jwt = this.getToken(request);
      if (typeof jwt == 'string') {
        this.send401(response, jwt);
        return;
      }
      if (id === 'install') {
        const userDao = new UserDao(this.dbPool);
        userDao.install()
          .then(() => {
            this.restResponse.data = "Tables created";
            response.end(JSON.stringify(this.restResponse));
          })
          .catch((err) => {
            this.restResponse.data = err;
          });
      }
      else {
        this.restResponse.data = "ClientController";
        response.end(JSON.stringify(this.restResponse));
      }

    }
  }

  async authenticate(request, response) {
// Перевіряємо наявність заголовку Authorization
        // Перевірємо схему: повинна бути 'Basic ' (з пробілом)
        // Відокремлюємо credentials - те, що іде після схеми
        // Декодуємо по base64
        // Розділяємо по символу ":" (з лімітом на 2 частини)
        // За логіном знаходимо запис у таблиці БД
        // Перевірямо пароль шляхом повторного розрахунку KDF від пароля, що введенно та
        // солі, що зберігається у таблиці БД. Порівнюємо отриманий результат зі збереженим у БД
        const authHeader = request.headers['authorization'];
        if(!authHeader) {
            this.send400(response, "Missing 'Authorization' header");
            return;
        }
        const scheme = "Basic ";
        if( ! authHeader.startsWith(scheme)) {
            this.send400(response, `Invalid Authorization scheme: ${scheme} required` );
            return;
        }
        const credentials = authHeader.substring(scheme.length);
 
    let userPass;
    try {
      userPass = Base64.decode(credentials);
    }
    catch (err) {
      this.send400(response, "invalid creadentials: base 64 decode error: " + err);
      return;
    } 
    const parts = userPass.split(':', 2);
    if (parts.length != 2) {
      this.send400(response, "invalid creadentials: missing ':'separator");
      return;

    }
    this.restResponse.data = parts;
    const login = parts[0];
    const password = parts[1];
    const userDao = new UserDao(this.dbPool);
    const userAccess = await userDao.getUserAccessByCredentials(login, password);
    if (!userAccess) {
      this.send401(response);
      return;
    }

    // Create token
    const tokenData = await userDao.createTokenForUserAccess(userAccess);

    const jwtHeader = {
      typ: "JWT",
      alg: "HS256"
    };

    const jwtPayload = {
      iss: "NODE",
      sub: userAccess.id,
      aud: userAccess.role_id,
      exp: tokenData.exp,
      nbf: tokenData.timestamp,
      iat: tokenData.timestamp,
      jti: tokenData.id
    };

    const jwtBody = Base64.encodeUrl(JSON.stringify(jwtHeader)) + "." + Base64.encodeUrl(JSON.stringify(jwtPayload));
    const jwtSignature = this.getSignature(jwtBody);
    this.restResponse.data = jwtBody + "." + jwtSignature;

    response.end(JSON.stringify(this.restResponse));
  }

  send400(response, reason) {
    this.restResponse.status.code = 400;
    this.restResponse.status.phrase = "Bad Request";
    this.restResponse.status.isSuccess = false;
    this.restResponse.data = reason;
    response.end(JSON.stringify(this.restResponse));
    return;
  }
  send401(response, reason) {
    if (typeof reason == 'undefined') {
      reason = "Credentials rejected. Check login and password";
    }
    this.restResponse.status.code = 401;
    this.restResponse.status.phrase = "UnAuthorized";
    this.restResponse.status.isSuccess = false;
    this.restResponse.data = reason;
    response.end(JSON.stringify(this.restResponse));
    return;
  }
  doPost(request, response, id) {
    let body = "";
    request.on('data', chunk => { body += chunk });
    request.on('end', async () => {
      console.log("ClientController::doPost body: " + body);
      console.log(request.headers['content-type']);

      if (isJsonContentType(request.headers["content-type"])) {

        const data = JSON.parse(body);

        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });

        this.restResponse.meta.method = request.method;
        this.restResponse.meta.slug = id;
        this.restResponse.meta.cache = 0;
        this.restResponse.meta.dataType = "string";

        const userDao = new UserDao(this.dbPool);

        try {
          this.restResponse.data = await userDao.register(data);
        }
        catch (err) {
          this.restResponse.data = err;
        }

        response.end(JSON.stringify(this.restResponse));
      }
      else {
        response.writeHead(415);
        response.end("Unsupported Media Type");
      }
    });
  }
  doPut(request, response, id) {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',

    });
    this.restResponse.meta.method = request.method;
    this.restResponse.meta.slug = id;
    this.restResponse.meta.cache = 86400;
    this.restResponse.meta.dataType = "string";
    this.restResponse.data = "PUT ClientController";
    response.end(JSON.stringify(this.restResponse));
  }
  doPatch(request, response, id) {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    this.restResponse.meta.method = request.method;
    this.restResponse.meta.slug = id;
    this.restResponse.meta.cache = 86400;
    this.restResponse.meta.dataType = "string";
    this.restResponse.data = "PATCH ClientController";
    response.end(JSON.stringify(this.restResponse));
  }

  doDelete(request, response, id) {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    this.restResponse.meta.method = request.method;
    this.restResponse.meta.slug = id;
    this.restResponse.meta.cache = 86400;
    this.restResponse.meta.dataType = "string";
    this.restResponse.data = "DELETE ClientController";
    response.end(JSON.stringify(this.restResponse));
  }

}


/*
cors - cros origin resource sharing
обмеження в обміні данними між джрелми різного походження  
- sheme(http)
- host
- port
кліент(браузер) маєзалокувати корс дані, якщо у відповіді сервера відсутні заголовки які це дозволяють
access control allow origin
якщо метод запиту != get, то перед запитом надсилається preflight запит методом options з передачею питання заголовком access control request method
у відповіді мають бути дозвільні заголовки 

*/