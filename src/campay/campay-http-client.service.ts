import { Inject, Injectable, Logger } from "@nestjs/common";
import { AxiosInstance, AxiosResponse } from "axios";

import {
  AXIOS_INSTANCE_TOKEN,
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import { getAxiosErrorMessage } from "./utils";

@Injectable()
export class CampayHttpClientService {
  private readonly logger = new Logger(CampayHttpClientService.name);
  private readonly cache: Map<string, string> = new Map();

  constructor(
    @Inject(INTERNAL_CAMPAY_CONFIG_OPTIONS)
    private readonly config: CampayInternalModuleConfigOptions,
    @Inject(AXIOS_INSTANCE_TOKEN)
    private readonly $axiosInstance: AxiosInstance
  ) {
    this.$axiosInstance.defaults.baseURL = this.config.baseUrl;

    if (this.config.authStrategy === "apiKey") {
      this.$axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Token ${this.config.apiKey}`;
    }

    if (this.config.authStrategy === "access_token") {
      this.$axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
          const status = error.response ? error.response.status : null;
          const message = error.response ? error.response.data.message : null;
          const nbPreviousRetries =
            Number(error.config.headers["X-jwt-retries"] || 0) || 0;

          console.log("💄", nbPreviousRetries, message, status);

          if (status === 401 && nbPreviousRetries < 5) {
            return (
              this.fetchToken()
                .then((response) => {
                  const token = response.data.token;

                  this.setToken(token);

                  console.log("🧣", token);

                  error.config.headers["Authorization"] = "Token " + token;
                  error.config.headers["X-jwt-retries"] = nbPreviousRetries + 1;
                  error.config.baseURL = undefined;
                  return this.$axiosInstance.request(error.config);
                })
                // Would be nice to catch an error here, which would work, if the interceptor is omitted
                .catch((err) => err)
            );
          }

          return Promise.reject(error);
        }
      );
    }

    this.$axiosInstance.defaults.headers["Content-Type"] = "application/json";
    this.$axiosInstance.defaults.headers["Accept"] = "application/json";
  }

  async post<TBody = object, TResponse = void>({
    url,
    body,
    headers
  }: {
    url: string;
    body?: TBody;
    headers?: Record<string, string>;
  }): Promise<AxiosResponse<TResponse>> {
    if (this.config.authStrategy === "access_token") {
      const token = this.getToken();
      headers = headers ?? {};
      headers["Authorization"] = `Token ${token}`;
    }

    try {
      const res = await this.$axiosInstance.post<
        unknown,
        AxiosResponse<TResponse>,
        TBody
      >(url, body, { headers });

      return res;
    } catch (error) {
      const axiosMessage = getAxiosErrorMessage(error);
      this.logger.debug(axiosMessage);
      throw error;
    }
  }

  async get<TParams = unknown, TResponse = void>({
    url,
    params,
    headers
  }: {
    url: string;
    params?: TParams;
    headers?: Record<string, string>;
  }): Promise<AxiosResponse<TResponse>> {
    if (this.config.authStrategy === "access_token") {
      const token = this.getToken();
      headers = headers ?? {};
      headers["Authorization"] = `Token ${token}`;
    }

    try {
      const res = await this.$axiosInstance.get<
        unknown,
        AxiosResponse<TResponse>,
        TParams
      >(url, { headers, params });

      return res;
    } catch (error) {
      const axiosMessage = getAxiosErrorMessage(error);
      this.logger.debug(axiosMessage);
      throw error;
    }
  }

  private async fetchToken(): Promise<
    AxiosResponse<{ token: string; expires_in: number }>
  > {
    try {
      const res = await this.$axiosInstance.post<
        unknown,
        AxiosResponse<{ token: string; expires_in: number }>
      >("token", {
        username: this.config.username,
        password: this.config.password
      });
      return res;
    } catch (error) {
      const axiosMessage = getAxiosErrorMessage(error);
      this.logger.debug(axiosMessage);
      throw error;
    }
  }

  private setToken(token: string): void {
    this.cache.set("ACCESS_TOKEN", token);
  }

  private getToken(): string {
    return this.cache.get("ACCESS_TOKEN") ?? "";
  }

  getAxiosInstance(): AxiosInstance {
    return this.$axiosInstance;
  }
}
