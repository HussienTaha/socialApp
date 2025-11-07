// const clientIo =io("http://localhost:3000", {
//   auth: {
//     authorization:
//       "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmNiYWFjZjVkZjIzNDdkMmY1YTczNyIsImVtYWlsIjoiaHVzc2llbjExMTEyNThAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjE5Mzg1MDUsImV4cCI6MTc2MTk0MjEwNSwianRpIjoiMDUxYzI4YzItODI4MS00YTM5LTg1YmUtMDVjNzRlNmVkNTdmIn0.EFwUWzunCykqCvO-cEMsMQcIL8HtGatXDWr3kwlZcA8",
//   },
// });
// clientIo.on("connect", () => {
//   console.log("connected to server");
// });
// clientIo.emit("hii", " hello from client side", (data) => {
//   console.log(data);
// });
//  clientIo.on("error", (error) => {
//   console.log(error);
// });
// clientIo.on("disconnect", (data) => {
//   console.log({ data });
// });
// clientIo.on("userDisconnected", (data) => {
//   console.log({ data });
// });