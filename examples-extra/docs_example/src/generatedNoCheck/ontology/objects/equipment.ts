import type { PropertyDef as $PropertyDef } from '@osdk/client';
import { $osdkMetadata } from '../../OntologyMetadata.js';
import type { $ExpectedClientVersion } from '../../OntologyMetadata.js';
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

export namespace equipment {
  export type PropertyKeys = 'equipmentId' | 'type';

  export type Links = {};

  export interface Props {
    /**
     *   description: The id of an equipment
     */
    readonly equipmentId: $PropType['string'];
    /**
     * (no ontology metadata)
     */
    readonly type: $PropType['string'] | undefined;
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<equipment, equipment.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof equipment.Props = keyof equipment.Props,
  > = $Osdk.Instance<equipment, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof equipment.Props = keyof equipment.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface equipment extends $ObjectTypeDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'object';
  apiName: 'equipment';
  __DefinitionMetadata?: {
    objectSet: equipment.ObjectSet;
    props: equipment.Props;
    linksType: equipment.Links;
    strictProps: equipment.StrictProps;
    apiName: 'equipment';
    displayName: 'Equipment';
    icon: {
      type: 'blueprint';
      name: 'equipment';
      color: 'blue';
    };
    interfaceMap: {};
    inverseInterfaceMap: {};
    links: {};
    pluralDisplayName: 'Equipment';
    primaryKeyApiName: 'equipmentId';
    primaryKeyType: 'string';
    properties: {
      /**
       *   description: The id of an equipment
       */
      equipmentId: $PropertyDef<'string', 'non-nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      type: $PropertyDef<'string', 'nullable', 'single'>;
    };
    rid: 'ri.ontology.main.object-type.808ac022-89eb-4591-8b7e-1a912b9efb45';
    status: 'ACTIVE';
    titleProperty: 'equipmentId';
    type: 'object';
  };
}

export const equipment: equipment = {
  type: 'object',
  apiName: 'equipment',
  osdkMetadata: $osdkMetadata,
};
