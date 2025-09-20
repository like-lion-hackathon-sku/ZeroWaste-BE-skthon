import dotenv from "dotenv";
import { setupSwagger } from "./config/swagger.js";
import { setupCommonError, setupExpress } from "./config/express.js";
import router from "./router/router.js";
import { initS3 } from "./config/s3.js";

dotenv.config();

const app = setupExpress();
const port = process.env.PORT;

/**
 *  AWS S3 설정
 */
export const s3 = initS3();

setupSwagger(app);
app.use("/api", router); // 라우터 설정`
setupCommonError(app);
app.listen(port, () => {
  console.log(`서버 열림 - 포트 : ${port}`);
});
