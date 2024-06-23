export class BaseDTO {
  constructor(json: object) {
    if (json) {
      Object.assign(this, json);
    }
  }
}
