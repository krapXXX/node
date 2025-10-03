import UserDao from '../../dao/userDao.js';


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