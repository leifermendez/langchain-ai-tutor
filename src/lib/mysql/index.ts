import mysql, { Connection } from 'mysql2'

/**
 * Clase que gestioanr todas las funcion con MySQL
 */
class MyslAdapter {
    db: Connection
    listHistory = []
    credentials = { host: null, user: null, database: null, password: null }

    constructor(_credentials: { host: any; user: any; database: any; password: any }) {
        this.credentials = _credentials
    }

    /**
     * Init
     */
    async init() {
        this.db = mysql.createConnection(this.credentials)

        this.db.connect(async (error) => {
            if (!error) {
                console.log(`Solicitud de conexión a base de datos exitosa`)
                return
            }

            console.log(`Solicitud de conexión fallida ${error.stack}`)
        })
    }

    /**
     * 
     * @param productName 
     * @returns 
     */
    findProduct = async (productNames: string[]) => {
        return await new Promise((resolve, reject) => {
            // Construir la parte de la consulta con la cláusula OR dinámicamente
            const searchConditions = productNames.map(name => `(name LIKE '%${name}%' OR description LIKE '%${name}%')`).join(' OR ');

            const sql = `
                SELECT * 
                FROM products 
                WHERE ${searchConditions}
                ORDER BY id DESC
            `;

            console.log(`[SQL]:`, sql)

            this.db.query(sql, (error, rows) => {
                if (error) {
                    reject(error);
                }
                resolve(rows);
            });
        });
    }
}

const mysqlInstante = new MyslAdapter({
    host: '127.0.0.1',
    database: 'ecommerce',
    password: '',
    user: 'root'
})

export { mysqlInstante }