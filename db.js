import express from 'express';
import cors from 'cors';
import mysql from 'mysql2'; 
import fs from 'fs';
import path from 'path';

const app = express();

// --------------------------------------------------------------------------------------
// CONFIGURAÇÕES
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
app.post("/input", async (req, res) => {
  const { pessoa, lat, lon, foto } = req.body;


  if (!foto) {
    return res.status(400).json({ error: "Nenhuma foto recebida" });
  }

  try {
  
    const fotoBuffer = Buffer.from(foto.split(",")[1], "base64");


    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Cria o caminho onde a foto será salva
    const filePath = path.join(uploadDir, `${pessoa}_foto.png`);

    // Salva a foto
    await fs.promises.writeFile(filePath, fotoBuffer);

    // Aqui você pode adicionar um comando para armazenar as coordenadas e o nome no banco de dados, se necessário
    const query = "INSERT INTO localizacao (nome, lat, lon, foto_url) VALUES (?, ?, ?, ?)";
    const fotoUrl = `/uploads/${pessoa}_foto.png`; // URL relativa para a foto

    pool.query(query, [pessoa, lat, lon, fotoUrl], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao salvar no banco de dados", details: err });
      }
      res.status(200).json({ message: "Localização e foto recebidas com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao salvar a foto:", err);
    res.status(500).json({ error: "Erro ao salvar a foto no servidor", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// INICIAR SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
