import axios from "axios";

// console.log(process.env.NEXT_PUBLIC_API_URL, 'hello')

// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
//   allowedHeaders: ["Content-Type", "Authorization"]
// });


// // axiosInstance.interceptors.request.use(

//   //   (config) => {
//   //     const token = localStorage.getItem("token"); // or cookies
  
//   //     if (token) {
//   //       config.headers.Authorization = `Bearer ${token}`;
//   //     }
  
//   //     return config;
//   //   },
//   //   (error) => Promise.reject(error)
//   // );
//   // axiosInstance.interceptors.response.use(
//   //   (response) => response,
//   //   (error) => {
//   //     if (error.response?.status === 401) {
//   //       console.log("Unauthorized - redirect to login");
//   //       // redirect or logout
//   //     }
  
//   //     return Promise.reject(error);
//   //   }
//   // );



//   // axiosInstance.js
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Guard against SSR
//     if (typeof window === "undefined") return config;
    
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Also handle 401 properly
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         window.location.href = "/login"; // relative, works on any host
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config;
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const message = error?.response?.data?.message || error?.message || "Something went wrong";
      window.dispatchEvent(new CustomEvent("app:error", { detail: { message } }));
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;