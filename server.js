import * as fs from "node:fs/promises"
import GroupDao from './dao/groupDao.js';
import mysql from 'mysql2'
import http from "http"
import {getAllowedContentType} from './helper.js'
const dbIniFilename = "db.ini";
const HTTP_PORT = 81;
const dbIniFile = await fs.open(dbIniFilename, "r");
let dbConfig = {};

for await (let line of dbIniFile.readLines()) {
    let parts = line.split('#')
    line = parts[0];
    parts = line.split(';')
    line = parts[0];
    parts = line.split('=')
    if (parts.length != 2) continue;
    dbConfig[parts[0].trim()] = parts[1].trim();
}
const dbPool = mysql.createPool(dbConfig).promise();
const groupDao = new GroupDao(dbPool);
//console.log(dbConfig); process.exit();
async function serverFunction(request, response) {
    // console.log(request);
    const pageData = {
        method: request.method,
        httpVersion: request.httpVersion,
        url: request.url,
        query: null,
    };
    let parts = request.url.split("?");
    if (parts.length > 2) {
        response.writeHead(400);
        response.end("Bad request");
        return;
    }
    const path = parts[0];
    console.log(path);

    if (!path.endsWith('/')) {
        let contentType = getAllowedContentType(path);
        if (contentType!=null){
        const filePath = "./wwwroot" + path;
        try {
            await fs.access(filePath);
            const stat = await fs.stat(filePath);
                if (stat.isFile()) {
                                console.log(filePath);

                    (await fs.open(filePath)).createReadStream().pipe(response);
                   response.writeHead(200,{ 'Content-Type': contentType});  
                  // response
                    return;
                }
            
        } catch (_){ }
    }}

   let controller, action, slug;

// спочатку ділимо шлях
let components = path.split('/'); // розділити по "/"

// controller
if (components.length > 1 && components[1].length > 0) {
    controller = components[1].toLowerCase();
} else {
    controller = "home";
}

// action
if (components.length > 2 && components[2].length > 0) {
    action = components[2].toLowerCase();
} else {
    action = "index";
}

// slug
if (components.length > 3 && components[3].length > 0) {
    slug = components[3].toLowerCase();
} else {
    slug = null;
}
let queryObj = {};
if (parts.length === 2 && parts[1].length > 0) {
    let queryStr = parts[1];
    let pairs = queryStr.split("&");
    for (let p of pairs) {
        let [key, val] = p.split("=");
        if (key) queryObj[key] = val ?? null;
    }
}
pageData.controller = controller;
pageData.action = action;
pageData.slug = slug;
pageData.query = queryObj;
pageData.path = parts[0];

    if (parts.length == 2) {
        pageData.query = parts[1];
    }
    pageData.path = parts[0];
    pageData.groupHtml = await makeGroupHtml();
    response.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
    });

    const file = await fs.open("home.html", "r");
    let html = (await file.readFile()).toString();
    file.close();
    for (let k in pageData) {
        html = html.replaceAll(`{{${k}}}`, pageData[k]);
    }
    response.end(html);
}
async function makeGroupHtml() {
    const [data] = await dbPool.query('SELECT * FROM `groups` ');
    let wasChild;
    do {
        wasChild = false;
        for(let i = 0; i < data.length; i+=1) {
            let grp = data[i];
            if(grp["parent_id"] != null) {
                wasChild = true;
                let parent = findParent(data, grp["parent_id"]);
                if(typeof parent.sub == 'undefined') {
                    parent.sub = [];
                }
                parent.sub.push(grp);
                data.splice(i,1);
            }
        }
    } while(wasChild);
console.log(data);
    

    return grpToHtml(data);
}

function grpToHtml(grps) {
    let html = "<ul>";
    for (let grp of grps) {
        // якщо є підгрупи — додаємо клас "toggle"
        if (typeof grp.sub != 'undefined' && grp.sub.length > 0) {
            html += `<li><span class="toggle">${grp.name}</span>`;
            html += grpToHtml(grp.sub);  // рекурсивно малюємо дітей
        } else {
            html += `<li>${grp.name}</li>`;
        }
        html += '</li>';
    }
    html += '</ul>';
    return html;
}


function findParent(arr, parent_id) {
    for(let elem of arr) {
        if(elem.id == parent_id) return elem;
        if(typeof elem.sub != 'undefined') {
            let p = findParent(elem.sub, parent_id);
            if(p != null) return p;
        }
    }
    return null;
}

const server = http.createServer(serverFunction);
server.on('close', () => {
    console.log("Server stopped");
    dbPool.end();
    process.exit();
});
server.listen(HTTP_PORT, () => {
    console.log("Server listening port ", HTTP_PORT);
    console.log("Press Ctrl-C to stop");
});

process.on('SIGINT', () => {
    server.close();
});
