const assert = require("assert");
const MongoDb = require("../db/mongo/mongo.strategy");
const Context = require("../db/base/context.strategy");
const BankSchema = require("../db/mongo/schema/bank.schema");
const { Mongoose } = require("mongoose");
let context = {};
let ID_INSERTED = {};
const ACCOUNT_INSERT = {
  agencia: 10,
  conta: 1020,
  name: "Jose Luis Borges",
  balance: 153,
};

const ACCOUNT_UPDATE = {
  name: "Diego Silva",
  balance: 100
};

describe("MongoDb Account Suite Tests", function () {
  this.timeout(Infinity);

  this.beforeAll("Cria uma conexão", () => {
    const connection = MongoDb.connect();
    context = new Context(new MongoDb(connection, BankSchema));
  });

  it("Verfica conexão", async () => {
    const expected = "Connected";
    const state = await context.isConnected();
    assert.deepEqual(state, expected);
  });

  it("Deve cadastrar uma conta", async () => {
    const expected = ACCOUNT_INSERT;
    const {name, balance, conta, agencia } = await context.insert(ACCOUNT_INSERT); 
    const actual   = { name, balance, conta, agencia} ;  
    assert.deepEqual(actual, expected);
  });

  it("Deve retornar uma conta pelo nome", async () => {
    const expected = { count: 1, name: ACCOUNT_INSERT.name};
    const actual = await context.read({ name: ACCOUNT_INSERT.name }); 

    assert.deepEqual(actual.length, expected.count);
    assert.deepEqual(actual[0].name, expected.name);
  });

  it("Deve alterar o nome de uma conta", async () => {
    const expected = { ...ACCOUNT_INSERT, ...ACCOUNT_UPDATE };
    const [originAccount] = await context.read({ name: ACCOUNT_INSERT.name }); 
    const { nModified } = await context.update(originAccount._id, ACCOUNT_UPDATE);
    const [{name, balance, conta, agencia}] = await context.read({ _id: originAccount._id});
    const actual  = {name, balance, conta, agencia};
    assert.deepEqual(nModified, 1);
    assert.deepEqual( actual, expected);

  });

  it("Deve dar erro ao atualizar uma conta com balance menor que 0", async () => {
    const expected = "Validation failed: balance: Saldo da conta não pode ser negativo";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try
    {
      const result = await context.update(originAccount._id, { balance: -1});
    }catch(err){
      messageError = err.message;
    }
   
    assert.deepEqual(messageError, expected);
  });

  it("Deve dar erro ao inserir uma conta com balance menor que 0", async () => {
    const expected = "Validation failed: balance: Saldo da conta não pode ser negativo";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try
    {
      const result = await context.update(originAccount._id, { ...ACCOUNT_INSERT, balance: -1});
    }catch(err){
      messageError = err.message;
    }
   
    assert.deepEqual(messageError, expected);
  });

  
  it("Deve dar erro ao inserir uma sem nome", async () => {
    const expected = "accounts validation failed: name: Path `name` is required.";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try
    {
      const result = await context.insert({balance: 100, agencia: "Modelo", conta:"5555"});
    }catch(err){
      messageError = err.message;
    }   
    assert.deepEqual(messageError, expected);
  });


  it("Deve excluir uma conta pelo id", async () => {
    const expected = { count: 1 }
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    const {deletedCount} = await context.delete(originAccount._id);
    
    assert.deepEqual(deletedCount, expected.count);
  });

  this.afterAll("Exclui a coleção", async () => {
    const connection = MongoDb.connect();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (connection.readyState == 1) {
      connection.db.dropCollection("accounts", function (err, result) {
        console.log("Collection accounts droped", err, result);
      });
    }
  });
});
