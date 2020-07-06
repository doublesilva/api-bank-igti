import Joi from "@hapi/joi";
import Boom from "@hapi/boom";
import BaseRoutes from "../routes/base/base.routes.js";

const failAction = (request, header, error) => {
    throw error;
};

export default class AccountRoute extends BaseRoutes {
  constructor(service) {
    super();
    this._service = service;
  }

  list() {
    return {
      path: "/account/{agency}",
      method: "GET",
      options: {
        description: "Get list agency by agency number",
        notes: "Returns a list agency by the agency number passed in the path",
        tags: ["api"],
        validate: {
          failAction,
          params: Joi.object({
            agency: Joi.number().required().min(0).description("agency number"),
          }),
        },
      },
      handler: async (request, h) => {
        const { agency } = request.params;
        return await this._service.getAccountByAgency(agency);
      },
    };
  }

  deposit() {
    return {
      method: "POST",
      path: "/account/deposit",
      options: {        
        handler: async (request) => { 
          const { agencyNumber, accountNumber, amount} =  request.payload;
          try{
            const result = await this._service.deposit(agencyNumber, accountNumber, amount);
            return result;
          }catch(error){
              return Boom.preconditionFailed(`It's Bad ${error.message}`);              
          }
        },
        description: "Register a deposit in an account",
        notes:
          "Register a deposit in an account by passing an agency, account and amount and return the balance",
        tags: ["api"], // ADD THIS TAG
        validate: {
          payload: Joi.object({
            agencyNumber: Joi.number().required().description("the agency number"),
            accountNumber: Joi.number()
              .required()
              .description("the account number"),
            amount: Joi.number().required().description("the amount"),
          }),
        },
      },
    };
  }

  withdraw() {
    return {
      method: "POST",
      path: "/account/withdraw",
      options: {
        handler: async (request) => {
            const { agencyNumber, accountNumber, amount} =  request.payload;
            try{
              const result = await this._service.withdraw(agencyNumber, accountNumber, amount);
              return result;
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);              
            }
        },
        description: "Register a withdraw in an account",
        notes: "Register a withdraw in an account passing an agency, account and amount and return the balance less fees",
        tags: ["api"], // ADD THIS TAG
        validate: {
          payload: Joi.object({
            agencyNumber: Joi.number().required().description("the agency number"),
            accountNumber: Joi.number().required().description("the account number"),
            amount: Joi.number().required().description("the amount"),
          }),
        },
      },
    };
  }

  balance() {
    return {
      method: "GET",
      path: "/account/balance/{agency}/{account}",
      options: {
        handler: async (request) => {
            const { agency, account } = request.params;
            try{
                const { balance } = await this._service.getBalance(agency, account);
                return balance;
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Get todo",
        notes: "Returns balance by the agency and account number  passed in the path",
        tags: ["api"], // ADD THIS TAG
        validate: {
          params: Joi.object({
            agency: Joi.number().required().label('agency number').description("the agency number"),
            account: Joi.number().required().label('account number').description("the account number"),
          }),
        },
      },
    };    
  }

  remove() {
    return {
      method: "DELETE",
      path: "/account/remove/{agency}/{account}",
      options: {
        handler: async (request) => {
            const { agency, account } = request.params;
            try{
                return await this._service.excludeAccount(agency, account);                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Get todo",
        notes: "Returns balance by the agency and account number  passed in the path",
        tags: ["api"], // ADD THIS TAG
        validate: {
          params: Joi.object({
            agency: Joi.number().required().label('agency number').description("the agency number"),
            account: Joi.number().required().label('account number').description("the account number"),
          }),
        },
      },
    };    
  }

  transfer() {
    return {
      method: "POST",
      path: "/account/transfer",
      options: {
        handler: async (request) => {
            const { sourceAccount, targetAccount, amount } = request.payload;
            try{
                return await this._service.transfer(sourceAccount, targetAccount, amount);                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Transfer between accounts",
        notes: "Transfer between accounts passing source and target account and amount. Return the balance source account less fees",
        tags: ["api"], // ADD THIS TAG
        validate: {
          payload: Joi.object({
            sourceAccount: Joi.number().required().label('source account').description("the source account number"),
            targetAccount: Joi.number().required().label('target account').description("the target account number"),
            amount: Joi.number().required().label('amount').description("the amount")
          }),
        },
      },
    };    
  }

  averageBalance() {
    return {
      method: "GET",
      path: "/account/average-balance/{agency}",
      options: {
        handler: async (request) => {
            const { agency } = request.params;
            try{
                return await this._service.balanceAvgByAgency(agency);                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Returns average balance by agency",
        notes: "Receives the agency number and returns the average account balance",
        tags: ["api"], // ADD THIS TAG
        validate: {
          params: Joi.object({
            agency: Joi.number().required().label('agency number').description("the agency number"),
            }),
        },
      },
    };    
  }

  lowestBalance() {
    return {
      method: "GET",
      path: "/account/lowest-balance/{limit}",
      options: {
        handler: async (request) => {
            const { limit } = request.params;
            try{
                return await this._service.getLowestBalanceCustomer(limit);                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Returns lowest balance account passing limit the accounts",
        notes: "Receives the agency number and returns the average account balance",
        tags: ["api"], // ADD THIS TAG
        validate: {
          params: Joi.object({
            limit: Joi.number().required().label('limit').description("the return limit number"),
            }),
        },
      },
    };    
  }

  highestBalance() {
    return {
      method: "GET",
      path: "/account/highest-balance/{limit}",
      options: {
        handler: async (request) => {
            const { limit } = request.params;
            try{
                return await this._service.getHighestBalanceCustomer(limit);                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Returns highest balance account passing limit the accounts",
        notes: "Receives the agency number and returns the average account balance",
        tags: ["api"], // ADD THIS TAG
        validate: {
          params: Joi.object({
            limit: Joi.number().required().label('limit').description("the return limit number"),
            }),
        },
      },
    };    
  }

  transferWithHighestBalance() {
    return {
      method: "POST",
      path: "/account/transfer-highest-balance",
      options: {
        handler: async (request) => {
            const { limit } = request.params;
            try{
                return await this._service.tranfCustomerWithHighestBalance();                
            }catch(error){
                return Boom.preconditionFailed(`It's Bad ${error.message}`);
            }
        },
        description: "Transfer the customers with highest balance",
        notes: "Transfer the customers with highest balance. Returns the list of customers transferred to the private agency",
        tags: ["api"]        
      },
    };    
  }
}