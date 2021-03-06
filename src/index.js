const { request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistAccontCPF(request, response, next) {
  const { cpf } = request.headers;
  console.log(cpf);
  console.log(request.query["date"]);
  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already Exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

//app.use(verifyIfExistAccontCPF)
app.get("/statement/date", verifyIfExistAccontCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date);
  console.log({ dateFormat });
  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.get("/statement", verifyIfExistAccontCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistAccontCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOparation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOparation);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistAccontCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.put("/account", verifyIfExistAccontCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get("/account", verifyIfExistAccontCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.delete("/account", verifyIfExistAccontCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get("/balance", verifyIfExistAccontCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);
});

app.listen(3333);

/**
 * GET - Buscar uma informa????o dentro do servidor.
 * POST - Inserir uma informa????o no servidor.
 * PUT - Alterar uma informa????o no servidor.
 * PATCH - Alterar uma informa????o espec??fica.
 * DELETE - Deletar uma informa????o no servidor.
 */

/**
 * Route Params => Indentificar um recurso editar/deletar/buscar
 * Query Params => Pagina????o / Filtro
 * Body Params => Os objetos inser????o/altera????o (JSON)
 */
