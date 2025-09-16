
export default class GroupDao {
    constructor(dbPool) {
        this.dbPool = dbPool;
    }
    install() {
        const sql = `CREATE TABLE IF NOT EXISTS \`groups\`(
id CHAR(36) PRIMARY KEY,
parent_id CHAR(36) NULL,
name VARCHAR(64) NOT NULL COLLATE utf8mb4_unicode_ci)
ENGINE = InnoDb DEFAULT CHARSET = utf8mb4`;
        return this.dbPool.query(sql)
            .then(() => console.log("Table 'groups' created"))
            .catch(console.error)
    }

    seed() {
        let tasks = [];
        let sql = `insert into \`groups\` (id, parent_id,name)
        values ('849a792b-9206-11f0-875d-0250b9ae25c3',null, 'Побутова техніка') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('93814048-9207-11f0-875d-0250b9ae25c3','849a792b-9206-11f0-875d-0250b9ae25c3', 'Для вбиральні') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('dee36336-9207-11f0-875d-0250b9ae25c3','93814048-9207-11f0-875d-0250b9ae25c3', 'Пральні машини ') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('e22029df-9207-11f0-875d-0250b9ae25c3','93814048-9207-11f0-875d-0250b9ae25c3', 'Сушарки') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('4ede7995-9208-11f0-875d-0250b9ae25c3','849a792b-9206-11f0-875d-0250b9ae25c3', 'Для кухні') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('4caa4e37-9208-11f0-875d-0250b9ae25c3','4ede7995-9208-11f0-875d-0250b9ae25c3', 'Холодильники ') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('4a9283e4-9208-11f0-875d-0250b9ae25c3','4ede7995-9208-11f0-875d-0250b9ae25c3', 'Посудомийки ') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('f58972fb-9208-11f0-875d-0250b9ae25c3','849a792b-9206-11f0-875d-0250b9ae25c3', 'Для прибирання') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('f327273e-9208-11f0-875d-0250b9ae25c3','f58972fb-9208-11f0-875d-0250b9ae25c3', 'Пилососи побутові ') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        sql = `insert into \`groups\` (id, parent_id,name)
        values ('f0ed1ee0-9208-11f0-875d-0250b9ae25c3','f58972fb-9208-11f0-875d-0250b9ae25c3', 'Пилососи-машини ') 
        on duplicate key update 
        name = values(name),
        parent_id =values(parent_id)`
        tasks.push(this.dbPool.query(sql));

        return Promise.all(tasks);
    }
}