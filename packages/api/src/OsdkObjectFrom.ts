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

import type {
  DefaultToFalse,
  OsdkObjectLinksObject,
} from "./definitions/LinkDefinitions.js";
import type { NullabilityAdherence } from "./object/FetchPageArgs.js";
import type { UnionIfTrue } from "./object/FetchPageResult.js";
import type { InterfaceDefinition } from "./ontology/InterfaceDefinition.js";
import type {
  ObjectOrInterfaceDefinition,
  PropertyKeys,
} from "./ontology/ObjectOrInterface.js";
import type {
  CompileTimeMetadata,
  ObjectTypeDefinition,
} from "./ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "./ontology/SimplePropertyDef.js";
import type { OsdkBaseWithObjectSpecifier } from "./OsdkBase.js";

type DropDollarOptions<T extends string> = Exclude<
  T,
  "$rid" | "$all" | "$notStrict"
>;

type DropDollarAll<T extends string> = Exclude<
  T,
  "$all"
>;

type SpecialOsdkPropParams =
  | "$all"
  | "$rid"
  | "$strict"
  | "$notStrict";

type ValidOsdkPropParams<Q extends ObjectOrInterfaceDefinition> =
  | SpecialOsdkPropParams
  | PropertyKeys<Q>;

export type ApiNameAsString<
  T extends ObjectOrInterfaceDefinition,
> = CompileTimeMetadata<T>["apiName"];

export type JustProps<
  T extends ObjectOrInterfaceDefinition,
  P extends ValidOsdkPropParams<T>,
> = P extends "$all" ? PropertyKeys<T>
  : Exclude<P, SpecialOsdkPropParams>;

export type PropMapToObject<
  FROM extends ObjectOrInterfaceDefinition,
  TO extends ObjectTypeDefinition,
> = NonNullable<CompileTimeMetadata<TO>["interfaceMap"]>[ApiNameAsString<FROM>];

export type MapPropNamesToObjectType<
  FROM extends ObjectOrInterfaceDefinition,
  TO extends ObjectTypeDefinition,
  P extends ValidOsdkPropParams<FROM>,
  OPTIONS extends never | "$rid" | "$allBaseProperties" = never,
> = "$allBaseProperties" extends OPTIONS
  ? PropertyKeys<FROM> extends P ? PropertyKeys<TO>
  : PropMapToObject<
    FROM,
    TO
  >[JustProps<FROM, P> & keyof PropMapToObject<FROM, TO>]
  : PropMapToObject<
    FROM,
    TO
  >[JustProps<FROM, P> & keyof PropMapToObject<FROM, TO>];

export type PropMapToInterface<
  FROM extends ObjectTypeDefinition,
  TO extends InterfaceDefinition,
> = NonNullable<
  CompileTimeMetadata<FROM>["inverseInterfaceMap"]
>[ApiNameAsString<TO>];

export type MapPropNamesToInterface<
  FROM extends ObjectTypeDefinition,
  TO extends InterfaceDefinition,
  P extends ValidOsdkPropParams<FROM>,
> = PropMapToInterface<
  FROM,
  TO
>[JustProps<FROM, P> & keyof PropMapToInterface<FROM, TO>];
/**
 * Older version of this helper that allows for `$rid` and co in
 * the properties field.
 * @param FROM - the interface or object type to convert from
 * @param TO - the interface or object type to convert to
 * @param P - the property(s) to convert
 */
export type ConvertProps<
  FROM extends ObjectOrInterfaceDefinition,
  TO extends ValidToFrom<FROM>,
  P extends ValidOsdkPropParams<FROM>,
  OPTIONS extends never | "$rid" | "$allBaseProperties" = never,
> = TO extends FROM ? P
  : TO extends ObjectTypeDefinition ? (
      UnionIfTrue<
        MapPropNamesToObjectType<FROM, TO, P, OPTIONS>,
        P extends "$rid" ? true : false,
        "$rid"
      >
    )
  : TO extends InterfaceDefinition ? FROM extends ObjectTypeDefinition ? (
        UnionIfTrue<
          MapPropNamesToInterface<FROM, TO, P>,
          P extends "$rid" ? true : false,
          "$rid"
        >
      )
    : never
  : never;

/** DO NOT EXPORT FROM PACKAGE */
export type ValidToFrom<
  FROM extends ObjectOrInterfaceDefinition,
> = FROM extends InterfaceDefinition ? ObjectOrInterfaceDefinition
  : InterfaceDefinition;

export type IsNever<T> = [T] extends [never] ? true : false;

type ExtractPropsKeysFromOldPropsStyle<
  Q extends ObjectOrInterfaceDefinition,
  P extends ValidOsdkPropParams<Q>,
> = P extends "$all" ? PropertyKeys<Q>
  : Exclude<P, "$strict" | "$notStrict" | "$rid">;

export type IsAny<T> = unknown extends T
  ? [keyof T] extends [never] ? false : true
  : false;

export type GetPropsKeys<
  Q extends ObjectOrInterfaceDefinition,
  P extends PropertyKeys<Q>,
  N extends boolean = false,
> = IsNever<P> extends true ? N extends true ? never : PropertyKeys<Q>
  : IsAny<P> extends true ? PropertyKeys<Q>
  : P;

/**
 * Use `Osdk.Instance` or `YourType.OsdkInstance`
 */
export type Osdk<
  Q extends ObjectOrInterfaceDefinition,
  OPTIONS extends string = never,
  P extends PropertyKeys<Q> = PropertyKeys<Q>,
> =
  // no middle options is simplest
  IsNever<OPTIONS> extends true ? Osdk.Instance<Q, never, P>
    : IsAny<OPTIONS> extends true ? Osdk.Instance<Q, never, P>
    // Options only includes the two allowed in the new style
    : (IsNever<Exclude<OPTIONS, "$rid">>) extends true
      ? Osdk.Instance<Q, OPTIONS & "$rid", P>
    // else we are in the old style which was just Q and OPTIONS
    // and OPTIONS was $things + prop names
    : Osdk.Instance<
      Q,
      ("$rid" extends OPTIONS ? "$rid" : never),
      ExtractPropsKeysFromOldPropsStyle<Q, OPTIONS>
    >;

export namespace Osdk {
  export type Instance<
    Q extends ObjectOrInterfaceDefinition,
    OPTIONS extends never | "$rid" | "$allBaseProperties" = never,
    P extends PropertyKeys<Q> = PropertyKeys<Q>,
    R extends Record<string, SimplePropertyDef> = {},
  > =
    & OsdkBaseWithObjectSpecifier<Q>
    & Pick<
      CompileTimeMetadata<Q>["props"],
      // If there aren't any additional properties, then we want GetPropsKeys to default to PropertyKeys<Q>
      GetPropsKeys<Q, P, [R] extends [{}] ? false : true>
    >
    & ([R] extends [never] ? {}
      : { [A in keyof R]: SimplePropertyDef.ToRuntimeProperty<R[A]> })
    & {
      readonly $link: Q extends { linksType?: any } ? Q["linksType"]
        : Q extends ObjectTypeDefinition ? OsdkObjectLinksObject<Q>
        : never;

      readonly $as: <NEW_Q extends ValidToFrom<Q>>(
        type: NEW_Q | string,
      ) => Osdk.Instance<
        NEW_Q,
        OPTIONS,
        ConvertProps<Q, NEW_Q, P, OPTIONS>
      >;

      readonly $clone: <NEW_PROPS extends PropertyKeys<Q>>(
        updatedObject?:
          | Osdk.Instance<Q, any, NEW_PROPS>
          | {
            [K in NEW_PROPS]?: CompileTimeMetadata<
              Q
            >["props"][K];
          },
      ) => Osdk.Instance<Q, OPTIONS, P | NEW_PROPS>;
    }
    // We are hiding the $rid field if it wasn't requested as we want to discourage its use
    & (IsNever<OPTIONS> extends true ? {}
      : IsAny<OPTIONS> extends true ? {}
      : "$rid" extends OPTIONS ? { readonly $rid: string }
      : {});
}

/**
 * NOT EXPORTED FROM PACKAGE
 *
 * Anything you throw at this that is not `false` should always be `never`.
 *
 * This is structured in a way that it should always short circuit to never early.
 */
export type ExtractStrictOption<S extends NullabilityAdherence> =
  IsNever<S> extends true ? never
    : "throw" extends S ? never // catches any time "throw" still exists (including any)
    : "drop" extends S ? never // catches any time "drop" still exists (including any)
    : "$notStrict";

/**
 * NOT EXPORTED FROM PACKAGE
 *
 * Anything you throw at this that is not exactly `true` should always be `never`.
 */
export type ExtractRidOption<R extends boolean> = // comment for readability
  IsNever<R> extends true ? never
    : DefaultToFalse<R> extends false ? never
    : "$rid";

export type ExtractAllPropertiesOption<T extends boolean> = // comment for readability
  IsNever<T> extends true ? never
    : DefaultToFalse<T> extends false ? never
    : "$allBaseProperties";

// not exported from package
export type ExtractOptions<
  R extends boolean,
  S extends NullabilityAdherence = NullabilityAdherence.Default,
  T extends boolean = false,
> = ExtractRidOption<R> | ExtractAllPropertiesOption<T>;
