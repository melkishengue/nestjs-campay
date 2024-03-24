import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance, AxiosResponse } from "axios";

import { CampayAccessTokenResponse } from "./campay.types";
import {
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import { getAxiosErrorMessage } from "./utils";

@Injectable()
export class TokenService {
  private accessToken!: string;
  private readonly $AxiosInstance!: AxiosInstance;
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @Inject(INTERNAL_CAMPAY_CONFIG_OPTIONS)
    private readonly config: CampayInternalModuleConfigOptions
  ) {
    this.$AxiosInstance = axios.create({
      baseURL: this.config.baseUrl
    });

    this.$AxiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response ? error.response.status : null;
        const nbPreviousRetries =
          Number(error.config.headers["X-jwt-retries"] || 0) || 0;
        const isWrongCredentialsError =
          status === 400 &&
          error.response?.data?.non_field_errors?.[0]?.includes("credentials");

        if (
          !isWrongCredentialsError &&
          nbPreviousRetries < this.config.nbRefreshTokenRetries
        ) {
          this.logger.debug(
            `Fetching access token has failed, retrying [${nbPreviousRetries}]`
          );

          error.config.headers["X-jwt-retries"] = nbPreviousRetries + 1;
          try {
            return await this.$AxiosInstance.request(error.config);
          } catch (err) {
            return await Promise.reject(err);
          }
        } else {
          this.logger.debug(
            "Provided credentials are wrong. Refreshing the access token will not be retried. Aborting"
          );
        }

        return Promise.reject(error);
      }
    );
  }

  async getAccessToken() {
    if (!this.accessToken) {
      return this.refreshToken();
    }

    return this.accessToken;
  }

  async refreshToken(): Promise<string> {
    try {
      this.logger.debug(`Fetching new access token`);
      const response = await this.$AxiosInstance.post<
        unknown,
        AxiosResponse<CampayAccessTokenResponse>
      >(`${this.config.baseUrl}/token/`, {
        username: this.config.username,
        password: this.config.password
      });

      const token = response.data.token;
      this.accessToken = token;
      return token;
    } catch (error) {
      const campayResponse = getAxiosErrorMessage(error);
      this.logger.error(
        `Error while refreshing access token. Response: ${JSON.stringify(
          campayResponse
        )}`
      );
      throw error;
    }
  }
}
