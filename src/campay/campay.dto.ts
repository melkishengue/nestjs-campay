export enum CampayCurrency {
  cfa = "XAF"
}

export interface CampayCollectResponse {
  reference: string;
  operator: string;
  ussd_code: string;
}

export interface CampayCollectRequest {
  amount: number;
  from: string;
  description: string;
  external_reference?: string;
  currency?: CampayCurrency;
  uuid?: string;
}

export interface CampayQueryStatusRequest {
  reference: string;
}

export interface CampayTransaction {
  reference: string;
  status: string;
  amount: string;
  currency: string;
  operator: string;
  code: string;
  operator_reference: string;
  endpoint: string;
  signature: string;
  external_reference: string;
  external_user: string;
  app_amount: string;
  reason?: string;
}
