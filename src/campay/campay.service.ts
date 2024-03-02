import { Inject, Injectable } from "@nestjs/common";
import { CAMPAY_CONFIG_OPTIONS, CampayModuleConfigOptions } from "./types";

@Injectable()
export class CampayService {
  constructor(
    @Inject(CAMPAY_CONFIG_OPTIONS)
    private readonly moduleOptions: CampayModuleConfigOptions
  ) {}

  printConfig() {
    console.log(this.moduleOptions);
  }
}
