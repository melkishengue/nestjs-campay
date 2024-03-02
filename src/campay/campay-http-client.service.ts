import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance, AxiosResponse } from "axios";

import {
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import { getAxiosErrorMessage } from "./utils";

@Injectable()
export class CampayHttpClientService {
  private $instance!: AxiosInstance;
  private readonly logger = new Logger(CampayHttpClientService.name);

  constructor(
    @Inject(INTERNAL_CAMPAY_CONFIG_OPTIONS)
    private readonly config: CampayInternalModuleConfigOptions
  ) {
    this.$instance = axios.create({
      baseURL: this.config.baseUrl
    });

    if (this.config.authStrategy === "apiKey") {
      this.$instance.defaults.headers.common[
        "Authorization"
      ] = `Token ${this.config.apiKey}`;
    }
    this.$instance.defaults.headers["Content-Type"] = "application/json";
    this.$instance.defaults.headers["Accept"] = "application/json";
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
      // fetch access token and update headers
    }

    try {
      const res = await this.$instance.post<
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
      // fetch access token and update headers
    }

    try {
      const res = await this.$instance.get<
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
}
