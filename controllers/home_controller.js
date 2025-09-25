import * as fs from "node:fs/promises"

export default class HomeController {
   async index(request, response, id) {
    let parts = request.url.split("?");
       
            let queryObj = {};
            if (parts.length === 2 && parts[1].length > 0) {
                let queryStr = parts[1];
                let pairs = queryStr.split("&");
                for (let p of pairs) {
                    let [key, val] = p.split("=");
                    if (key) queryObj[key] = val ?? null;
                }
            }
            
    let controller, action;

    const path = parts[0];
    let components = path.split('/');

    if (components.length > 1 && components[1].length > 0) {
        controller = components[1].toLowerCase();
    } else {
        controller = "home";
    }

    if (components.length > 2 && components[2].length > 0) {
        action = components[2].toLowerCase();
    } else {
        action = "index";
    }
             const pageData = {
        method: request.method,
        httpVersion: request.httpVersion,
        url: request.url,
        query: null,
    };


            pageData.controller = controller;
            pageData.action = action;
            pageData.id = id;
            pageData.query = queryObj;
            pageData.path = parts[0];
        
            if (parts.length == 2) {
                pageData.query = parts[1];
            }
            pageData.path = parts[0];
            pageData.groupHtml = await this.makeGroupHtml();
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
    privacy(request, response, id) {
        response.writeHead(200,
             { 'Content-Type': 'text/html;charset=utf-8' });
        response.end(`<html></head><mets charset-utf-8/></head><body>
            <h1>Політика конфіденційності</h1></body></html>`);
    }
   async makeGroupHtml() {
    const [data] = await this.dbPool.query('SELECT * FROM `groups` ');
    let wasChild;
    do {
        wasChild = false;
        for (let i = 0; i < data.length; i += 1) {
            let grp = data[i];
            if (grp["parent_id"] != null) {
                wasChild = true;
                let parent = this.findParent(data, grp["parent_id"]);
                if (typeof parent.sub == 'undefined') {
                    parent.sub = [];
                }
                parent.sub.push(grp);
                data.splice(i, 1);
            }
        }
    } while (wasChild);
    console.log(data);


    return this.grpToHtml(data);
}

 grpToHtml(grps) {
    let html = "<ul>";
    for (let grp of grps) {
        // якщо є підгрупи — додаємо клас "toggle"
        if (typeof grp.sub != 'undefined' && grp.sub.length > 0) {
            html += `<li><span class="toggle">${grp.name}</span>`;
            html += this.grpToHtml(grp.sub);  // рекурсивно малюємо дітей
        } else {
            html += `<li>${grp.name}</li>`;
        }
        html += '</li>';
    }
    html += '</ul>';
    return html;
}


 findParent(arr, parent_id) {
    for (let elem of arr) {
        if (elem.id == parent_id) return elem;
        if (typeof elem.sub != 'undefined') {
            let p = this.findParent(elem.sub, parent_id);
            if (p != null) return p;
        }
    }
    return null;
}


};