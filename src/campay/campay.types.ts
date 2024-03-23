export enum CampayCurrency {
  Cfa = "XAF"
}

export enum CampayTransactionStatus {
  Failed = "FAILED",
  Successful = "SUCCESSFUL",
  Pending = "PENDING"
}

export enum CampayOperator {
  MTN = "MTN",
  Orange = "ORANGE"
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

export interface CampayPaymentLinkRequest {
  amount: number;
  description: string;
  redirect_url: string;
  payment_options: string;
  failure_redirect_url: string;
  external_reference?: string;
  currency?: CampayCurrency;
  uuid?: string;
  from?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface CampayBalanceResponse {
  total_balance: number;
  mtn_balance: number;
  orange_balance: number;
  currency: CampayCurrency;
}

export interface CampayPaymentLinkResponse {
  link: string;
}

export interface CampayWithdrawRequest {
  amount: number;
  to: string;
  description: string;
  external_reference?: string;
}

export interface CampayWithdrawResponse {
  reference: string;
}

export interface CampayAccessTokenResponse {
  token: string;
  expires_in: number;
}

export interface CampayQueryStatusRequest {
  reference: string;
}

export interface CampayTransaction {
  reference: string;
  status: CampayTransactionStatus;
  amount: string;
  currency?: CampayCurrency;
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

export interface CampayQueryHistoryRequest {
  start_date: string;
  end_date: string;
}

export interface CampayHistoryEntry {
  datetime: string;
  code: string;
  operator_tx_code: string;
  operator: CampayOperator;
  phone_number: string;
  description: string;
  external_user: "";
  amount: number;
  charge_amount: number;
  debit: number;
  credit: number;
  status: CampayTransactionStatus;
  reference_uuid: string;
}

export interface CampayAirtimeTransferRequest {
  amount: number;
  to: string;
  external_reference?: string;
}
