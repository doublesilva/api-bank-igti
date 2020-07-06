class NotImplementExceptions extends Error{
    constructor(){
        super('Método não implementado!!')
    }
}

export default class IDb{
    insert(entity){
        throw new NotImplementExceptions();
    }

    read(filter){
        throw new NotImplementExceptions();
    }

    update(id, entity){
        throw new NotImplementExceptions();
    }

    delete(id){
        throw new NotImplementExceptions();
    }


}