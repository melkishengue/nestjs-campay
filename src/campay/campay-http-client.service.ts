import { Inject, Injectable, Logger } from "@nestjs/common";
import { AxiosInstance, AxiosResponse } from "axios";

import { TokenService } from "./token.service";
import {
  AXIOS_INSTANCE_TOKEN,
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import { getAxiosErrorMessage } from "./utils";

@Injectable()
export class CampayHttpClientService {
  private readonly logger = new Logger(CampayHttpClientService.name);

  constructor(
    @Inject(INTERNAL_CAMPAY_CONFIG_OPTIONS)
    private readonly config: CampayInternalModuleConfigOptions,
    @Inject(AXIOS_INSTANCE_TOKEN)
    private readonly $axiosInstance: AxiosInstance,
    private readonly tokenService: TokenService
  ) {
    this.$axiosInstance.defaults.baseURL = this.config.baseUrl;

    if (this.config.authStrategy === "permanentAccessToken") {
      this.logger.debug("Authentication via api key");
      this.$axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Token ${this.config.permanentAccessToken}`;
    }

    if (this.config.authStrategy === "usernamePassword") {
      this.logger.debug(
        "Authentication via username + password. Access tokens will be automatically refreshed"
      );
      this.$axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const status = error.response ? error.response.status : null;
          const isAccessDeniedError = status === 401;

          if (isAccessDeniedError) {
            this.logger.debug(
              `Access denied. New access token will be fetched`
            );

            try {
              const token = await this.tokenService.refreshToken();

              error.config.headers["Authorization"] = "Token " + token;
              error.config.baseURL = undefined;
              return await this.$axiosInstance.request(error.config);
            } catch (err) {
              return await Promise.reject(err);
            }
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
    if (this.config.authStrategy === "usernamePassword") {
      const token = await this.tokenService.getAccessToken();
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
      // const axiosMessage = getAxiosErrorMessage(error);
      this.logger.debug("axiosMessage");
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
    if (this.config.authStrategy === "usernamePassword") {
      const token = await this.tokenService.getAccessToken();
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

  getAxiosInstance(): AxiosInstance {
    return this.$axiosInstance;
  }
}
