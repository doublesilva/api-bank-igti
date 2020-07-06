import { deepEqual, ok } from "assert";
import AccountServie from "../services/account.service.js";

let service = {};
const accountNum = 120;
let ACCOUNT_PRIVATE = [];
const DEPOSIT_ACCOUNT = {
  agencia: 10,
  conta: 1020,
  name: "Jose Luis Borges",
  balance: 153,
};

const TRANSF_TARGET = {
  agencia: 10,
  conta: 1019,
  name: "Valdete Macedo Souto",
  balance: 426,
};

const TRANSF_SOURCE = {
  agencia: 47,
  conta: 2211,
  name: "Wellington Oliveira Filho",
  balance: 215,
};

describe("Account Service Suite Tests", function () {
  this.timeout(Infinity);

  this.beforeAll(async () => {
    service = await new AccountServie(true);
  });

  it("Deve retornar o número de contas", async () => {
    const expected = 120;
    const actual = await service.getAccountNum();
    deepEqual(actual, expected);
  });

  it("Deve realizar um deposito", async () => {
    const { agencia, conta } = DEPOSIT_ACCOUNT;
    const originBalance = (await service.getBalance(agencia, conta)).balance;
    const valorDeposito = 100;
    const expected = originBalance + valorDeposito;
    const actual = await service.deposit(agencia, conta, valorDeposito);
    deepEqual(actual, expected);
  });

  it("Deve dar erro ao tentar realizar um deposito em uma conta inexistente", async () => {
    const expected = "Agencia e/ou Conta não existe";
    let actual = "";
    try {
      const result = await service.deposit(
        DEPOSIT_ACCOUNT.agencia,
        "4567",
        100
      );
    } catch (error) {
      actual = error.message;
    }

    deepEqual(actual, expected);
  });

  it("Deve realizar um saque em uma conta", async () => {
    const { agencia, conta } = DEPOSIT_ACCOUNT;
    const valorSaque = 50;
    const tarifa = 1;
    const expected =
      (await service.getBalance(agencia, conta)).balance -
      (valorSaque + tarifa);
    const actual = await service.withdraw(agencia, conta, valorSaque);
    deepEqual(actual, expected);
  });

  it("Deve dar erro ao tentar realizar um saque e o saldo ficar negativo", async () => {
    const { agencia, conta } = DEPOSIT_ACCOUNT;
    const originBalance = (await service.getBalance(agencia, conta)).balance;
    const valorSaque = originBalance;
    const tarifa = 1;
    const expected =
      "Saque não realizado: conta não pode ficar com saldo negativo.";
    let actual = "";
    try {
      const result = await service.withdraw(agencia, conta, valorSaque);
    } catch (error) {
      actual = error.message;
    }
    deepEqual(actual, expected);
  });

  it("Deve retornar o valor do saldo da conta", async () => {
    const { agencia, conta } = DEPOSIT_ACCOUNT;
    const { balance } = await service.getBalance(agencia, conta);
    ok(balance > 0);
  });

  it("Deve dar erro ao consultar o saldo de uma conta inexistente", async () => {
    const expected = "Agencia e/ou Conta não existe";
    const { agencia } = DEPOSIT_ACCOUNT;
    let actual = "";

    try {
      const { balance } = await service.getBalance(agencia, "45402");
    } catch (error) {
      actual = error.message;
    }
    deepEqual(actual, expected);
  });

  it("Deve excluir uma conta de uma agencia retornando o número de contas ativas dessa agencia", async () => {
    const { agencia, conta } = DEPOSIT_ACCOUNT;
    const expected = (await service.getAccountByAgency(agencia)).length - 1;
    const actual = await service.excludeAccount(agencia, conta);

    deepEqual(actual, expected);
  });

  it("Deve realizar transferências entre contas", async () => {
    const {
      balance: sourceBalance,
      conta: sourceAccount,
      agencia: sourceAgency,
    } = await service.getAccount(TRANSF_SOURCE.conta);
    const {
      conta: targetAccount,
      agencia: targetAgency,
    } = await service.getAccount(TRANSF_TARGET.conta);

    const valueTranf = 207;
    const expected =
      sourceBalance - (valueTranf + (sourceAgency !== targetAgency ? 8 : 0));
    const actual = await service.transfer(
      sourceAccount,
      targetAccount,
      valueTranf
    );

    deepEqual(actual, expected);
  });

  it("Deve retornar a media do saldo por agencia", async () => {
    const accounts = await service.getAccountByAgency(TRANSF_TARGET.agencia);
    const result = accounts.reduce(
      (acumulador, atual) => (acumulador += atual.balance),
      0
    );
    const expected = result / accounts.length;
    const actual = await service.balanceAvgByAgency(TRANSF_TARGET.agencia);
    deepEqual(actual, expected);
  });

  it("Deve retornar x clientes com o menor saldo", async () => {
    const expected = 5;
    const accounts = await service.getLowestBalanceCustomer(expected);
    const actual = accounts.length;
    deepEqual(actual, expected);
  });

  it("Deve retornar x clientes com o maior saldo", async () => {
    const expected = 5;
    const accounts = await service.getHighestBalanceCustomer(expected);
    const actual = accounts.length;
    deepEqual(actual, expected);
  });

  it("Deve tranferir o cliente com maior saldo por agencia para agencia private", async () => {
    const expected = 99;
    ACCOUNT_PRIVATE = await service.tranfCustomerWithHighestBalance();
    const accounts = await service.getAccountByAgency(99);
    const [{ agencia: actual }] = accounts;
    deepEqual(actual, expected);
    deepEqual(accounts.length, ACCOUNT_PRIVATE.length);
  });
});
