import { ITestService } from "./Interfaces/ITestService";










export default class TestService implements ITestService {
  
  public GetAll = () : string[] =>  {

    return  [
      "Gabriel",
      "Andrés",
      "Abel",
      "Joel"
    ];; 
  };

}