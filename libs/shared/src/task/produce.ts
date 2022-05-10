import 'dotenv/config';
import { ControllerBase, ControllerBaseInterface } from "../common/controller"
import { utilsDelay } from "../utils/utils"


export class ProduceTask extends ControllerBase {

    public TestTaskVal = 0;

    constructor(bootstrap: ControllerBaseInterface) {
      super(bootstrap);
      this.initial();
    }
  
    private async initial() {
      this.TestTaskVal = 0;
    }
  
    public register() {
      return this.registerExec.bind(this);
    }
  
    private async registerExec() {
      this.TestTaskVal++;
    }
  
    public run() {
      return this.runExec.bind(this);
    }
  
    private async runExec() {
      await utilsDelay(1000);
      console.log("TestTaskVal runExec:> ", this.TestTaskVal);
      // throw Error("异常");
    }
  

}