export default class FeedbackController {
    doGet(request, response, id) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            "Controller": "FeedbackController",
            "method": "GET",
            "semantics": "Read"
        }));
    }

    doPost(request, response, id) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            "Controller": "FeedbackController",
            "method": "POST",
            "semantics": "Create"
        }));
    }

    doPut(request, response, id) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            "Controller": "FeedbackController",
            "method": "PUT",
            "semantics": "Update"
        }));
    }

    doPatch(request, response, id) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            "Controller": "FeedbackController",
            "method": "PATCH",
            "semantics": "Partial update"
        }));
    }

    doDelete(request, response, id) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            "Controller": "FeedbackController",
            "method": "DELETE",
            "semantics": "Remove"
        }));
    }
}