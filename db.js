import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from "dotenv";
import csv from "csvtojson";


dotenv.config({ path: './.env/.env' });


const app = express();


// --------------------------------------------------------------------------------------
// CONFIGURAÇÕES

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
  methods: ['GET', 'POST', 'DELETE','PUT'],
  allowedHeaders: ['Content-Type'],
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


  const { nome, procedimento, data, hora_inicio, hora_fim, profissional } = req.body;

  try {
    const query = `
      INSERT INTO u771906953_barreto.tb_agenda (nome, procedimento, data, hora_inicio, hora_fim, profissional) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(query, [nome, procedimento, data, hora_inicio, hora_fim, profissional], (err, results) => {
      if (err) {
        console.error("Erro ao salvar no banco de dados:", err);
        return res.status(500).json({ 
          error: "Erro ao salvar no banco de dados", 
          details: err.sqlMessage || err.message 
        });
      }
      res.status(200).json({ message: "Agendamento salvo com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
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
// DELETAR AGENDAMENTO

app.delete("/delete_agendamento/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM u771906953_barreto.tb_agenda WHERE id = ?";
    
    pool.query(query, [id], (err, results) => {
      if (err) {
        console.error("Erro ao excluir agendamento:", err);
        return res.status(500).json({ error: "Erro ao excluir agendamento", details: err.sqlMessage || err.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      res.status(200).json({ message: "Agendamento excluído com sucesso!" });
    });

  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar a requisição", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// DELETAR CLIENTE

app.delete('/delete/:id', (req, res) => {
  const pacienteId = req.params.id;

  res.header('Access-Control-Allow-Origin', '*');
  
  const query = 'DELETE FROM u771906953_barreto.tb_pacientes WHERE id = ?';
  
  pool.query(query, [pacienteId], (err, result) => {
      if (err) {
          console.error("Erro no banco:", err);
          return res.status(500).json({ 
              success: false,
              error: err.sqlMessage 
          });
      }

      res.status(200)
         .json({ success: true, message: 'Excluído com sucesso' })
         .end();
  });
});

// --------------------------------------------------------------------------------------
// ATUALIZAR CADASTRO

app.put('/update_cadastro/:id', (req, res) => {

  const { id } = req.params;

  const { nome, data_nascimento, telefone, genero } = req.body;

  pool.query(

    'UPDATE u771906953_barreto.tb_pacientes SET nome = ?, data_nascimento = ?, telefone = ?, genero = ? WHERE id = ?',

    [nome, data_nascimento, telefone, genero, id],

    (err, result) => {

      if (err) {
        console.error("Erro ao atualizar paciente:", err);

        return res.status(500).json({ message: 'Erro ao atualizar o paciente.', details: err.message });
      }

      if (result.affectedRows === 0) {

        return res.status(404).json({ message: 'Paciente não encontrado.' });
      }

      res.json({ message: 'Paciente atualizado com sucesso.' });

    }

  );

});


// --------------------------------------------------------------------------------------
// CADASTRAR PACIENTE

app.post("/input_paciente", async (req, res) => {
  const { nome, data_nascimento, telefone, genero} = req.body;

  try {
    const query = `
      INSERT INTO u771906953_barreto.tb_pacientes (nome, data_nascimento, telefone, genero) 
      VALUES (?, ?, ?, ?)
    `;

    pool.query(query, [nome, data_nascimento, telefone, genero], (err, results) => {
      if (err) {
        console.error("Erro ao salvar no banco de dados:", err);
        return res.status(500).json({ 
          error: "Erro ao Cadastrar", 
          details: err.sqlMessage || err.message 
        });
      }
      res.status(200).json({ message: "Cadastro salvo com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// LISTA DE PACIENTES

app.get("/lista_pacientes", async (req, res) => {
  try {
    const query = "SELECT * FROM u771906953_barreto.tb_pacientes";
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar dados no banco de dados", details: err });
      }
      res.status(200).json({ data: results });
    });

  } catch (err) {
    console.error("Erro ao consultar a agenda:", err);
    res.status(500).json({ error: "Erro ao consultar a agenda", details: err.message });
  }
});

// --------------------------------------------------------------------------------------
// CADASTRAR PROFISSIONAL

app.post("/input_profissional", async (req, res) => {

  const {profissional, telefone, empresa} = req.body;


  try {
    const query = `
      INSERT INTO u771906953_barreto.tb_profissional (profissional, telefone, empresa) 
      VALUES (?, ?, ?)
    `;

    pool.query(query, [profissional, telefone, empresa], (err, results) => {

      if (err) {

        console.error("Erro ao salvar no banco de dados:", err);

        return res.status(500).json({ 

          error: "Erro ao Cadastrar", 

          details: err.sqlMessage || err.message 
        });
      }
      res.status(200).json({ message: "Cadastro salvo com sucesso!", data: results });
    });

  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar", details: err.message });
  }
});


// --------------------------------------------------------------------------------------
// LISTA DE PROFISSIONAIS

app.get("/lista_profissional", async (req, res) => {
  try {
    const query = "SELECT * FROM u771906953_barreto.tb_profissional";
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar dados no banco de dados", details: err });
      }
      res.status(200).json({ data: results });
    });

  } catch (err) {
    console.error("Erro ao consultar a Base:", err);
    res.status(500).json({ error: "Erro ao consultar a Base", details: err.message });
  }
});


// --------------------------------------------------------------------------------------
// LOGIN

app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;
  const url = process.env.PLANILHA_URL;

  try {
    const response = await fetch(url);
    const csvText = await response.text();
    const usuarios = await csv().fromString(csvText);

    const user = usuarios.find(u => u.user === usuario && u.password === senha);

    if (user) {
      // Oculta a senha na resposta
      delete user.password;
      return res.status(200).json({ success: true, user });
    } else {
      return res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erro ao processar login" });
  }
});

// --------------------------------------------------------------------------------------
// INICIAR SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});