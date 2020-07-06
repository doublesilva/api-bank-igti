import DbContextHelper from "../helpers/db.context.helper.js";
import AccountSchema from "../db/mongo/schema/account.schema.js";
import FileJsonImport from "../helpers/file.json.helper.js";

export default class AccountServie {
  //_mongo = {};
  constructor(hasLoadAccount = false) {
    return (async () => {
      this._context = await DbContextHelper.getMongodbContext(AccountSchema);
      if (hasLoadAccount) await this._loadAccounts();
      return this;
    })();
  }

  async _loadAccounts() {
    const accounts = await FileJsonImport.getJson("json-data/accounts.json");
    await this._context.deleteMany();
    await this._context.insertMany(accounts);
  }

  async _existsAccount(agencia, conta) {
    const result = await this._context.read({ agencia, conta });
    return result.length > 0;
  }

  async getAccountNum() {
    const result = await this._context.read();
    return result.length;
  }

  async save(account) {
    const { agencia, conta } = account;
    let wasModified = false;
    try {
      const { _id } = await this.getAccount(conta);
      const wasModified = await this._context.update(_id, account);
    } catch (error) {
      if (error.message === "Agencia e/ou Conta não existe")
        wasModified = (await this._context.insert(account))
          ? true
          : false;
    }

    return wasModified;
  }

  async getBalance(agencia, conta) {
    const [result] = await this._context.read({
      agencia,
      conta,
    });
    if (!result) throw new Error("Agencia e/ou Conta não existe");
    const { _id, balance } = result;
    return { _id, balance };
  }

  async _updateBalance(id, balance) {
    const wasModified = await this._context.update(id, { balance });
    return wasModified ? balance : -1;
  }

  async getAccountByAgency(agencia) {
    return await this._context.read({ agencia });
  }

  async getAccount(conta) {
    const [account] = await this._context.read({ conta });
    if (!account) throw new Error("Agencia e/ou Conta não existe");
    return account;
  }

  async excludeAccount(agencia, conta) {
    let { _id } = await this.getBalance(agencia, conta);
    await this._context.delete(_id);
    return (await this.getAccountByAgency(agencia)).length;
  }

  async deposit(agencia, conta, deposito) {
    let { _id, balance } = await this.getBalance(agencia, conta);
    balance += +deposito;
    return this._updateBalance(_id, balance);
  }

  async transfer(sourceAccount, targetAccount, transferValue) {
    const { agencia: sourceAgency } = await this.getAccount(sourceAccount);
    const { agencia: targetAgency } = await this.getAccount(targetAccount);
    const value = transferValue + (sourceAgency !== targetAgency ? 7 : -1);
    const actualSource = await this.withdraw(
      sourceAgency,
      sourceAccount,
      value
    );

    await this.deposit(targetAgency, targetAccount, transferValue);
    return actualSource;
  }

  async withdraw(agencia, conta, saque) {
    let { _id, balance } = await this.getBalance(agencia, conta);
    balance -= saque + 1;
    if (balance < 0) {
      throw new Error(
        "Saque não realizado: conta não pode ficar com saldo negativo."
      );
    }
    return this._updateBalance(_id, balance);
  }

  async balanceAvgByAgency(agencia) {
    const accounts = await this.getAccountByAgency(agencia);
    const total = accounts.reduce(
      (acumulador, atual) => (acumulador += atual.balance),
      0
    );
    return total / accounts.length;
  }

  async getLowestBalanceCustomer(limit) {
    const accounts = await this._context.read();
    return accounts
      .map((account) => {
        return {
          agencia: account.agencia,
          conta: account.conta,
          balance: account.balance,
        };
      })
      .sort((a, b) => a.balance - b.balance)
      .splice(0, limit);
  }

  async getHighestBalanceCustomer(limit) {
    const accounts = await this._context.read();
    const result = accounts
      .map((account) => {
        return {
          agencia: account.agencia,
          name: account.name,
          conta: account.conta,
          balance: account.balance,
        };
      })
      .sort((a, b) => {
        if (b.balance < a.balance) return -1;
        if (b.balance > a.balance) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
      })
      .splice(0, limit);
    return result;
  }
  async tranfCustomerWithHighestBalance(){
    const accounts = await this._context.read();
    let customers = [];
    const agencias = accounts.reduce((acumulador, atual) => {       
       return acumulador.includes(atual.agencia) ? acumulador : [...acumulador, atual.agencia];
       }, []);
       
      for (const agencia of agencias) {
          var [customer] = accounts.filter(account => account.agencia === agencia).sort((a, b) => b.balance - a.balance);
          
          var newCustomer = {...customer.toObject(), agencia: "99"};          
          await this.save(newCustomer);
      }
      return await this.getAccountByAgency(99);
  }
}