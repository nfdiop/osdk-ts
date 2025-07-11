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

export namespace DherlihyComplexObject {
  export type PropertyKeys = 'id' | 'secret' | 'seriesId';

  export type Links = {};

  export interface Props {
    /**
     * (no ontology metadata)
     */
    readonly id: $PropType['string'];
    /**
     * (no ontology metadata)
     */
    readonly secret: $PropType['string'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly seriesId: $PropType['numericTimeseries'] | undefined;
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<DherlihyComplexObject, DherlihyComplexObject.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof DherlihyComplexObject.Props = keyof DherlihyComplexObject.Props,
  > = $Osdk.Instance<DherlihyComplexObject, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof DherlihyComplexObject.Props = keyof DherlihyComplexObject.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface DherlihyComplexObject extends $ObjectTypeDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'object';
  apiName: 'DherlihyComplexObject';
  __DefinitionMetadata?: {
    objectSet: DherlihyComplexObject.ObjectSet;
    props: DherlihyComplexObject.Props;
    linksType: DherlihyComplexObject.Links;
    strictProps: DherlihyComplexObject.StrictProps;
    apiName: 'DherlihyComplexObject';
    description: 'Dherlihy Complex Object';
    displayName: 'Dherlihy Complex Object';
    icon: {
      type: 'blueprint';
      name: 'dherlihy';
      color: 'color';
    };
    interfaceMap: {};
    inverseInterfaceMap: {};
    links: {};
    pluralDisplayName: 'Dherlihy Complex Objects';
    primaryKeyApiName: 'id';
    primaryKeyType: 'string';
    properties: {
      /**
       * (no ontology metadata)
       */
      id: $PropertyDef<'string', 'non-nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      secret: $PropertyDef<'string', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      seriesId: $PropertyDef<'numericTimeseries', 'nullable', 'single'>;
    };
    rid: 'rid.a.b.c.d';
    status: 'ACTIVE';
    titleProperty: 'id';
    type: 'object';
  };
}

export const DherlihyComplexObject: DherlihyComplexObject = {
  type: 'object',
  apiName: 'DherlihyComplexObject',
  osdkMetadata: $osdkMetadata,
};
