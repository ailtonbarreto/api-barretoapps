import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';  // Usando o mysql2 ao invés de pg
const app = express();

// --------------------------------------------------------------------------------------
// CONFIGURAÇÕES
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------------------
// CRENDENCIAIS
const pool = mysql.createPool({
  host: 'srv1073.hstgr.io',
  user: 'u771906953_barreto',
  password: 'MQPj3:6GY_hFfjA',
  database: 'u771906953_barreto',
  port: 3306,
});

// --------------------------------------------------------------------------------------
// PERMISSOES DO SITE
const corsOptions = {
  origin: "*",
  methods: 'GET,POST',
};

app.use(cors(corsOptions));

// --------------------------------------------------------------------------------------
// ROTA DE POST
app.post('/input', (req, res) => {
  const { pessoa, lat,lon } = req.body;

  // AQUI FAÇA O POST NO BANCO DE DADOS
  pool.query('INSERT INTO u771906953_barreto.localizacoes (pessoa, lat,lon) VALUES (?, ?, ?)', [pessoa, lat,lon], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao inserir dados' });
    }
    res.status(200).json({ message: 'Dados inseridos com sucesso!', results });
  });
});

// --------------------------------------------------------------------------------------
// INICIAR SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
