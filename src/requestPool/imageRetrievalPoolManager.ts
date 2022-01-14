import { RequestPoolManager } from './RequestPoolManager.ts'

// Retrieval (usually) === XHR requests
const imageRetrievalPoolManager = new RequestPoolManager()

imageRetrievalPoolManager.maxNumRequests = { interaction: 20, thumbnail: 20, prefetch: 20 };
imageRetrievalPoolManager.grabDelay = 0;

export default imageRetrievalPoolManager
