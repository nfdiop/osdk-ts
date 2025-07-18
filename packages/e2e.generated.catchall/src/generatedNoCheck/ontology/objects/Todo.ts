import type { PropertyDef as $PropertyDef } from '@osdk/client';
import { $osdkMetadata } from '../../OntologyMetadata.js';
import type { $ExpectedClientVersion } from '../../OntologyMetadata.js';
import type { Person } from './Person.js';
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

export namespace Todo {
  export type PropertyKeys = 'id' | 'body' | 'text' | 'priority' | 'complete';

  export interface Links {
    readonly Assignee: $SingleLinkAccessor<Person>;
  }

  export interface Props {
    /**
     *   display name: 'Body',
     *   description: The text of the todo
     */
    readonly body: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly complete: $PropType['boolean'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly id: $PropType['integer'];
    /**
     * (no ontology metadata)
     */
    readonly priority: $PropType['integer'] | undefined;
    /**
     *   display name: 'Text'
     */
    readonly text: $PropType['string'] | undefined;
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<Todo, Todo.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof Todo.Props = keyof Todo.Props,
  > = $Osdk.Instance<Todo, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof Todo.Props = keyof Todo.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface Todo extends $ObjectTypeDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'object';
  apiName: 'Todo';
  __DefinitionMetadata?: {
    objectSet: Todo.ObjectSet;
    props: Todo.Props;
    linksType: Todo.Links;
    strictProps: Todo.StrictProps;
    apiName: 'Todo';
    description: 'Its a todo item.';
    displayName: 'AwesomeTodoDisplayname';
    icon: {
      type: 'blueprint';
      name: 'todo';
      color: 'color';
    };
    interfaceMap: {};
    inverseInterfaceMap: {};
    links: {
      Assignee: $ObjectMetadata.Link<Person, false>;
    };
    pluralDisplayName: 'AwesomeTodoDisplayname';
    primaryKeyApiName: 'id';
    primaryKeyType: 'integer';
    properties: {
      /**
       *   display name: 'Body',
       *   description: The text of the todo
       */
      body: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      complete: $PropertyDef<'boolean', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      id: $PropertyDef<'integer', 'non-nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      priority: $PropertyDef<'integer', 'nullable', 'single'>;
      /**
       *   display name: 'Text'
       */
      text: $PropertyDef<'string', 'nullable', 'single'>;
    };
    rid: 'rid.a.b.c.d';
    status: 'ACTIVE';
    titleProperty: 'body';
    type: 'object';
  };
}

export const Todo: Todo = {
  type: 'object',
  apiName: 'Todo',
  osdkMetadata: $osdkMetadata,
};
