

/**
 * @returns The value that should be set in the `Authorization` header of requests to the backend, or `null` if no authorization is provided.
 */
export function getAuthHeader(): string | null {
  //TODO: implement this function
  return null; 
}

/**
 * Sets the authorization key to be used in the `Authorization` header of requests to the backend. Should just get the key from the backend.
 * @param _authKey The authorization key to set, or `null` to clear the key.
 */
export function setAuthKey(_authKey: string | null): void { // eslint-disable-line @typescript-eslint/no-unused-vars

}
