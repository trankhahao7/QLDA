import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "22761552-d913-4b03-8db9-30bbe55c7742",
    authority: "https://login.microsoftonline.com/42350984-d0f6-4a38-978a-aa84e495e429",
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "email", "openid", "profile"],
};
