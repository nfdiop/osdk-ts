import type { PropertyDef as $PropertyDef } from '@osdk/client';
import { $osdkMetadata } from '../../OntologyMetadata.js';

import type {
  InterfaceDefinition as $InterfaceDefinition,
  ObjectSet as $ObjectSet,
  Osdk as $Osdk,
  PropertyValueWireToClient as $PropType,
} from '@osdk/client';

export type OsdkObjectLinks$SomeInterface = {};

export namespace SomeInterface {
  export type PropertyKeys = 'com.example.dep.spt';

  export interface Props {
    /**
     *   display name: 'Some Property'
     */
    readonly 'com.example.dep.spt': $PropType['string'] | undefined;
  }
  export type StrictProps = Props;

  export interface ObjectSet extends $ObjectSet<SomeInterface, SomeInterface.ObjectSet> {}

  export type OsdkInstance<
    OPTIONS extends never | '$rid' = never,
    K extends keyof SomeInterface.Props = keyof SomeInterface.Props,
  > = $Osdk.Instance<SomeInterface, OPTIONS, K>;

  /** @deprecated use OsdkInstance */
  export type OsdkObject<
    OPTIONS extends never | '$rid' = never,
    K extends keyof SomeInterface.Props = keyof SomeInterface.Props,
  > = OsdkInstance<OPTIONS, K>;
}

export interface SomeInterface extends $InterfaceDefinition {
  osdkMetadata: typeof $osdkMetadata;
  type: 'interface';
  apiName: 'com.example.local.SomeInterface';
  __DefinitionMetadata?: {
    objectSet: SomeInterface.ObjectSet;
    props: SomeInterface.Props;
    linksType: OsdkObjectLinks$SomeInterface;
    strictProps: SomeInterface.StrictProps;
    apiName: 'com.example.local.SomeInterface';
    displayName: 'Sum Interface';
    implements: ['com.example.dep.SomeInterface'];
    links: {};
    properties: {
      /**
       *   display name: 'Some Property'
       */
      'com.example.dep.spt': $PropertyDef<'string', 'nullable', 'single'>;
    };
    rid: 'idk2';
    type: 'interface';
  };
}

export const SomeInterface: SomeInterface = {
  type: 'interface',
  apiName: 'com.example.local.SomeInterface',
  osdkMetadata: $osdkMetadata,
};
