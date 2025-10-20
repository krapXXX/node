import UserDao from '../../dao/userDao.js';
import Base64 from '../../base_64.js';
import ApiController from './controller_api.js';

function isJsonContentType(header) {
  if (typeof header !== "string") return false;
  const [type] = header.split(";");
  return type.trim().toLowerCase() === "application/json";
}

export default class ClientController extends ApiController{

  constructor({dbPool,getSignature, getToken}) {
    super();
    this.dbPool = dbPool;
    this.getSignature = getSignature;
    this.getToken = getToken;
    this.restResponse.service = "Client API";
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