const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  connectionLimit: 10,
  host: '192.168.0.12',
  user: 'root',
  port: 3306,
  database: 'tech_facil'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados.');
});

// Endpoint de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM usuarios WHERE Email = ? AND Senha = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(401).json({ message: 'Login inválido' });
    }
  });
});

// Endpoint para obter clientes
app.get('/clientes/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM clientes WHERE userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint para adicionar clientes
app.post('/clientes', (req, res) => {
  const { NomeCompleto, Email, CPF_CNPJ, NumeroDeCelular, Endereco, userId } = req.body;
  console.log('Dados recebidos:', req.body); 
  const query = 'INSERT INTO clientes (NomeCompleto, Email, CPF_CNPJ, NumeroDeCelular, Endereco, userId) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [NomeCompleto, Email, CPF_CNPJ, NumeroDeCelular, Endereco, userId], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar cliente:', err);
      res.status(500).json({ message: 'Erro ao adicionar cliente' });
      return;
    }
    res.json({ message: 'Cliente adicionado com sucesso', id: results.insertId });
  });
});

// Endpoint para obter funcionários
app.get('/funcionarios/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM funcionarios WHERE userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint para adicionar funcionários e escala
app.post('/funcionarios', (req, res) => {
  const { NomeCompleto, Email, CPF, Funcao, Endereco, NumeroDeCelular, userId, Data, Turno, PostoDeTrabalho, Escala, HorarioEntrada, DataInicio, DataFim } = req.body;
  console.log('Dados recebidos:', req.body); // Adiciona um log para verificar os dados recebidos
  const query = 'INSERT INTO funcionarios (NomeCompleto, Email, CPF, Funcao, Endereco, NumeroDeCelular, userId, PostoDeTrabalho, Escala, HorarioEntrada, Data, Turno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [NomeCompleto, Email, CPF, Funcao, Endereco, NumeroDeCelular, userId, PostoDeTrabalho, Escala, HorarioEntrada, Data, Turno], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar funcionário:', err);
      res.status(500).json({ message: 'Erro ao adicionar funcionário' });
      return;
    }
    const funcionarioID = results.insertId;
    console.log('Funcionário adicionado com ID:', funcionarioID); // Log do ID do funcionário adicionado
    if (PostoDeTrabalho === 'férias') {
      const feriasQuery = 'INSERT INTO ferias (FuncionarioID, DataInicio, DataFim) VALUES (?, ?, ?)';
      db.query(feriasQuery, [funcionarioID, DataInicio, DataFim], (err, feriasResults) => {
        if (err) {
          console.error('Erro ao adicionar férias:', err);
          res.status(500).json({ message: 'Erro ao adicionar férias' });
          return;
        }
        console.log('Férias adicionadas com sucesso');
        res.json({ message: 'Funcionário e férias adicionados com sucesso', id: funcionarioID });
      });
    } else {
      res.json({ message: 'Funcionário adicionado com sucesso', id: funcionarioID });
    }
  });
});

// Endpoint para obter ferias
app.get('/ferias/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT ferias.*, funcionarios.NomeCompleto FROM ferias JOIN funcionarios ON ferias.FuncionarioID = funcionarios.ID WHERE funcionarios.userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint para adicionar ferias
app.post('/ferias', (req, res) => {
  const { FuncionarioID, DataInicio, DataFim } = req.body;
  console.log('Dados recebidos:', req.body); // Adiciona um log para verificar os dados recebidos
  const query = 'INSERT INTO ferias (FuncionarioID, DataInicio, DataFim) VALUES (?, ?, ?)';
  db.query(query, [FuncionarioID, DataInicio, DataFim], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar férias:', err);
      res.status(500).json({ message: 'Erro ao adicionar férias' });
      return;
    }
    console.log('Férias adicionadas com sucesso');
    res.json({ message: 'Férias adicionadas com sucesso', id: results.insertId });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
