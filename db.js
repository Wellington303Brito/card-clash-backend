const mysql = require('mysql2');

// ✨ Mudamos de createConnection para createPool para a conexão não cair!
const pool = mysql.createPool({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com', 
    port: 4000,                               // Deixe 4000 (é o padrão do TiDB)
    user: '2MZwi1rE2jnd2YV.root',      // Ex: '4aBcdEf.root'
    password: 'T1YEZNac7FaSpPZI',
    database: 'test',                         // Pode deixar 'test' ou o nome do seu banco                         
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true // Obrigatório para o TiDB Cloud aceitar
    }
});

// Para o código continuar funcionando sem você quebrar suas rotas, 
// transformamos o pool em formato de promessa (muito recomendado para async/await)
const db = pool.promise();

console.log('🚀 Pool de conexões do TiDB Cloud configurado!');

module.exports = db;
