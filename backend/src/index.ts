import dotenv from "dotenv";
import { DEFAULTS } from "./config";
import app from "./app";

dotenv.config();

app.listen(DEFAULTS.PORT, () => {
  console.log("Server is running on port " + DEFAULTS.PORT);
});
