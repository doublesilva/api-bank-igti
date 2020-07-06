import Context from "../db/base/context.strategy.js";
import MongoDb from "../db/mongo/mongo.strategy.js";

export default class DbContextHelper {
  constructor() {}

  static async getMongodbContext(schema) {
    const connection = MongoDb.connect();
    const context = new Context(new MongoDb(connection, schema));

    await context.isConnected();

    return context;
  }
}