/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import type {
  ActionDefinition,
  FetchPageArgs,
  InterfaceDefinition,
  Logger,
  NullabilityAdherence,
  ObjectOrInterfaceDefinition,
  ObjectSet,
  ObjectTypeDefinition,
  Osdk,
  PropertyKeys,
  QueryDefinition,
  SelectArg,
} from "@osdk/api";
import type {
  Experiment,
  ExperimentFns,
  MinimalObjectSet,
} from "@osdk/api/unstable";
import {
  __EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference,
  __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid,
  __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid,
  __EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks,
} from "@osdk/api/unstable";
import type { ObjectSet as WireObjectSet } from "@osdk/foundry.ontologies";
import * as OntologiesV2 from "@osdk/foundry.ontologies";
import { symbolClientContext as oldSymbolClientContext } from "@osdk/shared.client";
import { createBulkLinksAsyncIterFactory } from "./__unstable/createBulkLinksAsyncIterFactory.js";
import type { ActionSignatureFromDef } from "./actions/applyAction.js";
import { applyAction } from "./actions/applyAction.js";
import { additionalContext, type Client } from "./Client.js";
import { createMinimalClient } from "./createMinimalClient.js";
import { fetchMetadataInternal } from "./fetchMetadata.js";
import { MinimalLogger } from "./logger/MinimalLogger.js";
import type { MinimalClient } from "./MinimalClientContext.js";
import { fetchPage } from "./object/fetchPage.js";
import { fetchSingle } from "./object/fetchSingle.js";
import { createObjectSet } from "./objectSet/createObjectSet.js";
import type { ObjectSetFactory } from "./objectSet/ObjectSetFactory.js";
import { applyQuery } from "./queries/applyQuery.js";
import type { QuerySignatureFromDef } from "./queries/types.js";

// We import it this way to keep compatible with CJS. If we referenced the
// value of `symbolClientContext` directly, then we would have to a dynamic import
// in `createClientInternal` which would make it async and a break.
// Since this is just a string in `@osdk/shared.client2` instead of a symbol,
// we can safely perform this trick.
type newSymbolClientContext =
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  typeof import("@osdk/shared.client2").symbolClientContext;

class ActionInvoker<Q extends ActionDefinition<any>>
  implements ActionSignatureFromDef<Q>
{
  constructor(
    clientCtx: MinimalClient,
    actionDef: ActionDefinition<any>,
  ) {
    // We type the property as a generic function as binding `applyAction`
    // doesn't return a type thats all that useful anyway
    // The implements covers us for the most part here as this exact type doesn't
    // escape this file
    this.applyAction = applyAction.bind(undefined, clientCtx, actionDef);
    this.batchApplyAction = applyAction.bind(undefined, clientCtx, actionDef);
  }

  applyAction: (...args: any[]) => any;
  batchApplyAction: (...args: any[]) => any;
}

class QueryInvoker<Q extends QueryDefinition<any>>
  implements QuerySignatureFromDef<Q>
{
  constructor(
    clientCtx: MinimalClient,
    queryDef: QueryDefinition<any>,
  ) {
    this.executeFunction = applyQuery.bind(undefined, clientCtx, queryDef);
  }

  executeFunction: (...args: any[]) => any;
}

/** @internal */
export function createClientInternal(
  objectSetFactory: ObjectSetFactory<any, any>, // first so i can bind
  baseUrl: string,
  ontologyRid: string | Promise<string>,
  tokenProvider: () => Promise<string>,
  options: { logger?: Logger } | undefined = undefined,
  fetchFn: typeof globalThis.fetch = fetch,
): Client {
  if (typeof ontologyRid === "string") {
    if (!ontologyRid.startsWith("ri.")) {
      throw new Error("Invalid ontology RID");
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ontologyRid.then((ontologyRid) => {
      if (!ontologyRid.startsWith("ri.")) {
        // FIXME this promise is not await so this just shows up as an unhandled promise rejection
        throw new Error("Invalid ontology RID");
      }
    });
  }

  const clientCtx: MinimalClient = createMinimalClient(
    { ontologyRid },
    baseUrl,
    tokenProvider,
    { ...options, logger: options?.logger ?? new MinimalLogger() },
    fetchFn,
    objectSetFactory,
  );

  function clientFn<
    T extends
      | ObjectOrInterfaceDefinition
      | ActionDefinition<any>
      | QueryDefinition<any>
      | Experiment<"2.0.8">
      | Experiment<"2.1.0">,
  >(o: T): T extends ObjectTypeDefinition ? ObjectSet<T>
    : T extends InterfaceDefinition ? MinimalObjectSet<T>
    : T extends ActionDefinition<any> ? ActionSignatureFromDef<T>
    : T extends QueryDefinition<any> ? QuerySignatureFromDef<T>
    : T extends Experiment<"2.0.8"> | Experiment<"2.1.0">
      ? { invoke: ExperimentFns<T> }
    : never
  {
    if (o.type === "object" || o.type === "interface") {
      return objectSetFactory(o, clientCtx) as any;
    } else if (o.type === "action") {
      return new ActionInvoker(
        clientCtx,
        o,
      ) as (T extends ActionDefinition<any>
        // first `as` to the action definition for our "real" typecheck
        ? ActionSignatureFromDef<T>
        : never) as any; // then as any for dealing with the conditional return value
    } else if (o.type === "query") {
      return new QueryInvoker(
        clientCtx,
        o,
      ) as (T extends QueryDefinition<any> ? QuerySignatureFromDef<T>
        : never) as any;
    } else if (o.type === "experiment") {
      switch (o.name) {
        case __EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks.name:
          return {
            getBulkLinks: createBulkLinksAsyncIterFactory(
              clientCtx,
            ),
          } as any;
        case __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid.name:
          return {
            fetchOneByRid: async <
              Q extends ObjectTypeDefinition,
              const L extends PropertyKeys<Q>,
              const R extends boolean,
              const S extends false | "throw" = NullabilityAdherence.Default,
            >(
              objectType: Q,
              rid: string,
              options: SelectArg<Q, L, R, S>,
            ) => {
              return await fetchSingle(
                clientCtx,
                objectType,
                options,
                createWithRid(
                  [rid],
                ),
              ) as Osdk<Q>;
            },
          } as any;
        case __EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference.name:
          return {
            createMediaReference: async <
              Q extends ObjectTypeDefinition,
              const L extends PropertyKeys.Filtered<Q, "mediaReference">,
            >(args: {
              data: Blob;
              fileName: string;
              objectType: Q;
              propertyType: L;
            }) => {
              const { data, fileName, objectType, propertyType } = args;
              return await OntologiesV2.MediaReferenceProperties.upload(
                clientCtx,
                await clientCtx.ontologyRid,
                objectType.apiName,
                propertyType as string,
                data,
                {
                  mediaItemPath: fileName,
                  preview: true,
                },
              );
            },
          } as any;

        case __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid.name:
          return {
            fetchPageByRid: async <
              Q extends ObjectOrInterfaceDefinition,
              const L extends PropertyKeys<Q>,
              const R extends boolean,
              const S extends false | "throw" = NullabilityAdherence.Default,
            >(
              objectOrInterfaceType: Q,
              rids: string[],
              options: FetchPageArgs<Q, L, R, any, S> = {},
            ) => {
              return await fetchPage(
                clientCtx,
                objectOrInterfaceType,
                options,
                createWithRid(rids),
              );
            },
          } as any;
      }

      throw new Error("not implemented");
    } else {
      throw new Error("not implemented");
    }
  }

  const fetchMetadata = fetchMetadataInternal.bind(
    undefined,
    clientCtx,
  );

  const symbolClientContext: newSymbolClientContext = "__osdkClientContext";

  const client: Client = Object.defineProperties<Client>(
    clientFn as Client,
    {
      [oldSymbolClientContext]: {
        value: clientCtx,
      },
      [symbolClientContext]: {
        value: clientCtx,
      },
      [additionalContext]: {
        value: clientCtx,
      },
      fetchMetadata: {
        value: fetchMetadata,
      },
    } satisfies Record<keyof Client, PropertyDescriptor>,
  );

  return client;
}

export const createClient: (
  baseUrl: string,
  ontologyRid: string | Promise<string>,
  tokenProvider: () => Promise<string>,
  options?: {
    logger?: Logger;
  } | undefined,
  fetchFn?: typeof fetch | undefined,
) => Client = createClientInternal.bind(
  undefined,
  createObjectSet,
);

function createWithRid(
  rids: string[],
) {
  const withRid: WireObjectSet = {
    type: "static",
    "objects": rids,
  };

  return withRid;
}
