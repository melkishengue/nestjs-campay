<h1 align="center">NestJS-Campay</h1>

<p align="center">✨✨✨ NestJS Campay integration with full support of <b>ALL CAMPAY OPERATIONS</b> ✨✨✨</p>

---

## Install

```sh
npm i nestjs-campay
```

## Example

Firstly, import module with `CampayModule.forRoot(...)` or `CampayModule.forRootAsync(...)` only once in root module (check out module configuration docs [below](#configuration)):

```ts
import { CampayModule } from 'nestjs-campay';

@Module({
  imports: [CampayModule.forRoot({
    apiKey: 'my-secret-api-key',
    isProduction: true
  })],
})
class AppModule {}
```

Secondly, inject the Campay service into your service to perform operations:

```ts
import { CampayService } from 'nestjs-campay';

export class MyService {
  constructor(private readonly campayService: CampayService) {}
  collect() {
    const res = await this.campayService.collect({
      amount: 5000,
      from: '2376xxxxxx',
      description: 'Paying goods',
      external_reference: 'xxx-xxx',
    });
  }
}
```

This module functions as a wrapper for the campay HTTP API. Therefore, it inherits all constraints imposed by the campay HTTP API. For instance, in development mode (specified by the `isProduction` property during module registration), limitations such as a maximum transfer amount of 100XAF apply.

## Configuration params

The following interface is using for the configuration:

```ts
interface Params {
  /**
   * Optional parameter
   * The campay apiKey.
   */
  apiKey?: string;

  /**
   * Optional parameter for setting the application username. Should be set along with the password.
   * 
   * Internally the username & password pair will be used to fetch an short-lived access token for performing calls to the Campay API
   */
  username?: string;

  /**
   * Optional parameter for setting the application password. Should be set along with the username
   */
  password?: string;

  /**
   * Optional parameter to set the module in production mode. Internally the correct campay base url will be determined based on this configuration.
   * 
   * Default: false
   * 
   */
  isProduction?: boolean;
}
```

When the `apiKey` is specified, authentication with the Campay API will utilize it. Otherwise, both the `username` and `password` options must be provided. Failure to provide either will result in an error being thrown during startup.

### Synchronous configuration

Use `CampayModule.forRoot` method with argument of [Params interface](#configuration-params):

```ts
import { CampayModule } from 'nestjs-campay';

@Module({
  imports: [
    CampayModule.forRoot({
      username: 'xxx-xxx',
      password: 'super-secret-password',
    })
  ],
  ...
})
class MyModule {}
```

### Asynchronous configuration

With `CampayModule.forRootAsync` you can, for example, import your `ConfigModule` and inject `ConfigService` to use it in `useFactory` method.

`useFactory` should return object with [Params interface](#configuration-params).

Here's an example:

```ts
import { CampayModule } from 'nestjs-campay';

@Injectable()
class ConfigService {
  public readonly apiKey = 'campay-api-key-xxx-xxx';
  public readonly isProduction = true;
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
class ConfigModule {}

@Module({
  imports: [
    CampayModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await somePromise();
        return {
          apiKey: config.apiKey,
          isProduction: config.isProduction,
        };
      }
    })
  ],
  ...
})
class MyModule {}
```

See [pino.destination](https://github.com/pinojs/pino/blob/master/docs/api.md#pino-destination)

## Testing a class that uses @InjectPinoLogger

This package exposes a `getLoggerToken()` function that returns a prepared injection token based on the provided context.
Using this token, you can provide a mock implementation of the logger using any of the standard custom provider techniques, including `useClass`, `useValue` and `useFactory`.

```ts
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      MyService,
      {
        provide: getLoggerToken(MyService.name),
        useValue: mockLogger,
      },
    ],
  }).compile();
```
