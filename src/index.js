const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const id = uuidv4();

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return response.status(201).send();
});

app.listen(3333);

/**
 * GET - Buscar uma informação dentro do servidor.
 * POST - Inserir uma informação no servidor.
 * PUT - Alterar uma informação no servidor.
 * PATCH - Alterar uma informação específica.
 * DELETE - Deletar uma informação no servidor.
 */

/**
 * Route Params => Indentificar um recurso editar/deletar/buscar
 * Query Params => Paginação / Filtro
 * Body Params => Os objetos inserção/alteração (JSON)
 */
