import mysql from 'mysql2'
import GroupDao from './dao/groupDao.js';

const config ={
  host: 'localhost',
    port: 3306,
    user: 'user_231',
    password: 'pass_231',
    database: 'node_231',
    charset: 'utf8mb4',
}
const dbPool = mysql.createPool(config).promise();
const groupDao = new GroupDao(dbPool);
await groupDao.install()
await groupDao.seed().then(()=>console.log('Seed finished'))
await dbPool.query(`SELECT
    *
FROM
    \`groups\` G1
    JOIN \`groups\` G2 ON G2.parent_id = G1.id
WHERE

    G1.parent_id IS NULL`).then(([data])=>console.log(data));
dbPool.end();