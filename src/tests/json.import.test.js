import { deepEqual }  from "assert";
import FileJsonImport from "../helpers/file.json.helper.js";
import DbContextHelper from "../helpers/db.context.helper.js";
import AccountSchema from "../db/mongo/schema/account.schema.js";

let jsonData = [];
let numRegisters = 120;
let context = {};
describe("Import Json to mongodb Suite Tests", function () {
  this.timeout(Infinity);

  this.beforeAll("Cria uma conexão com o banco", async () => {
    context = await DbContextHelper.getMongodbContext(AccountSchema);
    await context.deleteMany();
  });

  it("Verfica conexão", async () => {
    const expected = "Connected";
    const state = await context.isConnected();
    deepEqual(state, expected);
  });

  it("Deve retornar um array de objetos json", async () => {
    const expected = numRegisters;
    jsonData = await FileJsonImport.getJson("json-data/accounts.json");
    deepEqual(jsonData.length, expected);
  });

  it("Deve cadastrar os itens no banco", async () => {
    await context.insertMany(jsonData);
    const result = await context.read();
    deepEqual(result.length, jsonData.length);
  }); 
});
