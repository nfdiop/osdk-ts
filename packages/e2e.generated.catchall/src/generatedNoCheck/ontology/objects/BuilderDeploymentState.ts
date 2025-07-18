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

export namespace BuilderDeploymentState {
  export type PropertyKeys = 'skuId' | 'date' | 'currentTimestamp';

  export type Links = {};

  export interface Props {
    /**
     * (no ontology metadata)
     */
    readonly currentTimestamp: $PropType['timestamp'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly date: $PropType['datetime'] | undefined;
    /**
     * (no ontology metadata)
     */
    readonly skuId: $PropType['string'];
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<BuilderDeploymentState, BuilderDeploymentState.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof BuilderDeploymentState.Props = keyof BuilderDeploymentState.Props,
  > = $Osdk.Instance<BuilderDeploymentState, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof BuilderDeploymentState.Props = keyof BuilderDeploymentState.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface BuilderDeploymentState extends $ObjectTypeDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'object';
  apiName: 'BuilderDeploymentState';
  __DefinitionMetadata?: {
    objectSet: BuilderDeploymentState.ObjectSet;
    props: BuilderDeploymentState.Props;
    linksType: BuilderDeploymentState.Links;
    strictProps: BuilderDeploymentState.StrictProps;
    apiName: 'BuilderDeploymentState';
    description: 'Builder Deployment State';
    displayName: 'BuilderDeploymentState';
    icon: {
      type: 'blueprint';
      name: 'builder';
      color: 'color';
    };
    interfaceMap: {};
    inverseInterfaceMap: {};
    links: {};
    pluralDisplayName: 'Builder Deployment States';
    primaryKeyApiName: 'skuId';
    primaryKeyType: 'string';
    properties: {
      /**
       * (no ontology metadata)
       */
      currentTimestamp: $PropertyDef<'timestamp', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      date: $PropertyDef<'datetime', 'nullable', 'single'>;
      /**
       * (no ontology metadata)
       */
      skuId: $PropertyDef<'string', 'non-nullable', 'single'>;
    };
    rid: 'rid.a.b.c.d';
    status: 'ACTIVE';
    titleProperty: 'skuId';
    type: 'object';
  };
}

export const BuilderDeploymentState: BuilderDeploymentState = {
  type: 'object',
  apiName: 'BuilderDeploymentState',
  osdkMetadata: $osdkMetadata,
};
