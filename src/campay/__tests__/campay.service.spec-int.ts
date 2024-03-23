import { Test } from "@nestjs/testing";
import axios from "axios";
import nock from "nock";

import { CampayModule } from "../campay.module";
import { CampayService } from "../campay.service";
import {
  CampayAccessTokenResponse,
  CampayAirtimeTransferRequest,
  CampayCollectRequest,
  CampayCurrency,
  CampayPaymentLinkRequest,
  CampayQueryStatusRequest
} from "../campay.types";

axios.defaults.adapter = "http";

const CAMPAY_BASE_URL = "https://demo.campay.net";
const ACCESS_TOKEN = "api-key-xxx-yyy";
const USERNAME = "my-store";
const PASSWORD = "secret";
const SAMPLE_REFRESH_TOKEN_RESPONSE: CampayAccessTokenResponse = {
  token: ACCESS_TOKEN,
  expires_in: 3600
};
const SAMPLE_API_RESPONSE = { response: "From Campay" };
axios.defaults.baseURL = CAMPAY_BASE_URL;

describe("Campay service: auth with permanent token", () => {
  const moduleFixture = Test.createTestingModule({
    imports: [
      CampayModule.forRoot({
        permanentAccessToken: ACCESS_TOKEN
      })
    ],
    providers: []
  });

  let campayService: CampayService;

  beforeEach(async () => {
    const module = await moduleFixture.compile();
    campayService = module.get(CampayService);
  });

  it("should correctly query history", async () => {
    const params = {
      start_date: "2024-03-02",
      end_date: "2024-03-05"
    };
    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/history/", {
        ...params
      })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getHistory(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  it("should correctly collect funds", async () => {
    const params: CampayCollectRequest = {
      amount: 100,
      from: "237677777777",
      description: "testing",
      uuid: "uuid-1234"
    };
    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/collect/", {
        ...params,
        currency: params.currency ?? CampayCurrency.Cfa
      })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.collect(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  it("should correctly get balance", async () => {
    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .get("/api/balance/")
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getBalance();

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  it("should correctly transfer airtime", async () => {
    const params: CampayAirtimeTransferRequest = {
      amount: 1000,
      to: "237677777777"
    };

    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/utilities/airtime/transfer/", { ...params })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.airTimeTransfer(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  it("should correctly get payment link", async () => {
    const params: CampayPaymentLinkRequest = {
      amount: 1000,
      description: "a payment by link",
      redirect_url: "https://my-secure-website.com/redirect",
      payment_options: "Card",
      failure_redirect_url: "https://my-secure-website.com/failure-redirect"
    };

    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/get_payment_link/", {
        ...params,
        currency: params.currency ?? CampayCurrency.Cfa
      })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getPaymentLink(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  it("should correctly get status", async () => {
    const params: CampayQueryStatusRequest = {
      reference: "op-ref-1234"
    };

    const scope = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .get("/api/transaction/op-ref-1234")
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getStatus(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scope.done();
  });

  afterAll(() => {
    nock.cleanAll();
  });
});

describe("Campay service: auth with username and password", () => {
  const moduleFixture = Test.createTestingModule({
    imports: [
      CampayModule.forRoot({
        username: USERNAME,
        password: PASSWORD
      })
    ],
    providers: []
  });

  let campayService: CampayService;

  beforeEach(async () => {
    const module = await moduleFixture.compile();
    campayService = module.get(CampayService);
  });

  it("should fetch token and perform action", async () => {
    const params = {
      start_date: "2024-03-02",
      end_date: "2024-03-05"
    };
    const scopeTokenRefresh = nock(CAMPAY_BASE_URL)
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(200, SAMPLE_REFRESH_TOKEN_RESPONSE);

    const scopeGetHistory = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/history/", {
        ...params
      })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getHistory(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scopeTokenRefresh.done();
    scopeGetHistory.done();
  });

  it("should retry fetching the token if some error occurs", async () => {
    const params = {
      start_date: "2024-03-02",
      end_date: "2024-03-05"
    };
    const scopeTokenRefresh = nock(CAMPAY_BASE_URL)
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(503, { message: "Service unavailable" })
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(503, { message: "Service unavailable" })
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(200, SAMPLE_REFRESH_TOKEN_RESPONSE);

    const scopeGetHistory = nock(CAMPAY_BASE_URL, {
      reqheaders: {
        authorization: `Token ${ACCESS_TOKEN}`
      }
    })
      .post("/api/history/", {
        ...params
      })
      .reply(200, SAMPLE_API_RESPONSE);

    const res = await campayService.getHistory(params);

    expect(res).toMatchObject(SAMPLE_API_RESPONSE);
    scopeTokenRefresh.done();
    scopeGetHistory.done();
  });

  it("should throw error if number of retries exceeded", async () => {
    const params = {
      start_date: "2024-03-02",
      end_date: "2024-03-05"
    };
    const scope = nock(CAMPAY_BASE_URL)
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(503, { message: "Service unavailable" })
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(503, { message: "Service unavailable" });

    expect.assertions(1);
    try {
      await campayService.getHistory(params);
    } catch (error) {
      expect(true).toBe(true);
    } finally {
      scope.done();
    }
  });

  it("should not retry fetching access token if credentials are incorrect", async () => {
    const params = {
      start_date: "2024-03-02",
      end_date: "2024-03-05"
    };
    const scope = nock(CAMPAY_BASE_URL)
      .post("/api/token/", {
        username: USERNAME,
        password: PASSWORD
      })
      .reply(400, { message: "credentials" });

    expect.assertions(1);
    try {
      await campayService.getHistory(params);
    } catch (error) {
      expect(true).toBe(true);
    } finally {
      scope.done();
    }
  });
});
