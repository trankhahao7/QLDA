import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "d6dac1af-f497-4c07-a2c6-a6032eebd9b4",
    authority: "https://login.microsoftonline.com/42350984-d0f6-4a38-978a-aa84e495e429",
    redirectUri: "http://localhost:5173/login",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "email", "openid", "profile"],
};
