import { DynamicModule, Global, Module, Provider } from "@nestjs/common";

import { CampayService } from "./campay.service";
import { CampayHttpClientService } from "./campay-http-client.service";
import {
  AuthStrategy,
  CAMPAY_CONFIG_OPTIONS,
  CampayInternalModuleConfigOptions,
  CampayModuleAsyncOptions,
  CampayModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";

@Global()
@Module({})
export class CampayModule {
  static forRoot(options: CampayModuleConfigOptions): DynamicModule {
    return {
      module: CampayModule,
      exports: [CampayService],
      providers: [
        {
          provide: CAMPAY_CONFIG_OPTIONS,
          useValue: options
        },
        ...CampayModule.getProviders()
      ]
    };
  }

  /**
   * Example:
   * ```typescript
   * 
   @Module({
      imports: [
        CampayModule.forRootAsync({
            useFactory: (config: Config): CampayModuleConfigOptions => {
              return {
                apiKey: config.API_KEY,
                isProduction: config.IS_PRODUCTION,
              };
            },
            inject: [Config],
            providers: [Config],
        }),
      ],
      controllers: [AppController],
      providers: [AppService, Config],
    })
    export class AppModule {}
   * ```
   */
  static forRootAsync(options: CampayModuleAsyncOptions): DynamicModule {
    return {
      module: CampayModule,
      imports: options.imports,
      exports: [CampayService],
      providers: [
        {
          provide: CAMPAY_CONFIG_OPTIONS,
          ...options
        },
        ...CampayModule.getProviders(),
        ...(options.providers ?? [])
      ]
    };
  }

  static getProviders(): Provider[] {
    return [
      {
        provide: INTERNAL_CAMPAY_CONFIG_OPTIONS,
        useFactory: (
          config: CampayModuleConfigOptions
        ): CampayInternalModuleConfigOptions => {
          const auth = CampayModule.getModuleAuthConfig(config);

          return {
            ...auth,
            isProduction: !!config.isProduction,
            baseUrl: config.isProduction
              ? "https://demo.campay.net/api"
              : "https://demo.campay.net/api"
          };
        },
        inject: [CAMPAY_CONFIG_OPTIONS]
      },
      CampayService,
      CampayHttpClientService
    ];
  }

  static getModuleAuthConfig = (
    candidateConfig: CampayModuleConfigOptions
  ):
    | { apiKey: string; authStrategy: AuthStrategy }
    | { username: string; password: string; authStrategy: AuthStrategy } => {
    if (candidateConfig.apiKey)
      return { apiKey: candidateConfig.apiKey, authStrategy: "apiKey" };

    if (!(candidateConfig.username && candidateConfig.password)) {
      throw new Error(
        `Configuration error: you must either pass an api key, or a username and password`
      );
    }

    return {
      username: candidateConfig.username,
      password: candidateConfig.password,
      authStrategy: "access_token"
    };
  };
}
