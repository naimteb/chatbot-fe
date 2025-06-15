import axios from "axios";

// Create a custom instance   to applies DRY pattern so every time we need to create an endpoint no need to ("https://local...")
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

// Attach Authorization header to every request
axiosInstance.interceptors.request.use((config) => {
  // interceptors allow to inject logic before the request is sent ///
  //  here we are mod the config object

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  /** this is the config looks like after the mod
 *  {
  url: "/chat",
  method: "post",
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  data: {
    request: "Hello",
    
    session_id: "abc123"
  },
 */
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // If response is OK, return it
  async (error) => {
    // this runs only if the server responds with an error 401 unauthorized
    //and it is async beacuse inside we are calling an http request to refresh the token

    const originalRequest = error.config;
    // error.config is the original request that failed (got rejected)
    //we store it (for example we are requesting to /chat and accesstoken expired so we save what was the
    // request { url: "/chat", headers: {...}, data: {...} } ) this allows us to replay that request with a new token

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if the response is a 401 AND this is the first retry
      //  (!originalRequest._retry prevents infinite loops) we marked the request as retired as a first time
      // so if the refreshed token still doesn't work and the server returns 401 again, we don’t retry again.
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post("http://localhost:8080/token", {
          token: refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        // Save the new token

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
        //
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
