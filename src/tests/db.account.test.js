import {deepEqual} from "assert";
import AccountSchema from "../db/mongo/schema/account.schema.js";
import DbContextHelper from "../helpers/db.context.helper.js";


const ACCOUNT_INSERT = {
  agencia: 10,
  conta: 1020,
  name: "Jose Luis Borges",
  balance: 153,
};

const ACCOUNT_UPDATE = {
  name: "Diego Silva",
  balance: 100,
};

let context = {};
let ID_INSERTED = {};

describe("MongoDb Account Suite Tests", function () {
  this.timeout(Infinity);

  this.beforeAll("Cria uma conexão", async () => {
    context = await DbContextHelper.getMongodbContext(AccountSchema);
    context.deleteMany();
  });

  it("Verfica conexão", async () => {
    const expected = "Connected";
    const state = await context.isConnected();
    deepEqual(state, expected);
  });

  it("Deve cadastrar uma conta", async () => {
    const expected = ACCOUNT_INSERT;
    const { name, balance, conta, agencia } = await context.insert(
      ACCOUNT_INSERT
    );
    const actual = { name, balance, conta, agencia };
    deepEqual(actual, expected);
  });

  it("Deve alterar o nome de uma conta", async () => {
    const expected = { ...ACCOUNT_INSERT, ...ACCOUNT_UPDATE };
    const [originAccount] = await context.read({
      name: ACCOUNT_INSERT.name,
    });
    const wasUpdated = await context.update(
      originAccount._id,
      ACCOUNT_UPDATE
    );
    const [{ name, balance, conta, agencia }] = await context.read({
      _id: originAccount._id,
    });
    const actual = { name, balance, conta, agencia };
    deepEqual(wasUpdated, 1);
    deepEqual(actual, expected);
  });

  it("Deve retornar uma conta pelo nome", async () => {
    const expected = { count: 1, name: ACCOUNT_UPDATE.name };
    const actual = await context.read({ name: ACCOUNT_UPDATE.name });

    deepEqual(actual.length, expected.count);
    deepEqual(actual[0].name, expected.name);
  });

  it("Deve dar erro ao atualizar uma conta com balance menor que 0", async () => {
    const expected =
      "Validation failed: balance: Saldo da conta não pode ser negativo";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try {
      const result = await context.update(originAccount._id, {
        balance: -1,
      });
    } catch (err) {
      messageError = err.message;
    }

    deepEqual(messageError, expected);
  });

  it("Deve dar erro ao inserir uma conta com balance menor que 0", async () => {
    const expected =
      "Validation failed: balance: Saldo da conta não pode ser negativo";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try {
      const result = await context.update(originAccount._id, {
        ...ACCOUNT_INSERT,
        balance: -1,
      });
    } catch (err) {
      messageError = err.message;
    }

    deepEqual(messageError, expected);
  });

  it("Deve dar erro ao inserir uma conta sem nome", async () => {
    const expected =
      "accounts validation failed: name: Path `name` is required.";
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    let messageError;
    try {
      const result = await context.insert({
        balance: 100,
        agencia: 9999,
        conta: 5555,
      });
    } catch (err) {
      messageError = err.message;
    }
    deepEqual(messageError, expected);
  });

  it("Deve excluir uma conta pelo id", async () => {
    const expected = { count: 1 };
    const [originAccount] = await context.read(ACCOUNT_UPDATE);
    const { deletedCount } = await context.delete(originAccount._id);

    deepEqual(deletedCount, expected.count);
  });  
});
