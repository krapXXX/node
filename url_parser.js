const _url = "https://login:passw0rd@music.portal.fun:80/rock/ballads?search=scorpions&from=1990#descending";
const invalid_url = "123";
let result = {
    "scheme": "https",
    "auth": {
        "user-id": "login",
        "password": "passw0rd",
    },
    "host": {
        "tld": "fun",
        "domain": "portal",
        "sybdomain": "music"
    },
    "port": 80,
    "path": [
        "rock",
        "ballads"
    ],
    "query": {
        "search": "scorpions",
        "from": "1990"
    },
    "fragment": "descending"
}

function parseUrl(url) {
    let result = {};
    let parts = url.split("://");
    if (parts.length != 2) {
        throw new Error(`Format Error:scheme not detected in ${url}`);
    }
    if (parts.length == 2) {
        result.scheme = parts[0];
    }

    parts = parts[1].split("@");
    if (parts.length != 2) {
        throw new Error(`Format Error:auth not detected in ${url}`);
    }
    if (parts.length == 2) {
        let credentials = parts[0];
        credentials = credentials.split(":");
        if (credentials.length == 2) {
            result.auth = {
                "user-id" : credentials[0],
                "pass": credentials[1]
            }
        }
    }
 q=parts[1].split('#')
    if(q.length==2)
    {   
        let query = q[0];
        result.fragment=q[1];
        query =query.split('&');
        result.query={
            "search":query[0].split('=')[1],
            "from":query[1].split('=')[1]
        };   
    }
    parts=parts[1].split('?')
if(parts.length==2)
{
    parts = parts[0].split('/');

        let host = parts[0];
        result.path=[
            parts[1],
            parts[2]
        ]
        if(host.includes(':'))
        {
            let hp = host.split(':');
            host = hp[0];
            result.port=hp[1];
        }
        host = host.split(".");

            result.host = {
                "tld":host[2],
                "domain" :host[1],
                "sybdomain": host[0]
            }
          
        }

 
    result.rest = parts[3];

    return result;
}
console.log(parseUrl(_url));
