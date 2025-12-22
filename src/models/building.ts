export class Building {
  private buildingTypeKey : string;
  private level: number;

  constructor(buildingTypeKey : string) {
    this.buildingTypeKey = buildingTypeKey;
    this.level = 1;
  }
}