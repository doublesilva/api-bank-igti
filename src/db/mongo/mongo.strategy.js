import Mongoose from "mongoose";
import IDb from "../base/interface.db.js";

const Status = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

export default class MongoDb extends IDb {
  constructor(connection, schema) {
    super();
    this._connection = connection;
    this._collection = schema;
  }

  static connect() {
    Mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const connection = Mongoose.connection;
    return connection;
  }
  async isConnected() {
    const state = Status[this._connection.readyState];
    if (state == !Status[2] || state === Status[1]) return state;

    await new Promise((resolve) =>
      setTimeout(resolve, process.env.TIME_TO_MONGODB_CONNECTED)
    );
    return Status[this._connection.readyState];
  }

  async insert(entity) {
    return await this._collection.create(entity);
  }

  async insertMany(enities) {
    await this._collection.collection.insertMany(enities);
  }

  async read(filter = {}) {
    const result = await this._collection.find(filter);
    return result;
  }

  async update(id, entity) {
    const { nModified } = await this._collection.updateOne(
      { _id: id },
      { $set: entity },
      { runValidators: true }
    );
    return nModified > 0;
  }

  async delete(id) {
    return await this._collection.deleteOne({ _id: id });
  }

  async deleteMany(filter = {}) {
    return await this._collection.collection.deleteMany(filter);
  }
}