import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// 加载环境变量
dotenv.config();

export   class Config {
  private static instance: Config;
  private config: any;

  private constructor() {
    const env = process.env.NODE_ENV || 'development';
    const configPath = path.join(process.cwd(), `config/${env}.json`);
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    

  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get(key: string): any {
    return key.split('.').reduce((o, i) => o?.[i], this.config);
  }
}