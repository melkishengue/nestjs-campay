import { DynamicModule, Global, Module } from "@nestjs/common";
import {
  CAMPAY_CONFIG_OPTIONS,
  CampayInternalModuleConfigOptions,
  CampayModuleAsyncOptions,
  CampayModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import { CampayService } from "./campay.service";
import { CampayHttpClientService } from "./campay-http-client.service";

@Global()
@Module({})
export class CampayModule {
  static forRoot(options: CampayModuleConfigOptions): DynamicModule {
    return {
      module: CampayModule,
      providers: [
        CampayService,
        {
          provide: CAMPAY_CONFIG_OPTIONS,
          useValue: options
        }
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
        CampayService,
        CampayHttpClientService,
        {
          provide: CAMPAY_CONFIG_OPTIONS,
          ...options
        },
        {
          provide: INTERNAL_CAMPAY_CONFIG_OPTIONS,
          useFactory: (
            config: CampayModuleConfigOptions
          ): CampayInternalModuleConfigOptions => {
            return {
              apiKey: config.apiKey,
              isProduction: !!config.isProduction,
              baseUrl: config.isProduction
                ? "https://demo.campay.net/api"
                : "https://demo.campay.net/api"
            };
          },
          inject: [CAMPAY_CONFIG_OPTIONS]
        },
        ...(options.providers ?? [])
      ]
    };
  }
}
