import { EventEmitter } from "events";

export enum IMSEvents {
  JOBS_UPDATE = "jobs_update",
}
class InterModulesCommunicator extends EventEmitter {
  emitJobsUpdate = () => {
    this.emit(IMSEvents.JOBS_UPDATE);
  };
}

const imc = new InterModulesCommunicator();
export default imc;
