function isJsonContentType(header) {
    if (typeof header !== "string") return false;
    const [type] = header.split(";");
    return type.trim().toLowerCase() === "application/json";
}

export default class ClientController {
    doGet(request, response, id) {
        response.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify({
            "Controller": "ClientController",
            "method": "GET",
            "semantics": "Read"
        }));
    }


    doPost(request, response, id) {
        let body = "";
        request.on('data', function (chunk) { body += chunk });
        request.on('end', function () {
            console.log("ClientController::doPost body: " + body);
            console.log(request.headers['content-type']);
            if (isJsonContentType(request.headers["content-type"])) {
                try {
                    const data = JSON.parse(body);
                    response.writeHead(200, {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    });
                    response.end(JSON.stringify({
                        "Controller": "ClientController",
                        "method": "POST",
                        "semantics": "Create",
                        "body": data
                    }));
                } catch (err) {
                    response.writeHead(400);
                    response.end("Invalid JSON");
                }
            } else {
                response.writeHead(415);
                response.end("Unsupported Media Type");
            }
        });
    }

    doOptions(request, response) {
        response.writeHead(200, {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Methods': request.headers['access-control-request-method'],
            'Access-Control-Allow-Headers': '*'
        });
        response.end();
    }
    doPut(request, response, id) {
        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',

        });
        response.end(JSON.stringify({
            "Controller": "ClientController",
            "method": "PUT",
            "semantics": "Update"
        }));
    }
    // doPatch(request,response, id){
    //     response.writeHead(200,{
    //         'Content-Type':'application/json'
    //     });
    //     response.end(JSON.stringify({
    //         "Controller":"ClientController",
    //         "method":"PATCH",
    //     "semantics":"Update"}));
    // }
    // doDelete(request,response, id){
    //     response.writeHead(200,{
    //         'Content-Type':'application/json'
    //     });
    //     response.end(JSON.stringify({
    //         "Controller":"ClientController",
    //         "method":"DELETE",
    //     "semantics":"Delete"}));
    // }
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