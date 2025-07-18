import type {
  ActionDefinition,
  ActionMetadata,
  ActionParam,
  ActionReturnTypeForOptions,
  ApplyActionOptions,
  ApplyBatchActionOptions,
} from '@osdk/client';
import { $osdkMetadata } from '../../OntologyMetadata.js';
import type { Employee } from '../objects/Employee.js';
import type { Venture } from '../objects/Venture.js';

export namespace assignEmployee1 {
  // Represents the definition of the parameters for the action
  export type ParamsDefinition = {
    'employee-1': {
      multiplicity: false;
      nullable: false;
      type: ActionMetadata.DataType.Object<Employee>;
    };
    'venture-1': {
      multiplicity: false;
      nullable: false;
      type: ActionMetadata.DataType.Object<Venture>;
    };
  };

  /**
   * Assigns an employee to a venture
   */
  export interface Params {
    readonly 'employee-1': ActionParam.ObjectType<Employee>;

    readonly 'venture-1': ActionParam.ObjectType<Venture>;
  }

  // Represents a fqn of the action
  export interface Signatures {
    /**
     * Assigns an employee to a venture
     */
    applyAction<OP extends ApplyActionOptions>(
      args: assignEmployee1.Params,
      options?: OP,
    ): Promise<ActionReturnTypeForOptions<OP>>;

    batchApplyAction<OP extends ApplyBatchActionOptions>(
      args: ReadonlyArray<assignEmployee1.Params>,
      options?: OP,
    ): Promise<ActionReturnTypeForOptions<OP>>;
  }
}

/**
 * Assigns an employee to a venture
 * @param {ActionParam.ObjectType<Employee>} employee-1
 * @param {ActionParam.ObjectType<Venture>} venture-1
 */
export interface assignEmployee1 extends ActionDefinition<assignEmployee1.Signatures> {
  __DefinitionMetadata?: {
    apiName: 'assignEmployee1';
    description: 'Assigns an employee to a venture';
    modifiedEntities: {
      Employee: {
        created: false;
        modified: true;
      };
    };
    parameters: assignEmployee1.ParamsDefinition;
    rid: 'ri.a.b.c.d';
    status: 'ACTIVE';
    type: 'action';

    signatures: assignEmployee1.Signatures;
  };
  apiName: 'assignEmployee1';
  type: 'action';
  osdkMetadata: typeof $osdkMetadata;
}

export const assignEmployee1: assignEmployee1 = {
  apiName: 'assignEmployee1',
  type: 'action',
  osdkMetadata: $osdkMetadata,
};
