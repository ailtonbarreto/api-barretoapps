import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';


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
    // Convertendo Base64 para Buffer
    const fotoBuffer = Buffer.from(foto.split(",")[1], "base64");

    const query = "INSERT INTO u771906953_barreto.localizacoes (pessoa, lat, lon, foto) VALUES (?, ?, ?, ?)";
    
    pool.query(query, [pessoa, lat, lon, fotoBuffer], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao salvar no banco de dados", details: err });
      }
      res.status(200).json({ message: "Localização e foto recebidas com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao salvar a foto:", err);
    res.status(500).json({ error: "Erro ao processar a foto", details: err.message });
  }
});


// --------------------------------------------------------------------------------------
// GET DA BASE

app.get("/localizacoes", async (req, res) => {
  try {
    const query = "SELECT * FROM u771906953_barreto.localizacoes";
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar dados no banco de dados", details: err });
      }

      // Convertendo imagens para Base64 na resposta
      const formattedResults = results.map((row) => ({
        ...row,
        foto: row.foto ? `data:image/jpeg;base64,${row.foto.toString("base64")}` : null
      }));

      res.status(200).json({ data: formattedResults });
    });

  } catch (err) {
    console.error("Erro ao consultar as localizações:", err);
    res.status(500).json({ error: "Erro ao consultar as localizações", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// INSERIR AGENDAMENTO

app.post("/input_agendamento", async (req, res) => {

  const { nome, data, hora_inicio, hora_fim, profissional } = req.body;


  try {

    const query = "INSERT INTO u771906953_barreto.tb_agenda (nome, data, hora_inicio, hora_fim, profissional) VALUES (?, ?, ?, ?, ?)";
    
    pool.query(query, [nome, data, hora_inicio, hora_fim, profissional], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao salvar no banco de dados", details: err });
      }
      res.status(200).json({ message: "Localização e foto recebidas com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao salvar", err);
    res.status(500).json({ error: "Erro ao processar", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// VER AGENDAMENTO

app.get("/agendamento", async (req, res) => {
  try {
    const query = "SELECT * FROM u771906953_barreto.tb_agenda";
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar dados no banco de dados", details: err });
      }

      // Retorna os resultados diretamente
      res.status(200).json({ data: results });
    });

  } catch (err) {
    console.error("Erro ao consultar a agenda:", err);
    res.status(500).json({ error: "Erro ao consultar a agenda", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// INICIAR SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
