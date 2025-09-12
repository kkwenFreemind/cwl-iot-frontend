import request from "@/utils/request";

const FileAPI = {
  /** 上傳檔案 */
  upload(formData: FormData) {
    return request<any, FileInfo>({
      url: "/api/v1/files",
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 上傳檔案（傳入 File） */
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, FileInfo>({
      url: "/api/v1/files",
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 刪除檔案 */
  delete(filePath?: string) {
    return request({
      url: "/api/v1/files",
      method: "delete",
      params: { filePath },
    });
  },

  /** 下載檔案 */
  download(url: string, fileName?: string) {
    return request({
      url,
      method: "get",
      responseType: "blob",
    }).then((res) => {
      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      const urlObject = window.URL.createObjectURL(blob);
      a.href = urlObject;
      a.download = fileName || "下載檔案";
      a.click();
      window.URL.revokeObjectURL(urlObject);
    });
  },
};

export default FileAPI;

export interface FileInfo {
  name: string;
  url: string;
}
