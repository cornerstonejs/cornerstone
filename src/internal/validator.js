
/**
 * Check if the supplied parameter is undefined and throws and error
 * @param {any} checkParam the parameter to validate for undefined
 * @param {any} errorMsg the error message to be thrown
 * @returns {void}
 * @memberof internal
 */
export function validateParameterUndefined (checkParam, errorMsg) {
  if (checkParam === undefined) {
    throw new Error(errorMsg);
  }
}


/**
 * Check if the supplied parameter is undefined or null and throws and error
 * @param {any} checkParam the parameter to validate for undefined
 * @param {any} errorMsg the error message to be thrown
 * @returns {void}
 * @memberof internal
 */
export function validateParameterUndefinedOrNull (checkParam, errorMsg) {
  if (checkParam === undefined || checkParam === null) {
    throw new Error(errorMsg);
  }
}
