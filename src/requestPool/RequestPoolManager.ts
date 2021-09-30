type AdditionalDetails = {
    imageId?: string
    volumeUID?: string
  }
  
  type RequestDetailsInterface = {
    requestFn: () => Promise<void>
    type: string
    additionalDetails: AdditionalDetails
  }
  
  type RequestPool = {
    interaction: { [key: number]: [] }
    thumbnail: { [key: number]: [] }
    prefetch: { [key: number]: [] }
  }

  class RequestPoolManager {
    // priority is fixed for interaction and thumbnail to be 0, however,
    // the priority of prefetch can be configured and it can have priorities other
    // than 0 (highest priority)

    // TODO: Some of this stuff shouldn't be public but it's easier right now
    private requestPool: RequestPool;
    private awake: boolean;
    private numRequests: {
      interaction: number;
      thumbnail: number;
      prefetch: number;
    };
    public maxNumRequests: {
      interaction: number;
      thumbnail: number;
      prefetch: number;
    };
    public grabDelay: number;
    private timeoutHandle: number;

    constructor() {
      this.requestPool = {
        interaction: { 0: [] },
        thumbnail: { 0: [] },
        prefetch: { 0: [] },
      };

      this.awake = false;
      this.grabDelay = 5;

      this.numRequests = {
        interaction: 0,
        thumbnail: 0,
        prefetch: 0,
      };

      this.maxNumRequests = {
        interaction: 6,
        thumbnail: 6,
        prefetch: 5,
      };
    }

    destroy() {
      if (this.timeoutHandle) {
        window.clearTimeout(this.timeoutHandle);
      }
    }

    /**
     * Adds the requests to the pool of requests.
     *
     * @param requestFn - A function that returns a promise which resolves in the image
     * @param type - Priority category, it can be either of interaction, prefetch,
     * or thumbnail.
     * @param additionalDetails - Additional details that requests can contain.
     * For instance the volumeUID for the volume requests
     * @param priority - Priority number for each category of requests. Its default
     * value is priority 0. The lower the priority number, the higher the priority number
     *
     * @returns void
     *
     */
    addRequest(
      requestFn: () => Promise<void>,
      type: string,
      additionalDetails: Record<string, unknown>,
      priority = 0,
      addToBeginning = false
    ): void {
      // Describe the request
      const requestDetails: RequestDetailsInterface = {
        requestFn,
        type,
        additionalDetails,
      };

      // Check if the priority group exists on the request type
      if (this.requestPool[type][priority] === undefined) {
        this.requestPool[type][priority] = [];
      }

      // Adding the request to the correct priority group of the request type
      if (addToBeginning) {
        // Add it to the beginning of the stack
        this.requestPool[type][priority].unshift(requestDetails);
      } else {
        // Add it to the end of the stack
        this.requestPool[type][priority].push(requestDetails);
      }

      // Wake up
      if (!this.awake) {
        this.awake = true;
        this.startGrabbing();
      }
    }

    /**
     * Filter the requestPoolManager's pool of request based on the result of
     * provided filter function. The provided filter function needs to return false or true
     *
     * @param filterFunction The filter function for filtering of the requests to keep
     * @category requestPool
     */
    filterRequests(
      filterFunction: (requestDetails: RequestDetailsInterface) => boolean
    ): void {
      Object.keys(this.requestPool).forEach((type: string) => {
        const requestType = this.requestPool[type];
        Object.keys(requestType).forEach((priority) => {
          requestType[priority] = requestType[priority].filter(
            (requestDetails: RequestDetailsInterface) => {
              return filterFunction(requestDetails);
            }
          );
        });
      });
    }

    /**
     * Clears the requests specific to the provided type. For instance, the
     * pool of requests of type 'interaction' can be cleared via this function.
     *
     *
     * @param type category of the request (either interaction, prefetch or thumbnail)
     * @category requestPool
     */
    clearRequestStack(type: string): void {
      if (!this.requestPool[type]) {
        throw new Error(`No category for the type ${type} found`);
      }
      this.requestPool[type] = { 0: [] };
    }

    sendRequest({ requestFn, type }: RequestDetailsInterface) {
      // Increment the number of current requests of this type
      this.numRequests[type]++;
      this.awake = true;

      requestFn().finally(() => {
        this.numRequests[type]--;

        this.startAgain();
      });
    }

    startGrabbing(): void {
      // Begin by grabbing X images

      // TODO: This is the reason things aren't going as fast as expected
      // const maxSimultaneousRequests = getMaxSimultaneousRequests()
      // this.maxNumRequests = {
      //   interaction: Math.max(maxSimultaneousRequests, 1),
      //   thumbnail: Math.max(maxSimultaneousRequests - 2, 1),
      //   prefetch: Math.max(maxSimultaneousRequests - 1, 1),
      // }

      const maxRequests =
        this.maxNumRequests.interaction +
        this.maxNumRequests.thumbnail +
        this.maxNumRequests.prefetch;
      const currentRequests =
        this.numRequests.interaction +
        this.numRequests.thumbnail +
        this.numRequests.prefetch;
      const requestsToSend = maxRequests - currentRequests;
      for (let i = 0; i < requestsToSend; i++) {
        const requestDetails = this.getNextRequest();
        if (requestDetails === false) {
          break;
        } else if (requestDetails) {
          this.sendRequest(requestDetails);
        }
      }
    }

    startAgain(): void {
      if (!this.awake) {
        return;
      }

      if (this.grabDelay) {
        this.timeoutHandle = window.setTimeout(() => {
          this.startGrabbing();
        }, this.grabDelay);
      } else {
        this.startGrabbing();
      }
    }

    getSortedPriorityGroups(type: string): Array<number> {
      const priorities = Object.keys(this.requestPool[type])
        .map(Number)
        .filter((priority) => this.requestPool[type][priority].length)
        .sort();
      return priorities;
    }

    getNextRequest(): RequestDetailsInterface | false {
      const interactionPriorities = this.getSortedPriorityGroups('interaction');
      for (const priority of interactionPriorities) {
        if (
          this.requestPool.interaction[priority].length &&
          this.numRequests.interaction < this.maxNumRequests.interaction
        ) {
          return this.requestPool.interaction[priority].shift();
        }
      }
      const thumbnailPriorities = this.getSortedPriorityGroups('thumbnail');
      for (const priority of thumbnailPriorities) {
        if (
          this.requestPool.thumbnail[priority].length &&
          this.numRequests.thumbnail < this.maxNumRequests.thumbnail
        ) {
          return this.requestPool.thumbnail[priority].shift();
        }
      }
      const prefetchPriorities = this.getSortedPriorityGroups('prefetch');
      for (const priority of prefetchPriorities) {
        if (
          this.requestPool.prefetch[priority].length &&
          this.numRequests.prefetch < this.maxNumRequests.prefetch
        ) {
          return this.requestPool.prefetch[priority].shift();
        }
      }

      if (
        !interactionPriorities.length &&
        !thumbnailPriorities.length &&
        !prefetchPriorities.length
      ) {
        this.awake = false;
      }
      return false;
    }

    /**
     * Returns the request pool containing different categories, their priority and
     * the added request details.
     *
     * @returns
     * @category requestPool
     */
    getRequestPool(): RequestPool {
      return this.requestPool;
    }
  }
  

  export { RequestPoolManager }
  