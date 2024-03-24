import { FactoryProvider, ModuleMetadata } from "@nestjs/common";

export type ModuleAsyncOptions<T> = Pick<
  ModuleMetadata,
  "imports" | "providers"
> &
  Pick<FactoryProvider<T>, "useFactory" | "inject">;

export interface CampayModuleConfigOptions {
  permanentAccessToken?: string;
  username?: string;
  password?: string;
  isProduction?: boolean;
  nbRefreshTokenRetries?: number;
}

export type AuthStrategy = "permanentAccessToken" | "usernamePassword";

export interface CampayInternalModuleConfigOptions
  extends CampayModuleConfigOptions {
  isProduction: boolean;
  baseUrl: string;
  authStrategy: AuthStrategy;
  nbRefreshTokenRetries: number;
}

export type CampayModuleAsyncOptions =
  ModuleAsyncOptions<CampayModuleConfigOptions>;

export const CAMPAY_CONFIG_OPTIONS = Symbol("CAMPAY_CONFIG_OPTIONS");

export const INTERNAL_CAMPAY_CONFIG_OPTIONS = Symbol(
  "INTERNAL_CAMPAY_CONFIG_OPTIONS"
);

export const AXIOS_INSTANCE_TOKEN = Symbol("AXIOS_INSTANCE_TOKEN");
