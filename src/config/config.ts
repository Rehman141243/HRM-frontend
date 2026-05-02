// export let environment = "dev";
// // export let environment = "staging";
// // export let environment = "production";

// interface Config {
//   apiUrl: string;
//   identityUrl: string;
//   socketUrl?: string;
//   aiUrl?: string;
// }

// const config: Config = {
//   apiUrl: environment === "production" 
//     ? process.env.NEXT_PUBLIC_API_URL_PROD! 
//     : environment === "staging"
//     ? process.env.NEXT_PUBLIC_API_URL_STAGING!
//     : process.env.NEXT_PUBLIC_API_URL_DEV!,
    
//   identityUrl: environment === "production" 
//     ? process.env.NEXT_PUBLIC_IDENTITY_URL_PROD! 
//     : environment === "staging"
//     ? process.env.NEXT_PUBLIC_IDENTITY_URL_STAGING!
//     : process.env.NEXT_PUBLIC_IDENTITY_URL_DEV!,
    
//   socketUrl: environment === "production" || environment === "staging"
//     ? process.env.NEXT_PUBLIC_SOCKET_URL_PROD 
//     : process.env.NEXT_PUBLIC_SOCKET_URL_DEV,
    
// };

// export default config;