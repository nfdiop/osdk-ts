/*
 * Copyright 2023 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ObjectTypeFullMetadata } from "@osdk/foundry.ontologies";
import { wireObjectTypeFullMetadataToSdkObjectMetadata } from "@osdk/generator-converters";
import consola from "consola";
import type { EnhancedInterfaceType } from "../GenerateContext/EnhancedInterfaceType.js";
import { EnhancedObjectType } from "../GenerateContext/EnhancedObjectType.js";
import type { EnhancedOntologyDefinition } from "../GenerateContext/EnhancedOntologyDefinition.js";
import { ForeignType } from "../GenerateContext/ForeignType.js";
import type { GenerateContext } from "../GenerateContext/GenerateContext.js";
import { getObjectImports } from "../shared/getObjectImports.js";
import { propertyJsdoc } from "../shared/propertyJsdoc.js";
import { deleteUndefineds } from "../util/deleteUndefineds.js";
import { stringify } from "../util/stringify.js";

/** @internal */
export function wireObjectTypeV2ToSdkObjectConstV2(
  wireObject: ObjectTypeFullMetadata,
  { ontology, forInternalUse }: Pick<
    GenerateContext,
    "ontology" | "forInternalUse"
  >,
  currentFilePath: string,
) {
  const object = ontology.requireObjectType(
    wireObject.objectType.apiName,
    true,
  );
  if (object instanceof ForeignType) {
    throw new Error("Should not be generating types for an external type");
  }
  const uniqueLinkTargetTypes = new Set(
    wireObject.linkTypes.map(a =>
      ontology.requireObjectType(a.objectTypeApiName, false)
    ),
  );

  const definition = deleteUndefineds(
    wireObjectTypeFullMetadataToSdkObjectMetadata(
      object.raw,
      true,
      consola,
    ),
  );

  const objectDefIdentifier = object.getDefinitionIdentifier(true);

  const objectSetIdentifier = `${object.shortApiName}.ObjectSet`;
  const propertyKeysIdentifier = `${object.shortApiName}.PropertyKeys`;
  // const osdkObjectPropsIdentifier = `OsdkObjectProps$${objectDefIdentifier}`;
  const osdkObjectPropsIdentifier = `${object.shortApiName}.Props`;
  const osdkObjectStrictPropsIdentifier = `${object.shortApiName}.StrictProps`;
  const osdkObjectLinksIdentifier = `${object.shortApiName}.Links`;
  const osdkObjectIdentifier = `${object.shortApiName}.OsdkObject`;

  const identifiers: Identifiers = {
    objectDefIdentifier: object.shortApiName,
    osdkObjectLinksIdentifier,
    osdkObjectPropsIdentifier,
    osdkObjectStrictPropsIdentifier,
    objectSetIdentifier,
    osdkObjectIdentifier,
    propertyKeysIdentifier,
  };

  function getV2Types(
    object: EnhancedObjectType,
    forInternalUse: boolean = false,
  ) {
    return `import type {
      PropertyKeys as $PropertyKeys,  
      ObjectTypeDefinition as $ObjectTypeDefinition,
      ObjectMetadata as $ObjectMetadata,
    } from "${forInternalUse ? "@osdk/api" : "@osdk/client"}";
     import type {
      ObjectSet as $ObjectSet, 
      Osdk as $Osdk,
      OsdkObject as $OsdkObject,
      PropertyValueWireToClient as $PropType,
      SingleLinkAccessor  as $SingleLinkAccessor,
    } from "${forInternalUse ? "@osdk/api" : "@osdk/client"}";


    export namespace ${object.shortApiName} {

      ${createPropertyKeys(object)}


      ${createLinks(ontology, object, "Links")}

      ${createProps(object, "Props", false)}
      ${createProps(object, "StrictProps", true)}

      ${createObjectSet(object, identifiers)}
      
      ${createOsdkObject(object, "OsdkInstance", identifiers)}
    }    



    ${createDefinition(object, ontology, object.shortApiName, identifiers)}
    `;
  }

  const imports = getObjectImports(
    uniqueLinkTargetTypes,
    definition.apiName,
    currentFilePath,
    true,
  );

  return `${imports}${getV2Types(object, forInternalUse)}

    export const ${object.shortApiName}: ${objectDefIdentifier}
    = {
      type: "${object instanceof EnhancedObjectType ? "object" : "interface"}",
      apiName: "${object.fullApiName}",
      osdkMetadata: $osdkMetadata,  
    };`;
}

export interface Identifiers extends
  Record<
    | "osdkObjectIdentifier"
    | "propertyKeysIdentifier"
    | "osdkObjectPropsIdentifier"
    | "objectDefIdentifier"
    | "osdkObjectLinksIdentifier"
    | "osdkObjectStrictPropsIdentifier"
    | "objectSetIdentifier",
    string
  >
{}

export function createOsdkObject(
  object: EnhancedObjectType | EnhancedInterfaceType,
  identifier: string,
  {
    osdkObjectPropsIdentifier,
    objectDefIdentifier,
    osdkObjectStrictPropsIdentifier,
    osdkObjectLinksIdentifier,
  }: Identifiers,
) {
  const definition = object.getCleanedUpDefinition(true);
  return `
    export type ${identifier}<
      OPTIONS extends never | "$rid" = never,
      K extends keyof ${osdkObjectPropsIdentifier}= keyof ${osdkObjectPropsIdentifier},
    > 
    = $Osdk.Instance<
        ${objectDefIdentifier}, 
        OPTIONS,
        K
      >;
   

    /** @deprecated use ${identifier} */
    export type OsdkObject<
      OPTIONS extends never | "$rid" = never,
      K extends keyof ${osdkObjectPropsIdentifier}= keyof ${osdkObjectPropsIdentifier},
    > = ${identifier}<OPTIONS, K>;
  ;
    `;
}

export function createObjectSet(
  object: EnhancedObjectType | EnhancedInterfaceType,
  {
    objectDefIdentifier,
    objectSetIdentifier,
    propertyKeysIdentifier,
    osdkObjectIdentifier,
  }: Identifiers,
) {
  return `
export interface ObjectSet extends 
$ObjectSet<${objectDefIdentifier},

${objectSetIdentifier}
>
{

}
`;
}

function maybeStripNamespace(
  type: EnhancedInterfaceType | EnhancedObjectType,
  q: string,
) {
  if (
    type.apiNamespace && q.startsWith(`${type.apiNamespace}.`)
  ) {
    return q.slice(type.apiNamespace.length + 1);
  } else {
    return q;
  }
}

export function createProps(
  type: EnhancedInterfaceType | EnhancedObjectType,
  identifier: string,
  strict: boolean,
): string {
  if (identifier === "StrictProps") {
    return `export type StrictProps = Props`;
  }
  const definition = type.getCleanedUpDefinition(true);
  return `export interface ${identifier} {
${
    stringify(definition.properties, {
      "*": (propertyDefinition, _, apiName) => {
        return [
          `${propertyJsdoc(propertyDefinition, { apiName })}readonly "${
            maybeStripNamespace(type, apiName)
          }"`,
          (typeof propertyDefinition.type === "object"
            ? remapStructType(propertyDefinition.type)
            : `$PropType[${JSON.stringify(propertyDefinition.type)}]`)
          + `${propertyDefinition.multiplicity ? "[]" : ""}${
            propertyDefinition.nullable
              || (!strict
                && !(definition.type === "object"
                  && definition.primaryKeyApiName === apiName))
              ? `| undefined`
              : ""
          }`,
        ] as [string, string];
      },
    })
  }
    }`;
}

export function createDefinition(
  object: EnhancedObjectType | EnhancedInterfaceType,
  ontology: EnhancedOntologyDefinition,
  identifier: string,
  {
    objectDefIdentifier,
    objectSetIdentifier,
    osdkObjectPropsIdentifier,
    osdkObjectStrictPropsIdentifier,
    osdkObjectLinksIdentifier,
  }: Identifiers,
) {
  const definition = object.getCleanedUpDefinition(true);
  return `
    export interface ${identifier} extends ${
    object instanceof EnhancedObjectType
      ? `$ObjectTypeDefinition`
      : `$InterfaceDefinition`
  } {
      osdkMetadata: typeof $osdkMetadata;
      type: "${object instanceof EnhancedObjectType ? "object" : "interface"}";
      apiName: "${object.fullApiName}";
      __DefinitionMetadata?: {
      objectSet: ${objectSetIdentifier};
      props: ${osdkObjectPropsIdentifier};
      linksType: ${osdkObjectLinksIdentifier};
      strictProps: ${osdkObjectStrictPropsIdentifier};
      ${
    stringify(definition, {
      links: (_value) =>
        `{
        ${
          stringify(definition.links, {
            "*": (definition) =>
              `$ObjectMetadata.Link<${
                ontology.requireObjectType(definition.targetType)
                  .getImportedDefinitionIdentifier(true)
              }, ${definition.multiplicity}>`,
          })
        }
      }`,
      properties: (_value) => (`{
        ${
        stringify(definition.properties, {
          "*": (propertyDefinition, _, apiName) =>
            [
              `${propertyJsdoc(propertyDefinition, { apiName })}"${
                maybeStripNamespace(object, apiName)
              }"`,
              `$PropertyDef<${JSON.stringify(propertyDefinition.type)}, "${
                propertyDefinition.nullable ? "nullable" : "non-nullable"
              }", "${propertyDefinition.multiplicity ? "array" : "single"}">`,
            ] as [string, string],
        })
      }
      }`),
    })
  }
  } 
}
  `;
}

export function createLinks(
  ontology: EnhancedOntologyDefinition,
  object: EnhancedObjectType | EnhancedInterfaceType,
  identifier: string,
) {
  const definition = object.getCleanedUpDefinition(true);

  return `
    ${
    Object.keys(definition.links).length === 0
      ? `export type ${identifier} = {};`
      : `
        export interface ${identifier}  {
${
        stringify(definition.links, {
          "*": (definition, _, key) => {
            const linkTarget = ontology.requireObjectType(
              definition.targetType,
            )
              .getImportedDefinitionIdentifier(true);

            return [
              `readonly ${key}`,
              `${
                definition.multiplicity
                  ? `${linkTarget}.ObjectSet`
                  : `$SingleLinkAccessor<${linkTarget}>`
              }
          `,
            ];
          },
        })
      }
    }
    `
  }`;
}

export function createPropertyKeys(
  type: EnhancedObjectType | EnhancedInterfaceType,
) {
  const properties = Object.keys(type.getCleanedUpDefinition(true).properties);
  return `export type PropertyKeys = ${
    properties.length === 0
      ? "never"
      : properties.map(
        (a) => maybeStripNamespace(type, a),
      ).map(a => `"${a}"`).join("|")
  };`;
}

function remapStructType(structType: Record<string, any>): string {
  let output = `{`;
  Object.entries(structType).map(([key, value]) =>
    output += `${key}:$PropType[${JSON.stringify(value)}]|undefined;`
  );
  output += "}";
  return output;
}
