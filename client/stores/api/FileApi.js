import * as request from '../../utils/requester';

export default new class FileApi {
  upload(path, files) {
    return request.postAsync(`upload/${path}`, 'files', {files})
  }

  // /delfile/<string:path>/<string:filename>
  delete(filename) {
    return request.postAsync(`/delfile/${filename}`)
  }
}
