import { Inject, Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import {
  CampayInternalModuleConfigOptions,
  INTERNAL_CAMPAY_CONFIG_OPTIONS
} from "./types";
import {
  CampayCollectRequest,
  CampayCollectResponse,
  CampayCurrency,
  CampayHistoryEntry,
  CampayQueryHistoryRequest,
  CampayQueryStatusRequest,
  CampayTransaction
} from "./campay.dto";
import { CampayHttpClientService } from "./campay-http-client.service";

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
        amount: params.amount,
        from: params.from,
        external_reference: params.external_reference,
        description: params.description,
        currency: params.currency ?? CampayCurrency.Cfa,
        uuid: params.uuid ?? uuidv4()
      }
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getHistory(
    params: CampayQueryHistoryRequest
  ): Promise<CampayHistoryEntry[]> {
    this.logger.debug(`Querying application history`, params);

    const res = await this.campayHttpClientService.get<
      undefined,
      CampayHistoryEntry[]
    >({
      url: `${this.config.baseUrl}/history/`
    });

    this.logger.debug(`Response: ${JSON.stringify(res.data)}`);

    return res.data;
  }

  async getStatus(
    params: CampayQueryStatusRequest
  ): Promise<CampayTransaction> {
    this.logger.debug(`Checking status of transaction with details`, params);

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
