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

import type { Logger } from "@osdk/api";
import { createSharedClientContext } from "@osdk/shared.client.impl";
import type {
  ClientCacheKey,
  MinimalClient,
  MinimalClientParams,
} from "./MinimalClientContext.js";
import {
  convertWireToOsdkObjects,
  convertWireToOsdkObjects2,
} from "./object/convertWireToOsdkObjects.js";
import { createObjectSet } from "./objectSet/createObjectSet.js";
import type { ObjectSetFactory } from "./objectSet/ObjectSetFactory.js";
import type { OntologyProvider } from "./ontology/OntologyProvider.js";
import {
  createStandardOntologyProviderFactory,
  type OntologyCachingOptions,
} from "./ontology/StandardOntologyProvider.js";
import { USER_AGENT } from "./util/UserAgent.js";

/** @internal */
export function createMinimalClient(
  metadata: MinimalClientParams["metadata"],
  baseUrl: string,
  tokenProvider: () => Promise<string>,
  options: OntologyCachingOptions & { logger?: Logger } = {},
  fetchFn: (
    input: Request | URL | string,
    init?: RequestInit | undefined,
  ) => Promise<Response> = global.fetch,
  objectSetFactory: ObjectSetFactory<any, any> = createObjectSet,
  createOntologyProviderFactory: (
    a: OntologyCachingOptions & { logger?: Logger },
  ) => (minimalClient: MinimalClient) => OntologyProvider =
    createStandardOntologyProviderFactory,
) {
  if (process.env.NODE_ENV !== "production") {
    try {
      new URL(baseUrl);
    } catch (e) {
      const hint =
        !baseUrl.startsWith("http://") || !baseUrl.startsWith("https://")
          ? ". Did you forget to add 'http://' or 'https://'?"
          : "";
      throw new Error(`Invalid stack URL: ${baseUrl}${hint}`);
    }
  }
  const processedBaseUrl = new URL(baseUrl);
  processedBaseUrl.pathname += processedBaseUrl.pathname.endsWith("/")
    ? ""
    : "/";
  const minimalClient: MinimalClient = {
    ...createSharedClientContext(
      processedBaseUrl.toString(),
      tokenProvider,
      USER_AGENT,
      fetchFn,
    ),
    objectSetFactory,
    objectFactory: convertWireToOsdkObjects,
    objectFactory2: convertWireToOsdkObjects2,
    ontologyRid: metadata.ontologyRid,
    logger: options.logger,
    clientCacheKey: {} as ClientCacheKey,
    requestContext: {},
  } satisfies Omit<
    MinimalClient,
    "ontologyProvider"
  > as any;

  return Object.freeze(Object.assign(minimalClient, {
    ontologyProvider: createOntologyProviderFactory(
      options,
    )(minimalClient),
  }));
}
