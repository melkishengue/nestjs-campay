import { FactoryProvider, ModuleMetadata } from "@nestjs/common";

export type ModuleAsyncOptions<T> = Pick<
  ModuleMetadata,
  "imports" | "providers"
> &
  Pick<FactoryProvider<T>, "useFactory" | "inject">;

export interface CampayModuleConfigOptions {
  apiKey?: string;
  username?: string;
  password?: string;
  isProduction?: boolean;
}

export type AuthStrategy = "apiKey" | "access_token";

export interface CampayInternalModuleConfigOptions
  extends CampayModuleConfigOptions {
  isProduction: boolean;
  baseUrl: string;
  authStrategy: AuthStrategy;
}

export type CampayModuleAsyncOptions =
  ModuleAsyncOptions<CampayModuleConfigOptions>;

export const CAMPAY_CONFIG_OPTIONS = Symbol("CAMPAY_CONFIG_OPTIONS");

export const INTERNAL_CAMPAY_CONFIG_OPTIONS = Symbol(
  "INTERNAL_CAMPAY_CONFIG_OPTIONS"
);

export const AXIOS_INSTANCE_TOKEN = Symbol("AXIOS_INSTANCE_TOKEN");
