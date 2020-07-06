import { readFileSync } from "fs";
import { join, resolve } from "path";

export default class FileJsonImport {
  static async getJson(folderAndFileName) {
    const __dirname = resolve();
    const path = join(__dirname, folderAndFileName);    
    const result = await readFileSync(path, { encoding: 'utf-8'});
    const data = JSON.parse(result);
    return data;
  }
}