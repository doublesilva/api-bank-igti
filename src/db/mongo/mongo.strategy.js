const Mongoose = require("mongoose");
const IDb = require("../base/interface.db");

const Status = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

class MongoDb extends IDb {
  constructor(connection, schema) {
    super();
    this._connection = connection;
    this._collection = schema;
  }

  static connect() {
    
    Mongoose.connect(process.env.MONGODB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    const connection = Mongoose.connection;
    return connection;
  }
  async isConnected() {
    const state = Status[this._connection.readyState];
    if (state == !Status[2] || state === Status[1]) return state;

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return Status[this._connection.readyState];
  }

  async insert(entity) {
    return await this._collection.create(entity);
  }

  async read(filter = {}) {
    return await this._collection.find(filter);
  }

  async update(id, entity) {
    return await this._collection.updateOne({ _id: id }, { $set: entity }, { runValidators: true });
  }

  async delete(id) {
    return await this._collection.deleteOne({ _id: id });
  }
}

module.exports = MongoDb;
