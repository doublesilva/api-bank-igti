const IDb = require("./interface.db");

class ContextStrategy extends IDb{
    constructor(database){
        super();
        this._database = database;
    }

    connect(){
        return this._database.connect();
    }

    isConnected(){
        return this._database.isConnected();
    }

    insert(entity){
        return this._database.insert(entity);
    }

    read(filter){
        return this._database.read(filter);
    }

    update(id, entity, upset = false){
        return this._database.update(id, entity, upset);
    }
    
    delete(id){
        return this._database.delete(id);
    }
}

module.exports = ContextStrategy;