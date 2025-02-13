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
app.post("/input", (req, res) => {
  const { pessoa, lat, lon, foto } = req.body;


  const fotoBuffer = Buffer.from(foto.split(",")[1], "base64");

  const fs = require('fs');
  fs.writeFile(`./uploads/${pessoa}_foto.png`, fotoBuffer, (err) => {
      if (err) {
          return res.status(500).json({ error: "Erro ao salvar foto" });
      }
      res.status(200).json({ message: "Localização e foto recebidas!" });
  });
  
});

// --------------------------------------------------------------------------------------
// INICIAR SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
