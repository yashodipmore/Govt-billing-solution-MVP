import { Preferences } from "@capacitor/preferences";

export class File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;

  constructor(
    created: string,
    modified: string,
    content: string,
    name: string,
    billType: number
  ) {
    this.created = created;
    this.modified = modified;
    this.content = content;
    this.name = name;
    this.billType = billType;
  }
}

export class Local {
  _saveFile = async (file: File) => {
    let data = {
      created: file.created,
      modified: file.modified,
      content: file.content,
      name: file.name,
      billType: file.billType,
    };
    await Preferences.set({
      key: file.name,
      value: JSON.stringify(data),
    });
  };

  _getFile = async (name: string) => {
    const rawData = await Preferences.get({ key: name });
    return JSON.parse(rawData.value);
  };

  _getAllFiles = async () => {
    let arr = {};
    const { keys } = await Preferences.keys();
    for (let i = 0; i < keys.length; i++) {
      let fname = keys[i];
      const data = await this._getFile(fname);
      arr[fname] = (data as any).modified;
    }
    return arr;
  };

  _deleteFile = async (name: string) => {
    await Preferences.remove({ key: name });
  };

  _checkKey = async (key: string) => {
    const { keys } = await Preferences.keys();
    if (keys.includes(key, 0)) {
      return true;
    } else {
      return false;
    }
  };

  // Method to get list of all saved file names
  getFileList = async (): Promise<string[]> => {
    try {
      const { keys } = await Preferences.keys();
      // Filter out any non-file keys if needed
      return keys.filter(key => {
        // You can add additional filtering logic here if needed
        // For now, return all keys as they should be file names
        return true;
      });
    } catch (error) {
      console.error('Error getting file list:', error);
      return [];
    }
  };

  // Method to get content of a specific file
  getFileContent = async (fileName: string): Promise<string | null> => {
    try {
      const fileData = await this._getFile(fileName);
      if (fileData && fileData.content) {
        return fileData.content;
      }
      return null;
    } catch (error) {
      console.error('Error getting file content for:', fileName, error);
      return null;
    }
  };
}
