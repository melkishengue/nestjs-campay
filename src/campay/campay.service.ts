import { Inject, Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import {
  CampayAirtimeTransferRequest,
  CampayBalanceResponse,
  CampayCollectRequest,
  CampayCollectResponse,
  CampayCurrency,
  CampayHistoryEntry,
  CampayPaymentLinkRequest,
  CampayPaymentLinkResponse,
  CampayQueryHistoryRequest,
  CampayQueryStatusRequest,
  CampayTransaction,
  CampayWithdrawRequest,
  CampayWithdrawResponse
} from "./campay.types";
import { CampayHttpClientService } from "./campay-http-client.service";
import {
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";

@Injectable()
export class CampayService {
  constructor(
    @Inject(INTERNAL_CAMPAY_CONFIG_OPTIONS)
    private readonly config: CampayInternalModuleConfigOptions,
    private readonly campayHttpClientService: CampayHttpClientService
  ) {}

  private readonly logger = new Logger(CampayService.name);

  async collect(params: CampayCollectRequest): Promise<CampayCollectResponse> {
    this.logger.debug(`Collecting operation is starting with details`, params);

    const res = await this.campayHttpClientService.post<
      CampayCollectRequest,
      CampayCollectResponse
    >({
      url: `${this.config.baseUrl}/collect/`,
      body: {
        ...params,
        currency: params.currency ?? CampayCurrency.Cfa,
        uuid: params.uuid ?? uuidv4()
      }
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getBalance(): Promise<CampayBalanceResponse> {
    this.logger.debug(`Get balance operation is starting with details`);

    const res = await this.campayHttpClientService.get<
      undefined,
      CampayBalanceResponse
    >({
      url: `${this.config.baseUrl}/balance/`
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async withdraw(
    params: CampayWithdrawRequest
  ): Promise<CampayWithdrawResponse> {
    this.logger.debug(`Withdraw operation is starting with details`, params);

    const res = await this.campayHttpClientService.post<
      CampayWithdrawRequest,
      CampayWithdrawResponse
    >({
      url: `${this.config.baseUrl}/withdraw/`,
      body: params
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async airTimeTransfer(
    params: CampayAirtimeTransferRequest
  ): Promise<undefined> {
    this.logger.debug(
      `Transferring airtime operation is starting with details`,
      params
    );

    const res = await this.campayHttpClientService.post<
      CampayAirtimeTransferRequest,
      undefined
    >({
      url: `${this.config.baseUrl}/utilities/airtime/transfer/`,
      body: params
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getPaymentLink(
    params: CampayPaymentLinkRequest
  ): Promise<CampayPaymentLinkResponse> {
    this.logger.debug(
      `Payment link operation is starting with details`,
      params
    );

    const res = await this.campayHttpClientService.post<
      CampayPaymentLinkRequest,
      CampayPaymentLinkResponse
    >({
      url: `${this.config.baseUrl}/get_payment_link/`,
      body: {
        ...params,
        currency: params.currency ?? CampayCurrency.Cfa
      }
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getHistory(
    params: CampayQueryHistoryRequest
  ): Promise<CampayHistoryEntry[]> {
    this.logger.debug(`History operation is starting with details`, params);

    const res = await this.campayHttpClientService.post<
      CampayQueryHistoryRequest,
      CampayHistoryEntry[]
    >({
      url: `${this.config.baseUrl}/history/`,
      body: params
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getStatus(
    params: CampayQueryStatusRequest
  ): Promise<CampayTransaction> {
    this.logger.debug(
      `Status query operation is starting with details`,
      params
    );

    const res = await this.campayHttpClientService.get<
      undefined,
      CampayTransaction
    >({
      url: `${this.config.baseUrl}/transaction/${params.reference}`
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  printConfig() {
    console.log(this.config);
  }
}
