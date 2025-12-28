import type { Resources } from "./resources";

export interface Civilisation {
  name: string;
  resources: Resources;
  populationCapacity: number;
  workingPopulation: number;
  armyCapacity: number;
}
