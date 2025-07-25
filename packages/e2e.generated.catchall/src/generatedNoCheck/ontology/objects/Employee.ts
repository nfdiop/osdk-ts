import type { PropertyDef as $PropertyDef } from '@osdk/client';
import { $osdkMetadata } from '../../OntologyMetadata.js';
import type { $ExpectedClientVersion } from '../../OntologyMetadata.js';
import type { Venture } from './Venture.js';
import type {
  PropertyKeys as $PropertyKeys,
  ObjectTypeDefinition as $ObjectTypeDefinition,
  ObjectMetadata as $ObjectMetadata,
} from '@osdk/client';
import type {
  ObjectSet as $ObjectSet,
  Osdk as $Osdk,
  OsdkObject as $OsdkObject,
  PropertyValueWireToClient as $PropType,
  SingleLinkAccessor as $SingleLinkAccessor,
} from '@osdk/client';

export namespace Employee {
  export type PropertyKeys =
    | 'id'
    | 'firstName'
    | 'email'
    | 'adUsername'
    | 'locationName'
    | 'locationCity'
    | 'firstFullTimeStartDate'
    | 'businessTitle'
    | 'employeeNumber'
    | 'jobProfile'
    | 'locationType'
    | 'favPlace';

  export interface Links {
    readonly lead: $SingleLinkAccessor<Employee>;
    readonly peeps: Employee.ObjectSet;
    readonly ventures: Venture.ObjectSet;
  }

  export interface Props {
    /**
     * (no ontology metadata)
     */
    readonly adUsername: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly businessTitle: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly email: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly employeeNumber: $PropType['double'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly favPlace: $PropType['geopoint'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly firstFullTimeStartDate: $PropType['datetime'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly firstName: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly id: $PropType['string'];
    /**
     * (no ontology metadata)
     */
    readonly jobProfile: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly locationCity: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly locationName: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly locationType: $PropType['string'] | undefined;
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<Employee, Employee.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof Employee.Props = keyof Employee.Props,
  > = $Osdk.Instance<Employee, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof Employee.Props = keyof Employee.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface Employee extends $ObjectTypeDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'object';
  apiName: 'Employee';
  __DefinitionMetadata?: {
    objectSet: Employee.ObjectSet;
    props: Employee.Props;
    linksType: Employee.Links;
    strictProps: Employee.StrictProps;
    apiName: 'Employee';
    description: 'An employee';
    displayName: 'Employee';
    icon: {
      type: 'blueprint';
      name: 'color';
      color: 'color';
    };
    implements: ['FooInterface'];
    interfaceMap: {
      FooInterface: {
        name: 'firstName';
        description: 'email';
      };
    };
    inverseInterfaceMap: {
      FooInterface: {
        firstName: 'name';
        email: 'description';
      };
    };
    links: {
      lead: $ObjectMetadata.Link<Employee, false>;
      peeps: $ObjectMetadata.Link<Employee, true>;
      ventures: $ObjectMetadata.Link<Venture, true>;
    };
    pluralDisplayName: 'Employees';
    primaryKeyApiName: 'id';
    primaryKeyType: 'string';
    properties: {
      /**
       * (no ontology metadata)
       */
      adUsername: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      businessTitle: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      email: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      employeeNumber: $PropertyDef<'double', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      favPlace: $PropertyDef<'geopoint', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      firstFullTimeStartDate: $PropertyDef<'datetime', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      firstName: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      id: $PropertyDef<'string', 'non-nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      jobProfile: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      locationCity: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      locationName: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      locationType: $PropertyDef<'string', 'nullable', 'single'>;
    };
    rid: 'rid.a.b.c.d';
    status: 'ACTIVE';
    titleProperty: 'firstName';
    type: 'object';
  };
}

export const Employee: Employee = {
  type: 'object',
  apiName: 'Employee',
  osdkMetadata: $osdkMetadata,
};
