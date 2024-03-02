import { FactoryProvider, ModuleMetadata } from "@nestjs/common";

export type ModuleAsyncOptions<T> = Pick<
  ModuleMetadata,
  "imports" | "providers"
> &
  Pick<FactoryProvider<T>, "useFactory" | "inject">;

export interface CampayModuleConfigOptions {
  apiKey: string;
  isProduction?: boolean;
}

export interface CampayInternalModuleConfigOptions {
  apiKey: string;
  isProduction: boolean;
  baseUrl: string;
}

export type CampayModuleAsyncOptions =
  ModuleAsyncOptions<CampayModuleConfigOptions>;

export const CAMPAY_CONFIG_OPTIONS = Symbol("CAMPAY_CONFIG_OPTIONS");

export const INTERNAL_CAMPAY_CONFIG_OPTIONS = Symbol(
  "INTERNAL_CAMPAY_CONFIG_OPTIONS"
);
