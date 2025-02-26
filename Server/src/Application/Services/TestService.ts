import { ITestService } from "./Interfaces/ITestService";










export default class TestService implements ITestService {
  
  private list: string [] = [
    "Gabriel",
    "Andrés",
    "Abel",
    "Joel"
  ]

  public GetAll () : string[] {
    return this.list;
  };

}