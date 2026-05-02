// config.js

//let environment = "dev";
// let environment = "staging";
 let environment = "production";

 const config = {
  apiUrl:
    environment === "production"
      ? process.env.NEXT_PUBLIC_API_URL
      : environment === "staging"
      ? process.env.NEXT_PUBLIC_API_URL_STAGING
      : process.env.NEXT_PUBLIC_API_URL_DEV,

  
};

export default config;