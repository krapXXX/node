class ApiController{

    constructor() {
      this.restResponse = {
      status: {
        code: 200,
        phrase: "OK",
        isSuccess: true,
      },
      meta: {
        service: "APIController",
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
}

export default ApiController;