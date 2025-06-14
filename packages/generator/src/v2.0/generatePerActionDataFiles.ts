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

import type { ActionMetadata } from "@osdk/api";
import type {
  ActionParameterType,
  ActionTypeV2,
} from "@osdk/foundry.ontologies";
import { wireActionTypeV2ToSdkActionMetadata } from "@osdk/generator-converters";
import path from "node:path";
import type { EnhancedObjectType } from "../GenerateContext/EnhancedObjectType.js";
import type { ForeignType } from "../GenerateContext/ForeignType.js";
import type { GenerateContext } from "../GenerateContext/GenerateContext.js";
import { getObjectImports } from "../shared/getObjectImports.js";
import { deleteUndefineds } from "../util/deleteUndefineds.js";
import { stringify } from "../util/stringify.js";
import { stringUnionFrom } from "../util/stringUnionFrom.js";
import { formatTs } from "../util/test/formatTs.js";
import { getDescriptionIfPresent } from "./getDescriptionIfPresent.js";

export async function generatePerActionDataFiles(
  {
    sanitizedOntology: ontology,
    fs,
    outDir: rootOutDir,
    importExt = "",
    ontology: enhancedOntology,
    forInternalUse = false,
  }: Pick<
    GenerateContext,
    | "sanitizedOntology"
    | "fs"
    | "outDir"
    | "importExt"
    | "ontology"
    | "forInternalUse"
  >,
): Promise<void> {
  const outDir = path.join(rootOutDir, "ontology", "actions");

  await fs.mkdir(outDir, { recursive: true });
  await Promise.all(
    Object.values(enhancedOntology.actionTypes).map(async (action) => {
      const currentFilePath = path.join(
        "ontology",
        "actions",
        `${action.shortApiName}.ts`,
      );

      const uniqueApiNamesArray = extractReferencedObjectsFromAction(
        action.raw,
      );
      const uniqueApiNames = new Set(uniqueApiNamesArray);

      const uniqueApiNamesString = stringUnionFrom([...uniqueApiNames]);

      const fullActionDef = deleteUndefineds(
        wireActionTypeV2ToSdkActionMetadata(action.raw),
      );

      function createParamsDef() {
        const entries = Object.entries(fullActionDef.parameters ?? {});
        entries.sort((a, b) => a[0].localeCompare(b[0]));

        if (entries.length === 0) {
          return `// Represents the definition of the parameters for the action
          export type ParamsDefinition = Record<string, never>;`;
        }

        return `// Represents the definition of the parameters for the action
        export type ParamsDefinition = {
          ${
          entries.map(([key, value]) => {
            return `"${key}": {
                ${
              stringify(value, {
                description: (value, d) => value ? d(value) : undefined, // trick to remove undefineds
                type: (type) => {
                  if (typeof type === "string") {
                    return JSON.stringify(type);
                  } else if (type.type === "object") {
                    const obj = enhancedOntology.requireObjectType(type.object);
                    return `ActionMetadata.DataType.Object<${
                      obj.getImportedDefinitionIdentifier(true)
                    }>`;
                  } else if (type.type === "objectSet") {
                    const obj = enhancedOntology.requireObjectType(
                      type.objectSet,
                    );
                    return `ActionMetadata.DataType.ObjectSet<${
                      obj.getImportedDefinitionIdentifier(true)
                    }>`;
                  } else if (type.type === "interface") {
                    const obj = enhancedOntology.requireInterfaceType(
                      type.interface,
                    );
                    return `ActionMetadata.DataType.Interface<${
                      obj.getImportedDefinitionIdentifier(true)
                    }>`;
                  } else if (type.type === "struct") {
                    return `ActionMetadata.DataType.Struct<${
                      JSON.stringify(type.struct)
                    }>`;
                  }
                  return undefined;
                },
              })
            }
            }`;
          })
            .join(";\n")
        }
        }`;
      }

      function getActionParamType(
        input: ActionMetadata.Parameter["type"],
      ) {
        if (typeof input === "string") {
          return `ActionParam.PrimitiveType<${JSON.stringify(input)}>`;
        } else if (input.type === "object") {
          return `ActionParam.ObjectType<${
            enhancedOntology.requireObjectType(input.object)
              .getImportedDefinitionIdentifier(true)
          }>`;
        } else if (input.type === "objectSet") {
          return `ActionParam.ObjectSetType<${
            enhancedOntology.requireObjectType(input.objectSet)
              .getImportedDefinitionIdentifier(true)
          }>`;
        } else if (input.type === "interface") {
          return `ActionParam.InterfaceType<${
            enhancedOntology.requireInterfaceType(input.interface)
              .getImportedDefinitionIdentifier(true)
          }>`;
        } else if (input.type === "struct") {
          return `ActionParam.StructType<${JSON.stringify(input.struct)}>`;
        }
      }

      function createV2Types() {
        const oldParamsIdentifier = `${action.shortApiName}$Params`;
        const jsDocBlock = ["/**"];
        if (action.description != null) {
          jsDocBlock.push(`* ${action.description}`);
        }
        // the params must be a `type` to align properly with the `ActionDefinition` interface
        // this way we can generate a strict type for the function itself and reference it from the Action Definition
        return `
        
          export namespace ${action.shortApiName}{
            ${createParamsDef()}

            ${getDescriptionIfPresent(action.description)}
            export interface Params {
              ${
          stringify(fullActionDef.parameters, {
            "*": (ogValue, _, ogKey) => {
              const key = `${getDescriptionIfPresent(ogValue.description)}
                  readonly "${ogKey}"${ogValue.nullable ? "?" : ""}`;

              const value = ogValue.multiplicity
                ? `ReadonlyArray<${getActionParamType(ogValue.type)}>`
                : `${getActionParamType(ogValue.type)}`;
              jsDocBlock.push(
                `* @param {${getActionParamType(ogValue.type)}} ${
                  ogValue.nullable ? `[${ogKey}]` : ogKey
                } ${ogValue.description ?? ""} `,
              );
              return [key, value];
            },
          })
        }
            }

            // Represents a fqn of the action
            export interface Signatures {
              ${getDescriptionIfPresent(action.description)}
              applyAction<OP extends ApplyActionOptions>(args: ${action.paramsIdentifier}, options?: OP): Promise<ActionReturnTypeForOptions<OP>>;
           
              batchApplyAction<OP extends ApplyBatchActionOptions>(args: ReadonlyArray<${action.paramsIdentifier}>, options?: OP): Promise<ActionReturnTypeForOptions<OP>>;
            }
  
          }

          
          ${jsDocBlock.join("\n")}
          */
          export interface ${action.shortApiName} extends ActionDefinition<${action.shortApiName}.Signatures> {
            __DefinitionMetadata?: {
              ${
          stringify(fullActionDef, {
            "parameters": () => action.definitionParamsIdentifier,
          })
        }
              
              signatures: ${action.shortApiName}.Signatures;
            },
            ${
          stringify(fullActionDef, {
            "description": () => undefined,
            "displayName": () => undefined,
            "modifiedEntities": () => undefined,
            "parameters": () => undefined,
            "rid": () => undefined,
            "status": () => undefined,
          })
        }
            osdkMetadata: typeof $osdkMetadata;
            }
          `;
      }

      function createV2Object() {
        return `  export const ${action.shortApiName}: ${action.shortApiName} = 
        {
          ${
          stringify(fullActionDef, {
            "description": () => undefined,
            "displayName": () => undefined,
            "modifiedEntities": () => undefined,
            "parameters": () => undefined,
            "rid": () => undefined,
            "status": () => undefined,
          })
        },
          osdkMetadata: $osdkMetadata
        }
        `;
      }

      const referencedObjectDefs = new Set<EnhancedObjectType | ForeignType>();
      for (const p of Object.values(action.parameters)) {
        if (p.dataType.type === "object" || p.dataType.type === "objectSet") {
          if (p.dataType.objectApiName) {
            referencedObjectDefs.add(
              enhancedOntology.requireObjectType(p.dataType.objectApiName),
            );
          }
          if (p.dataType.objectTypeApiName) {
            referencedObjectDefs.add(
              enhancedOntology.requireObjectType(p.dataType.objectTypeApiName),
            );
          }
        }
        if (p.dataType.type === "interfaceObject") {
          if (p.dataType.interfaceTypeApiName) {
            referencedObjectDefs.add(
              enhancedOntology.requireInterfaceType(
                p.dataType.interfaceTypeApiName,
              ),
            );
          }
        }
        if (p.dataType.type === "array") {
          if (
            p.dataType.subType.type === "object"
            || p.dataType.subType.type === "objectSet"
          ) {
            if (p.dataType.subType.objectApiName) {
              referencedObjectDefs.add(
                enhancedOntology.requireObjectType(
                  p.dataType.subType.objectApiName,
                ),
              );
            }
            if (p.dataType.subType.objectTypeApiName) {
              referencedObjectDefs.add(
                enhancedOntology.requireObjectType(
                  p.dataType.subType.objectTypeApiName,
                ),
              );
            }
          }
          if (
            p.dataType.subType.type === "interfaceObject"
          ) {
            if (p.dataType.subType.interfaceTypeApiName) {
              referencedObjectDefs.add(
                enhancedOntology.requireInterfaceType(
                  p.dataType.subType.interfaceTypeApiName,
                ),
              );
            }
          }
        }
      }

      const imports = getObjectImports(
        referencedObjectDefs,
        undefined,
        currentFilePath,
        true,
      );

      await fs.writeFile(
        path.join(rootOutDir, currentFilePath),
        await formatTs(`
          import type {
            ActionDefinition,
            ActionMetadata,
            ActionParam,
            ActionReturnTypeForOptions,
            ApplyActionOptions,
            ApplyBatchActionOptions,
          } from "${forInternalUse ? "@osdk/api" : "@osdk/client"}";
          import { $osdkMetadata} from "../../OntologyMetadata${importExt}";
          ${imports}

        
          ${createV2Types()}

          ${createV2Object()}
        `),
      );
    }),
  );

  const indexFileRelPath = path.join("ontology", "actions.ts");

  await fs.writeFile(
    path.join(rootOutDir, indexFileRelPath),
    await formatTs(`
      ${
      Object.values(enhancedOntology.actionTypes).map(action => {
        const exportConstLine = `export {${action.shortApiName} } from "${
          action.getImportPathRelTo(indexFileRelPath)
        }";`;

        return exportConstLine;
      })
        .join("\n")
    }
    ${Object.keys(ontology.actionTypes).length === 0 ? "export {};" : ""}
      `),
  );
}

function extractReferencedObjectsFromAction(
  actionType: ActionTypeV2,
): string[] {
  const referencedObjectsInParameters = Object.values(actionType.parameters)
    .flatMap(({ dataType }) => {
      const objectTypeReference = extractReferencedObjectsFromActionParameter(
        dataType,
      );
      return objectTypeReference ? [objectTypeReference] : [];
    });

  const referenceObjectsInEdits = actionType.operations.flatMap(value => {
    switch (value.type) {
      case "createObject":
        return [value.objectTypeApiName];
      case "modifyObject":
        return [value.objectTypeApiName];
      case "deleteObject":
      case "createLink":
      case "deleteLink":
      default:
        return [];
    }
  });

  return [...referenceObjectsInEdits, ...referencedObjectsInParameters];
}

function extractReferencedObjectsFromActionParameter(
  actionParameter: ActionParameterType,
): string | undefined {
  switch (actionParameter.type) {
    case "objectSet":
    case "object":
      return actionParameter.objectTypeApiName;
    case "array":
      return extractReferencedObjectsFromActionParameter(
        actionParameter.subType,
      );
    case "string":
    case "boolean":
    case "attachment":
    case "date":
    case "double":
    case "integer":
    case "long":
    case "timestamp":
      return undefined;
  }
}
