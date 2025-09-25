export default class ClientController{
    doGet(request,response, id){
        response.writeHead(200,{
            'Content-Type':'application/json'
        });
        response.end(JSON.stringify({
            "Controller":"ClientController",
            "method":"GET",
        "semantics":"Read"}));
    }
     doPost(request,response, id){
        response.writeHead(200,{
            'Content-Type':'application/json'
        });
        response.end(JSON.stringify({
            "Controller":"ClientController",
            "method":"POST",
        "semantics":"Create"}));
    }
    doPut(request,response, id){
        response.writeHead(200,{
            'Content-Type':'application/json'
        });
        response.end(JSON.stringify({
            "Controller":"ClientController",
            "method":"PUT",
        "semantics":"Update"}));
    }
    doPatch(request,response, id){
        response.writeHead(200,{
            'Content-Type':'application/json'
        });
        response.end(JSON.stringify({
            "Controller":"ClientController",
            "method":"PATCH",
        "semantics":"Update"}));
    }
    doDelete(request,response, id){
        response.writeHead(200,{
            'Content-Type':'application/json'
        });
        response.end(JSON.stringify({
            "Controller":"ClientController",
            "method":"DELETE",
        "semantics":"Delete"}));
    }
}