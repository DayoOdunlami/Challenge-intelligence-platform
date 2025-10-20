import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

export class FileStorage {
  async ensureDataDir() {
    try {
      await fs.access(DATA_DIR)
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true })
    }
  }

  async savePromptConfig(config: any) {
    await this.ensureDataDir()
    const filePath = path.join(DATA_DIR, "prompt-config.json")
    await fs.writeFile(filePath, JSON.stringify(config, null, 2))
    return config
  }

  async getPromptConfig() {
    try {
      const filePath = path.join(DATA_DIR, "prompt-config.json")
      const data = await fs.readFile(filePath, "utf-8")
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async saveConversation(conversation: any) {
    await this.ensureDataDir()
    const filePath = path.join(DATA_DIR, "conversations.jsonl")
    const line = JSON.stringify(conversation) + "\n"
    await fs.appendFile(filePath, line)
    return conversation
  }
}
