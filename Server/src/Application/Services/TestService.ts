import { ITestService } from "./Interfaces/ITestService";



export default class TestService implements ITestService {

	private list: string[] = [
		"Gabriel",
		"Andrés",
		"Abel",
		"Joel"
	]

	public async GetAll(): Promise<string[]> {
		return this.list;
	};

}